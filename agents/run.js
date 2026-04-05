#!/usr/bin/env node
// DOGWALKPOOPOO — Agent Orchestrator
//
// Usage:
//   node agents/run.js                     # run all editors + head editor
//   node agents/run.js --category film     # run one editor only (skip head editor)
//   node agents/run.js --head-only         # head editor reviews existing pitches
//   node agents/run.js --dry-run           # don't write to posts.json

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { runEditorAgent } from './editor-agent.js';
import { runHeadEditorAgent } from './head-editor-agent.js';
import { EDITOR_PROMPTS } from './prompts.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const POSTS_FILE = resolve(ROOT, 'data', 'posts.json');

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const categoryArg = args.includes('--category')
  ? args[args.indexOf('--category') + 1]
  : null;
const headOnly = args.includes('--head-only');
const dryRun = args.includes('--dry-run');

// ── Helpers ───────────────────────────────────────────────────────────────────
function loadPosts() {
  try {
    const raw = readFileSync(POSTS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { posts: [] };
  }
}

function savePosts(data) {
  if (dryRun) {
    console.log('\n[DRY RUN] Would write to posts.json:');
    console.log(JSON.stringify(data, null, 2).slice(0, 800) + '...');
    return;
  }
  writeFileSync(POSTS_FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\n✓ Saved ${data.posts.length} posts to data/posts.json`);
}

function log(label, msg) {
  const time = new Date().toLocaleTimeString('ko-KR');
  console.log(`[${time}] ${label}: ${msg}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🐕 DOGWALKPOOPOO — Agent Pipeline\n');

  const db = loadPosts();
  const allPosts = db.posts || [];

  const publishedPosts = allPosts.filter(p => p.status === 'published');
  const existingPitches = allPosts.filter(p => p.status === 'pitched');
  const existingTitles = publishedPosts.map(p => p.title);

  // ── 1. Run editor agents ───────────────────────────────────────────────────
  const newPitches = [];

  if (!headOnly) {
    const categoriesToRun = categoryArg
      ? [categoryArg]
      : Object.keys(EDITOR_PROMPTS);

    console.log(`Running ${categoriesToRun.length} editor agent(s)...\n`);

    for (const cat of categoriesToRun) {
      log(cat, 'starting...');
      try {
        const pitch = await runEditorAgent(cat, existingTitles);
        newPitches.push(pitch);
        log(cat, `✓ pitched: "${pitch.title}"`);
        log(cat, `  source: ${pitch.source}`);
      } catch (err) {
        log(cat, `✗ ERROR: ${err.message}`);
      }
    }

    if (newPitches.length === 0) {
      console.log('\nNo pitches generated. Exiting.');
      return;
    }
  }

  // ── 2. Collect all pitches for head editor ─────────────────────────────────
  const pitchesToReview = [
    ...existingPitches,   // already in the file, not yet reviewed
    ...newPitches,        // freshly generated
  ];

  // Single category run: just save the pitch, skip head editor
  if (categoryArg && !headOnly) {
    const updated = {
      posts: [
        ...allPosts,
        ...newPitches,
      ]
    };
    savePosts(updated);
    console.log(`\n✓ Pitch saved. Run without --category to trigger head editor review.`);
    return;
  }

  if (pitchesToReview.length === 0) {
    console.log('\nNo pitches to review. Run editors first.');
    return;
  }

  // ── 3. Head editor review ──────────────────────────────────────────────────
  console.log(`\n📋 Head editor reviewing ${pitchesToReview.length} pitch(es)...\n`);

  let headResult;
  try {
    headResult = await runHeadEditorAgent(pitchesToReview, publishedPosts);
  } catch (err) {
    console.error('Head editor failed:', err.message);
    // Save pitches anyway so they can be reviewed manually
    const updated = {
      posts: [
        ...allPosts.filter(p => p.status !== 'pitched'), // remove old pitched
        ...pitchesToReview,
        ...newPitches.filter(p => !pitchesToReview.includes(p)),
      ]
    };
    savePosts(updated);
    return;
  }

  // ── 4. Apply decisions ─────────────────────────────────────────────────────
  console.log('\n📝 Head editor decisions:\n');

  const decisionMap = Object.fromEntries(
    headResult.decisions.map(d => [d.postId, d])
  );

  // Build updated pitch list
  const updatedPitches = pitchesToReview.map(pitch => {
    const d = decisionMap[pitch.id];
    if (!d) {
      // No decision made — keep as pitched
      return pitch;
    }

    const statusMap = { approve: 'published', revise: 'revision', reject: 'rejected' };
    const newStatus = statusMap[d.decision] || 'pitched';

    const icon = { approve: '✓', revise: '↩', reject: '✗' }[d.decision];
    console.log(`  ${icon} [${pitch.category}] "${pitch.title}"`);
    console.log(`    → ${d.decision.toUpperCase()}: ${d.note}\n`);

    return {
      ...pitch,
      status: newStatus,
      featured: newStatus === 'published' && d.featured === true,
      headNote: d.note,
      publishedAt: newStatus === 'published' ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };
  });

  if (headResult.editorialNote) {
    console.log(`\n📌 Editorial note: ${headResult.editorialNote}\n`);
  }

  // ── 5. Write final state ───────────────────────────────────────────────────
  // Keep existing non-pitched posts, replace all pitched with updated versions
  const existingNonPitched = allPosts.filter(p => p.status !== 'pitched');

  const finalPosts = {
    posts: [
      ...existingNonPitched,
      ...updatedPitches,
    ]
  };

  const published = updatedPitches.filter(p => p.status === 'published').length;
  const revised = updatedPitches.filter(p => p.status === 'revision').length;
  const rejected = updatedPitches.filter(p => p.status === 'rejected').length;

  console.log(`Summary: ${published} published, ${revised} need revision, ${rejected} rejected`);

  savePosts(finalPosts);
}

main().catch(err => {
  console.error('\n✗ Fatal error:', err);
  process.exit(1);
});
