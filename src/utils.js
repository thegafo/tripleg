
export const keyMap = {
  "MINUS": "-",
  "EQUALS": "=",
  "SQUARE BRACKET CLOSE": "[", // NOTE: looks like bug here in node-global-key-listener
  "SQUARE BRACKET OPEN": "]",  // Open and close brackets are switched
  "BACKSLASH": "\\",
  "SEMICOLON": ";",
  "QUOTE": "'",
  "COMMA": ",",
  "DOT": ".",
  "FORWARD SLASH": "/",
  "BACKTICK": "`",
  "SPACE": " ",
  "RETURN": "\n",
  "BACKSPACE": "\b",
  "TAB": "\t",
};

export const ignoreKeys = [
  "LEFT CTRL",
  "RIGHT CTRL",
  "LEFT CONTROL",
  "RIGHT CONTROL",
  "LEFT ALT",
  "RIGHT ALT",
  "LEFT META",
  "RIGHT META",
  "LEFT SUPER",
  "RIGHT SUPER",
  "DELETE",
  "UP ARROW",
  "DOWN ARROW",
  "LEFT ARROW",
  "RIGHT ARROW",
  "HOME",
  "PAGE UP",
  // "PAGE DOWN",
];

export const shiftMap = {
  "1": "!",
  "2": "@",
  "3": "#",
  "4": "$",
  "5": "%",
  "6": "^",
  "7": "&",
  "8": "*",
  "9": "(",
  "0": ")",
  "MINUS": "_",
  "EQUALS": "+",
  "SQUARE BRACKET CLOSE": "{", // NOTE: looks like bug here in node-global-key-listener
  "SQUARE BRACKET OPEN": "}",  // Open and close brackets are switched
  "BACKSLASH": "|",
  "SEMICOLON": ":",
  "QUOTE": "\"",
  "COMMA": "<",
  "DOT": ">",
  "FORWARD SLASH": "?",
  "BACKTICK": "~",
};

export const printKey = (key) => {
  let keyName = key;
  switch (key) {
    case "\n":
      keyName = "RETURN";
      break;
    case "\b":
      keyName = "BACKSPACE";
    case "\t":
      keyName = "TAB";
      break;
    case " ":
      keyName = "SPACE";
      break;
  }
  console.log(`Got key: ${keyName}`);
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getConfig = (provider) => {
  if (provider === 'together') {
    return {
      apiKey: process.env.TOGETHER_API_KEY,
      baseURL: "https://api.together.xyz/v1",
    }
  } else if (provider === 'perplexity') {
    return {
      apiKey: process.env.PERPLEXITY_API_KEY,
      baseURL: "https://api.perplexity.ai/",
    }
  } else if (provider === 'mistral') {
    return {
      apiKey: process.env.MISTRAL_API_KEY,
      baseURL: "https://api.mistral.ai/v1",
    }
  } else if (provider === 'groq') {
    return {
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    }
  } else if (provider === 'ollama') {
    return {
      apiKey: 'XXX',
      baseURL: "http://localhost:11434/v1",
    }
  } else if (provider === 'gemini') {
    return process.env.GEMINI_API_KEY;
  } else if (provider === 'anthropic') {
    return {
      apiKey: process.env.ANTHROPIC_API_KEY,
    }
  } else {
    return undefined;
  }
}
export const pricing = {
  'openai': {
    'gpt-4o-mini': {
      inputPrice: 0.00015,
      outputPrice: 0.0006
    },
    'gpt-4': {
      inputPrice: 0.03,
      outputPrice: 0.06
    },
    'gpt-4o': {
      inputPrice: 0.005,
      outputPrice: 0.015
    },
  }
};

export const getPricing = (provider, model, inputTokens, outputTokens) => {
  const modelPricing = pricing[provider]?.[model];
  if (!modelPricing) {
    return 0;
  }
  const totalPrice =
    (modelPricing.inputPrice * inputTokens / 1000) + (modelPricing.outputPrice * outputTokens / 1000);
  return totalPrice;
};