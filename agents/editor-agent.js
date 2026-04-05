// DOGWALKPOOPOO — Editor AI Agent
// Each category editor browses its source list via web_search,
// finds one real overlooked thing, and pitches it.

import Anthropic from '@anthropic-ai/sdk';
import { EDITOR_PROMPTS } from './prompts.js';
import { SOURCES, buildSearchQueries, getSourceList } from './sources.js';

const client = new Anthropic();

// JSON schema for a pitch
const PITCH_SCHEMA = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: '한국어 제목. 짧고 구체적으로. 설명하지 말고 이름을 지어라.'
    },
    titleEn: {
      type: 'string',
      description: 'English title. Short and specific.'
    },
    source: {
      type: 'string',
      description: '출처. URL, 영화명, 작가명, 작품명, 장소. 실제로 찾은 것을 정확하게.'
    },
    sourceUrl: {
      type: 'string',
      description: '원본 URL. 찾은 페이지나 작품의 실제 URL. 없으면 빈 문자열.'
    },
    description: {
      type: 'string',
      description: '한국어 설명. 왜 이것이 여기에 있어야 하는지. 아름답다고 말하지 말고, 왜 멈추게 되는지를 써라. 2-4문장.'
    },
    descriptionEn: {
      type: 'string',
      description: "English description. Same approach — describe what stops you, not why it's beautiful. 2-4 sentences."
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      description: '태그 3-5개. 소문자 영어. 장르/분위기/소재.'
    },
    pitchNote: {
      type: 'string',
      description: '헤드 에디터에게 보내는 메모. 어떤 소스에서 찾았는지. 왜 유명하지 않은지. 1-2문장.'
    }
  },
  required: ['title', 'titleEn', 'source', 'sourceUrl', 'description', 'descriptionEn', 'tags', 'pitchNote'],
  additionalProperties: false
};

/**
 * Run one editor agent for the given category.
 * The agent browses its source list via web_search, finds one real thing,
 * then produces a structured pitch.
 *
 * @param {string} category
 * @param {string[]} existingTitles - Already-published titles to avoid
 * @returns {Promise<Object>} pitch
 */
export async function runEditorAgent(category, existingTitles = []) {
  const config = EDITOR_PROMPTS[category];
  if (!config) throw new Error(`Unknown category: ${category}`);

  const sources = getSourceList(category);
  const queries = buildSearchQueries(category);

  const sourceBlock = sources.map(s =>
    `- ${s.name} (${s.url}) — ${s.note}`
  ).join('\n');

  const queryBlock = queries.map(q => `- "${q}"`).join('\n');

  const avoidBlock = existingTitles.length > 0
    ? `\nAlready published — do NOT pitch these or anything similar:\n${existingTitles.map(t => `- ${t}`).join('\n')}\n`
    : '';

  const userPrompt = `Use the web_search tool to browse your source list and find one thing to pitch.

YOUR SOURCES — start here:
${sourceBlock}

SEARCH QUERIES to try if sources don't yield something:
${queryBlock}
${avoidBlock}
WHAT YOU'RE LOOKING FOR:
- Something specific and real — not hypothetical, not paraphrased
- Something genuinely overlooked — not in the canon, not viral, not famous
- Something you can link to or cite precisely
- Recent discoveries are better, but timeless finds are fine too

HOW TO SEARCH:
1. Pick 2-3 of your primary sources and search them
2. If nothing interesting, try the search queries
3. When you find a candidate, verify it's real and not famous
4. Then produce your pitch as JSON

Be concrete. "The way light enters parking structures" is not enough.
"The top floor of the Barbican car park, documented in this specific post" is right.`;

  // Two-phase approach:
  // Phase 1: agent browses with web_search (agentic loop)
  // Phase 2: structured JSON output from what was found

  // ── Phase 1: browse ──────────────────────────────────────────────────────
  const messages = [{ role: 'user', content: userPrompt }];
  let browseResult = null;

  // Agentic loop — agent searches until it finds something or gives up
  for (let turn = 0; turn < 8; turn++) {
    const resp = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      system: config.systemPrompt,
      messages,
      tools: [
        { type: 'web_search_20260209', name: 'web_search' },
        { type: 'web_fetch_20260209',  name: 'web_fetch'  },
      ],
    });

    messages.push({ role: 'assistant', content: resp.content });

    if (resp.stop_reason === 'end_turn') {
      // Agent finished browsing — extract its findings as text
      browseResult = resp.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('\n');
      break;
    }

    if (resp.stop_reason === 'tool_use') {
      // Collect all tool_result blocks and continue
      const toolResults = resp.content
        .filter(b => b.type === 'tool_use')
        .map(b => ({
          type: 'tool_result',
          tool_use_id: b.id,
          content: `[Tool ${b.name} executed — results provided by server]`,
        }));

      messages.push({ role: 'user', content: toolResults });
      continue;
    }

    // pause_turn: re-send to continue server-side loop
    if (resp.stop_reason === 'pause_turn') {
      continue;
    }

    break;
  }

  if (!browseResult) {
    throw new Error(`${category} editor did not complete browse phase`);
  }

  // ── Phase 2: structure ───────────────────────────────────────────────────
  const structureResp = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: config.systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Based on your research, produce the final pitch as JSON.\n\nYour findings:\n${browseResult}`,
      }
    ],
    output_config: {
      format: { type: 'json_schema', schema: PITCH_SCHEMA }
    }
  });

  const textBlock = structureResp.content.find(b => b.type === 'text');
  if (!textBlock) throw new Error(`No structured output from ${category} editor`);

  const pitch = JSON.parse(textBlock.text);

  return {
    id: `${category}-${Date.now()}`,
    status: 'pitched',
    featured: false,
    category,
    editorId: `${category}-agent`,
    date: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...pitch,
  };
}
