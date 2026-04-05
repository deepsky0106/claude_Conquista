# DOGWALKPOOPOO — AI Editor Agents

## Overview

The editorial pipeline is fully AI-powered:

```
6 Editor Agents  →  pitches  →  Head Editor Agent  →  published / revision / rejected
     (Claude)                        (Claude)               → data/posts.json
```

## Setup

```bash
npm install
export ANTHROPIC_API_KEY=sk-...
```

## Running

```bash
# Full pipeline: all 6 editors + head editor review
npm run run-editors

# Single category (pitch only, skip head editor)
npm run run-film
npm run run-art
npm run run-arch
npm run run-object
npm run run-nature
npm run run-sound

# Head editor reviews existing pitches (no new pitches)
node agents/run.js --head-only

# Dry run (no writes)
node agents/run.js --dry-run
```

## Architecture

### Editor Agents (`editor-agent.js`)
- One per category: film, contemporary-art, architecture, object, nature, sound
- Each has a distinct editorial sensibility via system prompt
- Uses `claude-opus-4-6` with adaptive thinking
- Outputs structured JSON via `output_config.format` (JSON schema)
- Returns a single "find" / pitch per run

### Head Editor Agent (`head-editor-agent.js`)
- Reviews all pitched posts in one call
- Decides: `approve` / `revise` / `reject`
- Writes notes back to each editor
- Selects at most one piece as `featured`
- Also writes an overall editorial note about the batch

### Orchestrator (`run.js`)
- Runs all agents sequentially (not parallel — head editor waits for all pitches)
- Merges decisions back into `data/posts.json`
- Frontend reads `posts.json` directly (no backend needed)

## Adding a New Category

1. Add to `EDITOR_PROMPTS` in `agents/prompts.js`
2. Add to `data/team.json` categories
3. Add a script to `package.json`

## Notes on Prompts

The quality of the editorial output is entirely in `agents/prompts.js`.
- `PLATFORM_CONTEXT` is shared across all agents
- Each editor has a `systemPrompt` with domain-specific sensibility
- `HEAD_EDITOR_PROMPT` defines the editorial standards

Tune these prompts to shift the platform's aesthetic direction.
