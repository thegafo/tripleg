# Triple G

Triple G is an experimental AI completion tool designed to enhance productivity by listening to keypresses and clipboard changes. It integrates AI-powered completions into any text environment, whether you're coding, writing documentation, or composing emails. Use Triple G to streamline your workflow and enhance your text interaction capabilities with AI.

Type `ggg` to trigger an AI completion at your cursor location, and `GGG` to clear the internal context stack.

## Key Features

- **Auto Context**: Listens to keypresses and clipboard changes to automatically set context.
- **AI Completions**: Activate AI completions with a simple keystroke.
- **Multiple Providers**: Choose from several AI providers to suit your needs.

## Installation

### Prerequisites

- Node.js (v16 or later recommended)
- Compatible with macOS (possibly compatible with Linux and Windows, but not tested)
- Enable accessibility for the terminal or wherever you want to run from

```bash
npm install -g tripleg
```

> Note: if you experience node-gyp installation issues, you may need to install python setup tools
> `python3 -m pip install setuptools`

## Usage

```bash
tripleg --provider openai -m gpt-3.5-turbo
```

### Options

- `-p, --provider <provider>`: Specify the provider for the model.
- `-m, --model <model>`: Specify the model to use.
- `-sp, --system-prompt <prompt>`: Set a system guidance prompt.
- `-t, --trigger-key <key>`: Set the trigger key for completion.
- `-d, --delay <ms>`: Set the delay between typing chunks.
- `-l, --list`: List all available model options.
- `-o, --ocr <directory`: Perform OCR on images in the specified directory (experimental & only available on macOS).
- `-u, --use-tools`: Use experimental system tools (e.g., read and write files, execute bash commands).
- `-i, --install`: Install optional dependencies (needed for Gemini).
- `-v, --verbose`: Display debug logs.
- `-V, --version`: Output the version information.
- `-h, --help`: Display the help information.

## Key commands

Interact with Triple G using these key sequences:

- `ggg`: Trigger an AI completion at your cursor location.
- `GGG`: Clear the internal context stack.
- `ggx`: [Experimental, MacOS only feature] Take a screenshot and perform OCR.
- `gGg`: Exit Triple G.

## Providers

Triple G integrates with the following providers, each requiring specific API keys:

- **OpenAI:** `OPENAI_API_KEY`
- **Together:** `TOGETHER_API_KEY`
- **Perplexity:** `PERPLEXITY_API_KEY`
- **Mistral:** `MISTRAL_API_KEY`
- **Groq:** `GROQ_API_KEY`
- **Gemini:** `GEMINI_API_KEY`
- **Anthropic:** `ANTHROPIC_API_KEY`
- **Ollama:** No API key required.

Ensure the corresponding environment variables are set for seamless integration.

## Optional Dependencies

By default only support for OpenAI-compatible modals is included. To enable support for other providers, like Gemini and Anthropic, you need to install optional dependencies:

```bash
tripleg --install
```

This will install dependencies needed for Gemini and other future providers.
