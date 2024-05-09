
import { spawn } from 'child_process';
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
    // Start the build process
    child = spawn('sh', ['-c', command], { stdio: 'inherit' });

    child.on('close', (code) => {
      if (code !== 0) return; // Exit if the build fails

      if (child) {
        killChildOnExit();
      }

      // Run the Status program
      child = spawn(`${__dirname}/Status`, [], {
        env: { STATUS_ICON: icon },
      });

      child.on('close', () => {
        killChildOnExit();
        process.exit();
      });

      process.on('exit', killChildOnExit); // Re-add the listener to handle exit
    });

  } catch { }
}

export function updateStatus(input) {
  if (child && child.stdin) {
    child.stdin.write(input + "\n");
  } else {
    console.error('No active child process to send input to.');
  }
}


status("bolt.horizontal");