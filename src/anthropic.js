import Anthropic from '@anthropic-ai/sdk';
import EventEmitter from 'events';
import { getConfig } from './utils.js';

const MAX_TOKENS = 4096;

let history = [];
let stream;

// TODO tool usage

export function chat(
  systemPrompt = '',
  userPrompt = '',
  provider = 'anthropic',
  model = 'claude-3-opus-20240229',
  tools = {},
  config = {},
  verbose = false,
  _dataEmitter
) {
  const api = new Anthropic(getConfig(provider));
  const dataEmitter = _dataEmitter || new EventEmitter();

  async function main() {
    if (userPrompt) {
      history.push({ role: "user", content: userPrompt });
    }

    let result = "";

    try {
      stream = await api.messages.create({
        stream: true,
        max_tokens: MAX_TOKENS,
        messages: history,
        model: model,
        system: systemPrompt,
      });
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          process.stdout.write(event.delta.text);
          dataEmitter.emit('data', event.delta.text);
          result += event.delta.text;
        }
      }
    } catch (error) {
      dataEmitter.emit("error", error);
    } finally {
      history.push({ role: "assistant", content: result });
      dataEmitter.emit("close");
    }
  }

  const killStream = () => {
    try {
      stream.controller.abort();
    } catch (e) {
      console.log(e);
    }
  };

  main().catch((error) => {
    console.log(error);
    process.exit();
  });

  return { stream: dataEmitter, killStream };
}

export const resetChat = () => {
  history = [];
};

export const removeLastMessage = () => {
  history.pop();
};

export const getLastMessage = () => {
  return history[history.length - 1];
};