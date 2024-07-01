#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

import { main } from './src/main.js';
import { listModels, models } from './src/models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const banner = fs.readFileSync(path.join(__dirname, 'src/assets/banner.txt'), 'utf-8');
const packageText = fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8');
const version = JSON.parse(packageText).version;

const providers = Object.keys(models);
let selectedProvider = providers[0]; // Default provider

const DEFAULT_SYSTEM_PROMPT = "You are an assistant. Use the context to provide a helpful response.";

const program = new Command();

program
  .option('-p, --provider <provider>', 'specify the provider', (value) => {
    if (providers.indexOf(value) === -1) {
      console.log(chalk.red(`Invalid provider specified: ${value}. Choose from ${providers.join(' or ')}.`));
      process.exit();
    }
    selectedProvider = value; // Store the selected provider
    return value;
  }, Object.keys(models)[0])
  .option('-m, --model <model>', 'specify the model', (value) => {
    if (value) {
      if (models[selectedProvider].indexOf(value) === -1) {
        console.log(chalk.bgYellow(`Unknown model specified: ${value}! Use at your own risk.`));
      }
      return value;
    }
  })
  .option('-sp, --system-prompt <prompt>', 'a message to be included for system guidance', (value) => {
    if (typeof value !== 'string') {
      console.error('Invalid system prompt. It should be a string.');
      process.exit(1);
    }
    return value;
  }, DEFAULT_SYSTEM_PROMPT)
  .option('-t, --trigger-key <key>', 'specify the trigger key', (value) => {
    if (value.length !== 1 || !/[a-z]/.test(value)) {
      console.log(chalk.red('The trigger key must be a single lowercase letter.'));
      process.exit();
    }
    return value;
  }, 'g')
  .option('-d, --delay <ms>', 'the delay between typing chunks', (value) => {
    return parseInt(value, 10);
  }, 5)
  .option('-l, --list', 'list all available models', () => {
    listModels();
    process.exit();
  })
  .option('-o, --ocr <directory>', 'specify the directory for OCR', (value) => {
    if (value) {
      if (!fs.existsSync(value)) {
        console.log(chalk.red(`The directory ${value} does not exist.`));
        process.exit();
      }
      return value;
    }
  }, undefined)
  .option('-u, --use-tools', 'use experimental system tools', () => {
    return true;
  }, false)
  .option('-v, --verbose', 'display debug logs', () => {
    return true;
  }, false)
  .option('-V, --version', 'output the version number', () => {
    console.log(`v${version}`);
    process.exit();
  })
  .action((options) => {

    console.log(chalk.red(banner.replace('v0.0.0', chalk.red(`v${version}`))));
    console.log(chalk.bgRed('Listening for keyboard input. Press `Ctrl + C` to exit.\n'));

    if (!options.model) {
      options.model = models[options.provider][0];
    }
    main({
      provider: options.provider,
      model: options.model,
      systemPrompt: options.systemPrompt,
      triggerKey: options.triggerKey,
      typeDelay: options.delay,
      verbose: options.verbose,
      ocrDirectory: options.ocr,
      useTools: options.useTools,
    });
  });

program.parse();

