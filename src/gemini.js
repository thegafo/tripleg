import { GoogleGenerativeAI } from "@google/generative-ai";
import EventEmitter from "events";
import { getConfig } from "./utils.js";
import { convertToolsToGeminiFormat } from "./tools.js";

let history = [];
let stream;

export function chat(
  systemPrompt = "",
  userPrompt = "",
  provider = "gemini",
  model = "gemini-1.5-flash",
  tools = {},
  _toolConfig = {},
  verbose = false,
  _dataEmitter
) {
  const genAI = new GoogleGenerativeAI(getConfig(provider));
  const dataEmitter = _dataEmitter || new EventEmitter();

  const toolConfig = convertToolsToGeminiFormat(_toolConfig)

  async function main() {
    if (userPrompt) {
      history.push({ role: "user", parts: [{ text: userPrompt }] });
    }
    try {
      const modelInstance = await genAI.getGenerativeModel({
        model: model,
        systemInstruction: systemPrompt || undefined,
        tools: toolConfig.length ? { functionDeclarations: toolConfig } : undefined,
      });
      stream = await modelInstance.startChat({
        history: history,
      }).sendMessageStream(userPrompt);
    } catch (error) {
      return dataEmitter.emit("error", error);
    }
    let result = "";
    let toolCalls = [];

    try {
      for await (const chunk of stream.stream) {
        const delta = chunk.text();
        dataEmitter.emit("data", delta);
        if (delta) {
          result += delta;
        }

        // https://ai.google.dev/gemini-api/docs/function-calling/tutorial?lang=node
        const toolDelta = chunk.functionCalls();
        if (toolDelta) {
          toolCalls.push(...toolDelta);
        }
      }

    } catch (error) {
      dataEmitter.emit("error", error);
    } finally {
      history.push({ role: "model", parts: [{ text: result }] });

      if (toolCalls.length) {
        const results = await performToolCalls(toolCalls, tools, verbose);
        history.push(...results);
        return chat(systemPrompt, "", provider, model, tools, _toolConfig, verbose, dataEmitter);
      }

      dataEmitter.emit("close");
    }
  }

  const killStream = () => {
    try {
      stream.stream.return();
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

const performToolCalls = async (toolCalls, tools, verbose = false) => {
  const results = [];
  for (const toolCall of toolCalls) {
    try {
      if (verbose) {
        console.log(`\nExecuting tool: ${toolCall.name}`);
        console.log(`Arguments: ${JSON.stringify(toolCall.args, null, 2)}`);
      }
      const tool = tools[toolCall.name];
      const result = await tool(toolCall.args);
      if (verbose) {
        console.log(`Tool result: ${result}`);
      }
      results.push({
        role: 'function',
        parts: [{ functionResponse: { name: toolCall.name, response: { content: result } } }]
      });
    } catch (err) {
      results.push({
        role: 'function',
        parts: [{ functionResponse: { name: toolCall.name, response: { content: `Error executing tool: ${err.message}` } } }]
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
  return history[history.length - 1];
};