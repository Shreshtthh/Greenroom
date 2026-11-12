import { createOpenAI, openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { xai } from '@ai-sdk/xai';

// Groq exposes an OpenAI-compatible API, so we reuse @ai-sdk/openai with a custom baseURL.
// Accepts GROQ_API_KEY, or a Groq key (gsk_...) mistakenly placed in XAI_API_KEY.
function groqKey(): string | undefined {
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY;
  if (process.env.XAI_API_KEY?.startsWith('gsk_')) return process.env.XAI_API_KEY;
  return undefined;
}

export function getModel() {
  const provider = process.env.LLM_PROVIDER;
  const gk = groqKey();

  if (provider === 'groq' || gk) {
    const groq = createOpenAI({
      apiKey: gk,
      baseURL: 'https://api.groq.com/openai/v1',
      compatibility: 'compatible',
    });
    const modelId = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
    return groq(modelId, { structuredOutputs: false });
  }
  if (provider === 'xai') return xai('grok-3-mini-fast');
  if (provider === 'openai') return openai('gpt-4o-mini');
  return google('gemini-2.0-flash');
}

