import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const clients = {
  mistral: new OpenAI({
    apiKey: process.env.MISTRAL_API_KEY,
    baseURL: 'https://api.mistral.ai/v1',
  }),

  gemini: new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  }),
};

const models = {
  'ministral-3b-2512': {
    provider: 'mistral',
    client: clients.mistral,
  },

  'gemini-2.5-flash': {
    provider: 'gemini',
    client: clients.gemini,
  },
};

export function getProvider(model) {
  const config = models[model];

  if (!config) {
    throw new Error(`Unsupported model: ${model}`);
  }

  return {
    providerName: config.provider,

    async *streamChat(messages) {
      const stream = await config.client.chat.completions.create({
        model,
        messages,
        stream: true,
        stream_options: {
          include_usage: true,
        },
      });

      for await (const chunk of stream) {
        const text = chunk.choices?.[0]?.delta?.content;
        const usage = chunk.usage;

        if (text || usage) {
          yield {
            text: text || '',
            usage: usage
              ? {
                  promptTokens: usage.prompt_tokens || 0,
                  completionTokens: usage.completion_tokens || 0,
                }
              : undefined,
          };
        }
      }
    },
  };
}