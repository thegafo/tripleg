#!/usr/bin/env node

import { type, backspace, listen } from "./keyboard.js";
import { ignoreKeys, keyMap, printKey, shiftMap, sleep } from "./utils.js";
import { monitorClipboard, resetClipboard } from "./clipboard.js";
import { status, updateStatus } from "./status/status.js";
import { watch } from "./watch.js";
import { ocr } from "./ocr/ocr.js";
import { screenshot } from "./screenshot/screenshot.js";
import { config as toolConfig, tools } from "./tools.js";
import chalk from 'chalk';
import { getMissingOptionalDependencies } from "./install.js";

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
  useTools = false,
}) => {
  // hack to import chat functions compatible with provider
  try {
    var module = await import(
      provider === 'gemini' ? './gemini.js' :
        provider === 'anthropic' ? './anthropic.js' :
          './openai.js'
    );
  } catch (error) {
    console.error(chalk.red(`Error importing chat module.`));
    const missingDependencies = await getMissingOptionalDependencies();
    console.log(chalk.yellow(`Missing optional dependencies: ${missingDependencies.join(', ')}`));
    console.log(chalk.yellow(`Install optional dependencies by running: tripleg -i`));
    process.exit();
  }
  const { chat, getLastMessage, removeLastMessage, resetChat } = module;

  const PROCESS_TRIGGER = triggerKey.repeat(3);
  const RESET_TRIGGER = triggerKey.toUpperCase().repeat(3);
  const EXIT_TRIGGER = triggerKey + triggerKey.toUpperCase() + triggerKey;
  const OCR_TRIGGER = triggerKey + triggerKey + "x";
  const REPEAT_TRIGGER = triggerKey + triggerKey + "r";

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
      const lastThree = stack.slice(-3);
      // Process stack
      if (lastThree === PROCESS_TRIGGER) {
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
          model,
          useTools ? tools : undefined,
          useTools ? toolConfig : undefined,
          verbose
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
              sleep(100).then(() => {
                ignore = false;
              });
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
          console.error("Error during stream processing:", error);
          removeLastMessage();
          queue.push("<<<done>>>");
          await processQueue();
          updateStatus(DEFAULT_STATUS_ICON);
        });
      }

      // Reset stack
      else if (lastThree === RESET_TRIGGER) {
        ignore = true;
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
      else if (lastThree === EXIT_TRIGGER) {
        ignore = true;
        stack = "";
        await backspace(3);
        await sleep(100);
        await type("Goodbye!");
        await sleep(100);
        process.exit();
      }

      else if (lastThree === OCR_TRIGGER && ocrDirectory) {
        await backspace(3);
        await screenshot(ocrDirectory);
      }

      else if (lastThree === REPEAT_TRIGGER) {
        ignore = true;
        await backspace(3);
        await sleep(100);
        const lastMessage = getLastMessage();
        await type(lastMessage.content);
        await sleep(100);
        ignore = false;
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

      if (key === "BACKSPACE" || key === "ESCAPE") {
        handleKey(key);
      } else if (down["LEFT SHIFT"] || down["RIGHT SHIFT"]) {
        if (key.length === 1 && !parseInt(key)) {
          handleKey(key.toUpperCase());
        } else {
          if (shiftMap[key]) {
            handleKey(shiftMap[key]);
          } else {
            if (verbose) {
              console.log(`Unhandled key: ${key}`);
            }
          }
        }
      } else {
        if (key.length === 1) {
          handleKey(key.toLowerCase());
        } else {
          if (keyMap[key]) {
            handleKey(keyMap[key]);
          } else {
            if (verbose) {
              console.log(`Unhandled key: ${key}`);
            }
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
