import { GoogleGenerativeAI } from "@google/generative-ai";
import EventEmitter from "events";
import { getConfig } from "./utils.js";

// TODO: tool usage

let history = [];
let stream;

export function chat(
  systemPrompt = "",
  userPrompt = "",
  provider = "gemini",
  model = "gemini-1.5-flash",
  tools = {},
  config = {},
  verbose = false,
  _dataEmitter
) {
  const genAI = new GoogleGenerativeAI(getConfig(provider));
  const dataEmitter = _dataEmitter || new EventEmitter();

  async function main() {
    if (userPrompt) {
      history.push({ role: "user", parts: [{ text: userPrompt }] });
    }
    try {
      const modelInstance = await genAI.getGenerativeModel({ model: model, systemInstruction: systemPrompt || undefined });
      stream = await modelInstance.startChat({
        history: history,
        generationConfig: config,
      }).sendMessageStream(userPrompt);
    } catch (error) {
      return dataEmitter.emit("error", error);
    }
    let result = "";

    try {
      for await (const chunk of stream.stream) {
        const delta = chunk.text();
        dataEmitter.emit("data", delta);
        if (delta) {
          result += delta;
        }
      }
    } catch (error) {
      dataEmitter.emit("error", error);
    } finally {
      history.push({ role: "model", parts: [{ text: result }] });
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

export const resetChat = () => {
  history = [];
};

export const removeLastMessage = () => {
  history.pop();
};

export const getLastMessage = () => {
  return history[history.length - 1];
};