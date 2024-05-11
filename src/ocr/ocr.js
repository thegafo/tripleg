
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function ocr(filePath) {
  return new Promise((resolve, reject) => {
    try {
      const command = `test -f ${__dirname}/OCR || (swiftc -o ${__dirname}/OCR ${__dirname}/OCR.swift -framework AppKit -framework Vision); ${__dirname}/OCR "${filePath}"`;
      exec(command, (error, stdout) => {
        if (error) return reject(error);
        resolve(stdout);
      });
    } catch (err) {
      reject(err);
    }
  })
}
