export const models = {
  openai: [
    'gpt-4o-mini',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-0125',
    'gpt-3.5-turbo-1106',
    'gpt-3.5-turbo-instruct',
    'gpt-4-0125-preview',
    'gpt-4-1106-preview',
    'gpt-4',
    'gpt-4-32k',
    'gpt-4o',
  ],
  gemini: [
    'gemini-1.5-pro-latest',
    'gemini-1.5-flash-latest',
    'gemini-1.0-pro',
  ],
  anthropic: [
    'claude-3-5-sonnet-20240620',
    'claude-3-opus-20240229',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
  ],
  groq: [
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant',
    'llama3-70b-8192',
    'llama3-8b-8192',
    'mixtral-8x7b-32768',
    'gemma-7b-it'
  ],
  mistral: [
    "open-mistral-8x22b",
    "open-mistral-8x7b",
    "open-mistral-7b",
    "mistral-small",
    "mistral-medium",
    "mistral-large"
  ],
  perplexity: [
    'llama-3-70b-instruct',
    'llama-3-8b-instruct',
    'mixtral-8x7b-instruct',
    'llama-3-sonar-small-32k-chat',
    'llama-3-sonar-small-32k-online',
    'llama-3-sonar-large-32k-chat',
    'llama-3-sonar-large-32k-online',
  ],
  together: [
    'meta-llama/Llama-3-70b-chat-hf',
    'meta-llama/Llama-3-8b-chat-hf',
    'mistralai/Mixtral-8x7B-Instruct-v0.1',
    'mistralai/Mixtral-8x22B-Instruct-v0.1',
  ],
  ollama: ['llama3'],
}


export const listModels = () => {
  // log all providers and models
  for (const provider in models) {
    console.log(`${provider.toUpperCase()}`);
    models[provider].forEach((model) => {
      console.log(`- ${model}`);
    });
    console.log();
  }
  console.log('NOTE: All available models are not listed here.')
}