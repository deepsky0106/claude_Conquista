// DOGWALKPOOPOO — Editor AI Agent
// Each category editor is a Claude instance with a specialized sensibility.
// Runs once per invocation, returns a single "find" (pitch).

import Anthropic from '@anthropic-ai/sdk';
import { EDITOR_PROMPTS } from './prompts.js';

const client = new Anthropic();

// JSON schema for a pitch — strict shape so parsing is reliable
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
      description: '출처. 영화명, 작가명, 장소, URL, 작품명. 정확하게.'
    },
    description: {
      type: 'string',
      description: '한국어 설명. 왜 이것이 여기에 있어야 하는지. 아름답다고 말하지 말고, 왜 멈추게 되는지를 써라. 2-4문장.'
    },
    descriptionEn: {
      type: 'string',
      description: 'English description. Same approach — describe what stops you, not why it\'s beautiful. 2-4 sentences.'
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      description: '태그 3-5개. 소문자 영어. 장르/분위기/소재.'
    },
    pitchNote: {
      type: 'string',
      description: '헤드 에디터에게 보내는 메모. 왜 지금 이것인지. 왜 유명하지 않은지. 어디서 찾았는지. 1-2문장.'
    }
  },
  required: ['title', 'titleEn', 'source', 'description', 'descriptionEn', 'tags', 'pitchNote'],
  additionalProperties: false
};

/**
 * Run one editor agent for the given category.
 * Returns a pitch object ready to be stored as a post.
 *
 * @param {string} category - One of the EDITOR_PROMPTS keys
 * @param {string[]} existingTitles - Already-published titles to avoid duplicates
 * @returns {Promise<Object>} pitch
 */
export async function runEditorAgent(category, existingTitles = []) {
  const config = EDITOR_PROMPTS[category];
  if (!config) throw new Error(`Unknown category: ${category}`);

  const avoidList = existingTitles.length > 0
    ? `\n\nAlready published — don't repeat these:\n${existingTitles.map(t => `- ${t}`).join('\n')}`
    : '';

  const userPrompt = `Find one thing to pitch for this week.

Your pitch must be:
- Something specific and real (not hypothetical)
- Something genuinely overlooked — not in the art world canon, not viral, not famous
- Something you can point to (a specific film, a specific place, a specific recording, a specific object)

Be concrete. "The way light enters parking structures" is not enough.
"The top floor of the Barbican car park in London at 6am in October" is closer.
${avoidList}

Output your pitch as JSON.`;

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    thinking: { type: 'adaptive' },
    system: config.systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    output_config: {
      format: {
        type: 'json_schema',
        schema: PITCH_SCHEMA,
      }
    }
  });

  const textBlock = response.content.find(b => b.type === 'text');
  if (!textBlock) throw new Error(`No text response from ${category} editor`);

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
    source: 'ai-agent',
    ...pitch,
  };
}
