// DOGWALKPOOPOO — Head Editor AI Agent
// Reviews all pitched posts and makes editorial decisions.

import Anthropic from '@anthropic-ai/sdk';
import { HEAD_EDITOR_PROMPT } from './prompts.js';

const client = new Anthropic();

const DECISION_SCHEMA = {
  type: 'object',
  properties: {
    decisions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          postId: { type: 'string' },
          decision: {
            type: 'string',
            enum: ['approve', 'revise', 'reject']
          },
          note: {
            type: 'string',
            description: '에디터에게 전달되는 메모. 승인이면 무엇이 작동하는지, 수정이면 구체적인 방향, 반려면 이유와 더 나은 버전의 방향.'
          },
          featured: {
            type: 'boolean',
            description: 'true if this piece should be featured (homepage hero). At most one per run.'
          }
        },
        required: ['postId', 'decision', 'note', 'featured'],
        additionalProperties: false
      }
    },
    editorialNote: {
      type: 'string',
      description: 'An overall note on this batch — patterns you noticed, what the collection is missing, direction for next round.'
    }
  },
  required: ['decisions', 'editorialNote'],
  additionalProperties: false
};

/**
 * Run the head editor agent to review a batch of pitched posts.
 *
 * @param {Object[]} pitches - Posts with status 'pitched'
 * @param {Object[]} publishedPosts - Already-published posts (for context/diversity)
 * @returns {Promise<Object>} { decisions, editorialNote }
 */
export async function runHeadEditorAgent(pitches, publishedPosts = []) {
  if (pitches.length === 0) {
    return { decisions: [], editorialNote: 'No pitches to review.' };
  }

  const publishedContext = publishedPosts.length > 0
    ? `\n\nCurrently published (avoid repetition in theme/texture):\n${
        publishedPosts.slice(0, 10).map(p =>
          `- [${p.category}] "${p.title}" — ${p.source}`
        ).join('\n')
      }`
    : '';

  const pitchList = pitches.map(p => `
---
POST ID: ${p.id}
CATEGORY: ${p.category}
TITLE: ${p.title} / ${p.titleEn}
SOURCE: ${p.source}
DESCRIPTION: ${p.description}
EDITOR NOTE: ${p.pitchNote}
TAGS: ${(p.tags || []).join(', ')}
`).join('\n');

  const userPrompt = `Review this batch of editor pitches.${publishedContext}

${pitchList}

---
Make a decision for each post ID. Be direct and specific.
At most one piece should be featured. Most should be approved or revised, not rejected —
your editors have good instincts. Reserve rejection for things that are
genuinely wrong for the platform, not just imperfect.`;

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    thinking: { type: 'adaptive' },
    system: HEAD_EDITOR_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
    output_config: {
      format: {
        type: 'json_schema',
        schema: DECISION_SCHEMA,
      }
    }
  });

  const textBlock = response.content.find(b => b.type === 'text');
  if (!textBlock) throw new Error('No response from head editor agent');

  return JSON.parse(textBlock.text);
}
