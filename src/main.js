#!/usr/bin/env node

import { type, backspace, listen } from "./keyboard.js";
import { chat, removeLastMessage, resetChat } from "./openai.js";
import { ignoreKeys, keyMap, printKey, shiftMap, sleep } from "./utils.js";
import { monitorClipboard, resetClipboard } from "./clipboard.js";
import { status, updateStatus } from "./status/status.js";
import { watch } from "./watch.js";
import { ocr } from "./ocr/ocr.js";
import { screenshot } from "./screenshot/screenshot.js";

const DEFAULT_STATUS_ICON = "bolt.horizontal";
const PROCESS_STATUS_ICON = "bolt.horizontal.fill";

export const main = async ({
  provider,
  model,
  systemPrompt,
  typeDelay = 5,
  verbose = false,
  ocrDirectory = undefined,
  triggerKey = "g",
}) => {

  const PROCESS_STACK_TRIGGER = triggerKey.repeat(3);
  const RESET_STACK_TRIGGER = triggerKey.toUpperCase().repeat(3);
  const EXIT_TRIGGER = triggerKey + triggerKey.toUpperCase() + triggerKey;

  let stack = "";
  let ignore = false;
  let cancel = false;
  let isProcessing = true;

  const handleKey = async (key) => {
    // Cancel current completion if user presses escape
    if (key === "ESCAPE") {
      if (isProcessing) {
        cancel = true;
      }
      return;
    }

    // Ignore if ignore is true or if key is undefined
    if (ignore || !key) {
      return;
    }

    // Handle backspace by removing last character from stack
    if (key === "BACKSPACE") {
      if (stack.length > 0) {
        stack = stack.slice(0, -1);
      }
      return;
    }

    // Add key to stack
    stack += key;

    // Print if verbose
    if (verbose) {
      printKey(key);
    }

    if (stack.length >= 3) {
      // Process stack
      if (stack.slice(-3) === PROCESS_STACK_TRIGGER) {
        const message = stack.slice(0, -3).trim();
        if (verbose) {
          console.log(`---\nProcessing stack:\n${message}\n---`);
        }
        stack = "";
        ignore = true;

        // Remove trigger text
        await backspace(3);

        updateStatus(PROCESS_STATUS_ICON);

        const { stream, killStream } = await chat(
          systemPrompt,
          message,
          provider,
          model
        );
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
                console.log("\nCancelling");
              }
              killStream();
              queue = ["<<<done>>>"];
            }
            const data = queue.shift();
            if (data === "<<<done>>>") {
              queueIsProcessing = false;
              isProcessing = false;
              stack = "";
              cancel = false;
              ignore = false;
              updateStatus(DEFAULT_STATUS_ICON);
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
            console.log("\nstream closed");
          }
          queue.push("<<<done>>>");
          await processQueue();
        });
        stream.on("error", async (error) => {
          console.log("Error:", error.message);
          removeLastMessage();
          queue.push("<<<done>>>");
          await processQueue();
        });
      }

      // Reset stack
      else if (stack.slice(-3) === RESET_STACK_TRIGGER) {
        ignore = true;
        // Remove trigger text
        await backspace(3);

        await sleep(100);
        stack = "";
        ignore = false;
        resetChat();
        resetClipboard();
        if (verbose) {
          console.log("Chat reset");
        }
      }

      // Exit
      else if (stack.slice(-3) === EXIT_TRIGGER) {
        ignore = true;
        stack = "";
        // Remove trigger text
        await backspace(3);
        await sleep(100);
        await type("Goodbye!");
        await sleep(100);
        process.exit();
      }

      else if (stack.slice(-3) === 'ggx' && ocrDirectory) {
        await backspace(3);
        await screenshot(ocrDirectory);
      }
    }
  };

  // Log every key that's pressed.
  listen(function (e, down) {
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
        handleKey("BACKSPACE");
      } else if (key === "ESCAPE") {
        handleKey("ESCAPE");
      } else if (down["LEFT SHIFT"] || down["RIGHT SHIFT"]) {
        if (key.length === 1 && !parseInt(key)) {
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

  // Set status icon
  status(DEFAULT_STATUS_ICON);

  // Watch directory for images and run OCR
  if (ocrDirectory) {
    watch(ocrDirectory).on("data", async (filePath) => {
      if (filePath.endsWith(".png")) {
        const data = await ocr(filePath);
        stack += data;
        if (verbose) {
          console.log("OCR output added to stack:");
          console.log(data);
        }
      }
    });
  }
};
