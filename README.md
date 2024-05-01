# Triple G

Triple G is an experimental AI completion tool designed to enhance productivity by listening to keypresses and clipboard changes. It integrates AI-powered completions into any text environment, whether you're coding, writing documentation, or composing emails. Use Triple G to streamline your workflow and enhance your text interaction capabilities with AI.

## Key Features

- **Auto Context**: Listens to keypresses and clipboard changes to automatically set context.
- **AI Completions**: Activate AI completions with a simple keystroke.
- **Multiple Providers**: Choose from several AI providers to suit your needs.

## Installation

### Prerequisites

- Node.js (v16 or later recommended)
- Compatible with macOS (possibly compatible with Linux, but not tested)
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

## Key commands

- `ggg`: Trigger an AI completion at your cursor location.
- `GGG`: Clear the internal context stack.
- `ggG`: Print the current context stack to the terminal.
- `gGg`: Exit Triple G.

## Providers

Triple G supports the following providers:

- OpenAI
- Together
- Perplexity
- Mistral
- Groq
- Ollama

Each provider needs specific API keys available as environment variables:

- OpenAI: `OPENAI_API_KEY`
- Together: `TOGETHER_API_KEY`
- Perplexity: `PERPLEXITY_API_KEY`
- Mistral: `MISTRAL_API_KEY`
- Groq: `GROQ_API_KEY`
- Ollama: None required
