import { exec } from "child_process";
import fs from "fs";

export const config = [
  {
    type: "function",
    function: {
      name: "writeFile",
      description: "Writes content to a specified path.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The path to write to",
          },
          content: {
            type: "string",
            description: "The content to write",
          },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "readFile",
      description: "Reads content from a specified path.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The path to read from",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "executeCommand",
      description: "Executes a bash command.",
      parameters: {
        type: "object",
        properties: {
          command: {
            type: "string",
            description: "The command to execute",
          },
        },
        required: ["command"],
      },
    },
  },
];

export const tools = {
  writeFile: ({ path, content }) => {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, content.replace(/\\n/g, '\n'), (err) => {
        if (err) {
          resolve(`Error writing to file: ${err.message}`);
        } else {
          resolve("File written successfully.");
        }
      });
    });
  },
  readFile: ({ path }) => {
    return new Promise((resolve, reject) => {
      fs.readFile(path, "utf8", (err, data) => {
        if (err) {
          resolve(`Error reading from file: ${err.message}`);
        } else {
          resolve(data);
        }
      });
    });
  },
  executeCommand: ({ command }) => {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          resolve(`Error executing command: ${error.message}`);
        } else if (stderr) {
          resolve(`Command stderr: ${stderr}`);
        } else {
          resolve(stdout);
        }
      });
    });
  },
};

export const convertToolsToAnthropicFormat = (tools) => {
  if (!tools || !tools.length) return [];
  return tools.map((tool) => {
    const { function: func } = tool;
    const output = {
      name: func.name,
      description: func.description,
      input_schema: {
        type: func.parameters.type,
        properties: func.parameters.properties,
        required: func.parameters.required
      }
    };
    return output;
  })
};

export const convertToolsToGeminiFormat = (tools) => {
  if (!tools || !tools.length) return [];
  return tools.map((tool) => {
    const { function: func } = tool;
    const output = {
      name: func.name,
      parameters: {
        type: func.parameters.type.toUpperCase(),
        description: func.description,
        properties: Object.entries(func.parameters.properties).reduce((acc, [key, value]) => {
          acc[key] = {
            type: value.type.toUpperCase(),
            description: value.description
          };
          return acc;
        }, {}),
        required: func.parameters.required
      }
    };
    return output;
  });
};
