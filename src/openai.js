import OpenAI from "openai";
import EventEmitter from "events";
import { getConfig, getPricing, pricing } from "./utils.js";
import chalk from 'chalk';

let history = [];
let stream;
let inputTokens = 0;
let outputTokens = 0;

export function chat(
  systemPrompt = "",
  userPrompt = "",
  provider = "openai",
  model = "gpt-4o-mini",
  tools = {},
  config = [],
  verbose = false,
  _dataEmitter
) {
  const openai = new OpenAI(getConfig(provider));
  const dataEmitter = _dataEmitter || new EventEmitter();

  async function main() {
    if (history.length == 0) {
      if (systemPrompt) {
        history.push({ role: "system", content: systemPrompt });
      }
    }
    if (userPrompt) {
      history.push({ role: "user", content: userPrompt });
    }
    try {
      inputTokens += (systemPrompt.length + userPrompt.length) / 3;
      stream = await openai.chat.completions.create({
        model: model,
        messages: history,
        stream: true,
        tool_choice: config.length ? "auto" : undefined,
        tools: config.length ? config : undefined,
      });
    } catch (error) {
      return dataEmitter.emit("error", error);
    }
    let result = "";

    const toolCalls = [];
    try {
      for await (const chunk of stream) {
        const delta = chunk.choices[0].delta;
        dataEmitter.emit("data", delta.content);
        if (delta.content) {
          result += delta.content;
        }

        // Parse tool calls
        if (delta.tool_calls) {
          const toolCall = delta.tool_calls[0];
          if (!toolCalls[toolCall.index]) {
            toolCalls[toolCall.index] = toolCall;
          } else {
            toolCalls[toolCall.index].function.arguments +=
              toolCall.function.arguments;
          }
          if (verbose) {
            // log without console.log to prevent newline
            process.stdout.write('.');
          }
        }
      }
    } catch (error) {
      dataEmitter.emit("error", error);
    } finally {
      if (toolCalls.length) {
        history.push({
          role: "assistant",
          content: null,
          tool_calls: toolCalls,
        });
        // execute tool calls and push results to history
        for (const toolCall of toolCalls) {
          try {
            if (verbose) {
              console.log(`\nExecuting tool: ${toolCall.function.name}`);
              console.log(`Arguments: ${toolCall.function.arguments}`);
            }
            const result = await tools[toolCall.function.name](JSON.parse(toolCall.function.arguments));
            history.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: result,
            });
            outputTokens += (result.length) / 3;

            if (verbose) {
              console.log(`Tool result: ${result}`);
            }

          } catch (err) {
            const content = `Error executing tool: ${err.message}`
            history.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content,
            });
            outputTokens += (content.length) / 3;

            if (verbose) {
              console.log(`Error executing tool: ${err.message}`);
            }
          }
        }
        return chat(systemPrompt, "", provider, model, tools, config, verbose, dataEmitter);
      } else {
        history.push({ role: "assistant", content: result });
        outputTokens += (result.length) / 3;
        dataEmitter.emit("close");
      }
      if (verbose) {
        const price = getPricing(provider, model, inputTokens, outputTokens);
        console.log(chalk.green(`$${price.toFixed(5)}`));
      }
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
    console.log(error.message);
    console.log(error.error.message || error.status);
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
  return history[history.length - 1].content;
}