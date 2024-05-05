// Importing necessary modules
import clipboard from 'clipboardy';
import EventEmitter from 'events';

// Function to monitor clipboard changes
export function monitorClipboard(ms = 500) {
  const emitter = new EventEmitter();
  let lastClip = clipboard.readSync();  // Initial read to set a baseline for comparison

  setInterval(() => {
    const currentClip = clipboard.readSync();  // Read current clipboard content
    if (currentClip !== lastClip) {
      emitter.emit('data', currentClip);  // Emit event if clipboard content changes
      lastClip = currentClip;  // Update lastClip to the new content
    }
  }, ms);

  return emitter;
}
