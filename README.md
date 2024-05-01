# Triple G

Experimental AI completion tool. Use at your own risk.

Listens to your keypresses and clipboard changes for context, and gives you the ability to perform completion anywhere you can place your cursor. The tool these global keypress commands:

- `ggg`: perform completion
- `GGG`: clear stack
- `ggG`: print stack
- `gGg`: exit

## Installation

```bash
npm install -g tripleg
```

> Note: you may need to enable terminal accessbility

## Usage

```bash
tripleg --provider openai -m gpt-3.5-turbo
```

## Providers

- OpenAI
- Together
- Perplexity
- Mistral
- Groq
- Ollama
