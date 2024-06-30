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
      stream = await api.messages.stream({
        stream: true,
        max_tokens: MAX_TOKENS,
        messages: history,
        model: model,
        system: systemPrompt,
      }).on('text', (text) => {
        dataEmitter.emit('data', text);
        result += text;
      });
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