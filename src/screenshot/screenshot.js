import { exec } from 'child_process';
import { join } from 'path';

export async function screenshot(directory) {
  return new Promise((resolve, reject) => {
    const fileName = new Date().toISOString().replace(/[:.]/g, '-') + '.png';
    const filePath = join(directory, fileName);

    exec(`screencapture -i ${filePath}`, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(filePath);
      }
    });
  });
}