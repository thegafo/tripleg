import OpenAI from "openai";
import EventEmitter from 'events';
import { getConfig } from "./utils.js";

let history = [];

export function chat(systemPrompt = '', userPrompt = '', provider = 'openai', model = 'gpt-3.5-turbo') {
  const openai = new OpenAI(getConfig(provider));
  let stream;
  const dataEmitter = new EventEmitter();

  async function main() {
    if (history.length == 0) {
      if (systemPrompt) {
        history.push({ "role": "system", "content": systemPrompt });
      }
    }

    history.push({ "role": "user", "content": userPrompt });
    try {
      stream = await openai.chat.completions.create({
        model: model,
        messages: history,
        stream: true,
      });
    } catch (error) {
      return dataEmitter.emit('error', error);
    }
    let result = '';

    try {
      for await (const chunk of stream) {
        dataEmitter.emit('data', chunk.choices[0].delta.content);
        result += chunk.choices[0].delta.content;
      }
    } catch (error) {
      dataEmitter.emit('error', error);
    } finally {
      dataEmitter.emit('close');
      history.push({ "role": "assistant", "content": result });
    }

  }

  const killStream = () => {
    try {
      stream.controller.abort();
    } catch (e) {
      console.log(e);
    }
  }

  main().catch(error => {
    console.log(error.error.message || error.status);
    process.exit();
  });

  return { stream: dataEmitter, killStream };
}


export const resetChat = () => {
  history = [];
}

export const removeLastMessage = () => {
  history.pop();
}

export function getCompletion(systemPrompt = '', userPrompt = '', provider = 'openai', model = 'gpt-3.5-turbo') {
  const openai = new OpenAI(getConfig(provider));
  const dataEmitter = new EventEmitter();
  let stream;

  async function main() {
    stream = await openai.completions.create({
      model: model,
      prompt: systemPrompt + userPrompt,
      stream: true,
    });

    try {
      for await (const chunk of stream) {
        dataEmitter.emit('data', chunk.choices[0].text);
      }
    } catch (error) {
      dataEmitter.emit('error', error);
    } finally {
      dataEmitter.emit('close');
    }
  }

  const killStream = () => {
    try {
      stream.controller.abort();
    } catch (e) {
      console.log(e);
    }
  }

  main().catch(error => dataEmitter.emit('error', error));

  return { stream: dataEmitter, killStream };
}