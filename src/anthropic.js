import Anthropic from '@anthropic-ai/sdk';
import EventEmitter from 'events';
import { getConfig } from './utils.js';
import { convertToolsToAnthropicFormat } from './tools.js';

const MAX_TOKENS = 4096;

let history = [];
let stream;

export function chat(
  systemPrompt = '',
  userPrompt = '',
  provider = 'anthropic',
  model = 'claude-3-opus-20240229',
  tools = {},
  _toolConfig = {},
  verbose = false,
  _dataEmitter
) {
  const api = new Anthropic(getConfig(provider));
  const dataEmitter = _dataEmitter || new EventEmitter();

  const toolConfig = convertToolsToAnthropicFormat(_toolConfig)

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
        tools: toolConfig.length ? toolConfig : undefined,
      }).on('text', (text) => {
        dataEmitter.emit('data', text);
        result += text;
      }).on('message', async (message) => {
        history.push({ role: "assistant", content: message.content });

        const toolCalls = message.content.filter((data) => {
          return data.type === 'tool_use';
        });

        if (toolCalls.length) {
          const results = await performToolCalls(toolCalls, tools, verbose);
          history.push(results);
          return chat(systemPrompt, "", provider, model, tools, _toolConfig, verbose, dataEmitter);
        }

        dataEmitter.emit("close");
      }).on('abort', () => {
        dataEmitter.emit('close');
        history.push({ role: 'assistant', content: result })
      });
    } catch (error) {
      dataEmitter.emit("error", error);
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
    console.log('Error in main')
    console.log(error);
    // process.exit();
  });

  return { stream: dataEmitter, killStream };
}

const performToolCalls = async (toolCalls, tools, verbose = false) => {
  const results = {
    role: 'user',
    content: []
  };
  for (const toolCall of toolCalls) {
    try {
      if (verbose) {
        console.log(`\nExecuting tool: ${toolCall.name}`);
        console.log(`Arguments: ${JSON.stringify(toolCall.input, null, 2)}`);
      }
      const tool = tools[toolCall.name];
      const result = await tool(toolCall.input);
      if (verbose) {
        console.log(`Tool result: ${result}`);
      }
      results.content.push({
        type: 'tool_result',
        tool_use_id: toolCall.id,
        content: result,
      });
    } catch (err) {
      results.content.push({
        role: "tool_result",
        tool_call_id: toolCall.id,
        content: `Error executing tool: ${err.message}`,
      });
      if (verbose) {
        console.log(`Error executing tool: ${err.message}`);
      }
    }
  }
  return results;
}

export const resetChat = () => {
  history = [];
};

export const removeLastMessage = () => {
  history.pop();
};

export const getLastMessage = () => {
  return history[history.length - 1].content.map((part) => part.type === 'text' ? part.text : '').join('');
};