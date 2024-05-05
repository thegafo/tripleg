import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let child = null;

// Define a single reusable function to handle process exit
const killChildOnExit = () => {
  if (child) {
    child.kill();
    child = null;
  }
};

export function status(icon = "bolt.horizontal") {
  try {
    const command = `test -f ${__dirname}/Status || swiftc -o ${__dirname}/Status ${__dirname}/Status.swift -framework Cocoa`;
    exec(command, (error) => {
      if (error) return;
      if (child) {
        child.kill();
        child = null;
        process.removeListener('exit', killChildOnExit);  // Remove the existing listener
      }
      child = exec(`STATUS_ICON=${icon} ${__dirname}/Status`, (error, stdout) => {
        if (error) return;
        process.exit();
      });
      process.on('exit', killChildOnExit); // Re-add the listener
    });
  } catch { }
}

status();