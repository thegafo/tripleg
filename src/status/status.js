
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function status() {
  try {
    exec(`xcrun swiftc -o ${__dirname}/Status ${__dirname}/Status.swift -framework Cocoa`, (error, stdout, stderr) => {
      if (error) return;

      exec(`${__dirname}/Status`, (error, stdout, stderr) => {
        if (error) return;
      });
    });
  } catch { }
}
