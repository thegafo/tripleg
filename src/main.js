#!/usr/bin/env node

import { GlobalKeyboardListener } from "node-global-key-listener";
import { type, backspace } from "./keyboard.js";

import { chat, resetChat } from "./openai.js";
import { ignoreKeys, keyMap, printKey, shiftMap, sleep } from "./utils.js";
import { monitorClipboard } from "./clipboard.js";

const v = new GlobalKeyboardListener({
  mac: {
    onError: (errorCode) => {
      console.log(
        `Error starting keyboard listener: ${errorCode}. Ensure you have the correct accesibility permissions.`
      );
      process.exit();
    },
  },
  windows: {
    onError: (errorMessage) => {
      console.log(
        `Error starting keyboard listener: ${errorMessage}. Ensure you have the correct accesibility permissions.`
      );
      process.exit();
    },
  },
});

export const main = async ({ provider, model, systemPrompt, typeDelay = 5, verbose = false }) => {
  let stack = "";
  let ignore = false;
  let cancel = false;
  let isProcessing = true;

  const handleKey = async (key) => {

    // TODO cancel current completion if user presses escape
    if (key === 'ESCAPE') {
      if (isProcessing) {
        cancel = true;
      }
      return;
    }

    // Ignore if ignore is true or if key is undefined
    if (ignore || !key) {
      return;
    }
    // Add key to stack
    stack += key;

    // Print if verbose
    if (verbose) {
      printKey(key);
    }

    // if last 3 characters of stack end in ggg, then send message
    if (stack.length >= 3) {
      // Exit
      if (stack.slice(-3) === "gGg") {
        ignore = true;
        await sleep(100);

        // Remove trigger text
        await backspace(3);
        await type('Goodbye!');


        await sleep(100);
        process.exit();
      }

      // Write stack
      if (stack.slice(-3) === "ggG") {
        ignore = true;
        await sleep(100);

        // Remove trigger text
        await backspace(3);

        await type(stack.slice(0, -3));
        await sleep(100);
        ignore = false;
      }

      // Reset stack
      if (stack.slice(-3) === "GGG") {
        ignore = true;
        await sleep(100);

        // Remove trigger text
        await backspace(3);

        await sleep(100);
        stack = "";
        ignore = false;
        resetChat();
        if (verbose) {
          console.log('Chat reset');
        }
      }
      // Process stack
      if (stack.slice(-3) === "ggg") {
        const message = stack.slice(0, -3).trim();
        if (verbose) {
          console.log(`---\nProcessing stack:\n${message}\n---`);
        }
        ignore = true;
        await sleep(100);

        // Remove trigger text
        await backspace(3);

        const { stream, killStream } = await chat(systemPrompt, message, provider, model);
        let queueIsProcessing = false;
        let result = "";
        let queue = [];
        cancel = false;
        isProcessing = true;

        async function processQueue() {
          if (queueIsProcessing || queue.length === 0) {
            return;
          }
          queueIsProcessing = true;
          while (queue.length > 0) {
            if (cancel) {
              if (verbose) {
                console.log('\nCancelling');
              }
              killStream();
              queue = ['<<<done>>>'];
            }
            const data = queue.shift();
            if (data === "<<<done>>>") {
              queueIsProcessing = false;
              isProcessing = false;
              stack = "";
              cancel = false;
              ignore = false;
              break;
            }
            // replace newlines with better newline that works across environments
            const _data = data.replace(/\n/g, "\r");
            await type(_data);

            result += data;
            await sleep(typeDelay);
          }
          queueIsProcessing = false;
        }

        stream.on("data", async (data) => {
          if (data) {
            if (verbose) {
              process.stdout.write(data || "");
            }
            queue.push(data); // use ...data instead of data to push each character separately
            await processQueue();
          }
        });
        stream.on("close", async () => {
          if (verbose) {
            console.log('stream closed');
          }
          queue.push('<<<done>>>');
          await processQueue();
        });
      }
    }
  };

  //Log every key that's pressed.
  v.addListener(function (e, down) {
    // console.log(e, down);
    // console.log();
    if (e.state === "DOWN") {
      const key = e.rawKey.standardName;
      for (const ignoreKey of ignoreKeys) {
        if (down[ignoreKey]) {
          return;
        }
      }

      if (key === "SPACE") {
        handleKey(" ");
      } else if (key === "RETURN") {
        handleKey("\n");
      } else if (key === "BACKSPACE") {
        handleKey("\b");
      } else if (key === 'ESCAPE') {
        handleKey('ESCAPE');
      } else if (down["LEFT SHIFT"] || down["RIGHT SHIFT"]) {
        if (key.length === 1) {
          handleKey(key.toUpperCase());
        } else {
          if (shiftMap[key]) {
            handleKey(shiftMap[key]);
          }
        }
      } else {
        if (key.length === 1) {
          handleKey(key.toLowerCase());
        } else {
          if (keyMap[key]) {
            handleKey(keyMap[key]);
          }
        }
      }
    }
  });

  // Check clipboard every 500ms and add changes to stack
  const clipboard = monitorClipboard(500);
  clipboard.on("data", async (data) => {
    if (verbose) {
      console.log("Clipboard added to stack:");
      console.log(data);
    }
    stack += `\n${data}\n`;
  });

};
