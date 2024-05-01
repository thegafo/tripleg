
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
};

export const ignoreKeys = [
  "LEFT CONTROL",
  "RIGHT CONTROL",
  "LEFT ALT",
  "RIGHT ALT",
  "LEFT META",
  "RIGHT META",
  "LEFT SUPER",
  "RIGHT SUPER",
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
      apiKey: process.env.TOGETHERAI_API_KEY,
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
  } else {
    return undefined;
  }
}