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
      console.log("Writing to file", path);
      fs.writeFile(path, content, (err) => {
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
