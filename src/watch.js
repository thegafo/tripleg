import chokidar from 'chokidar';
import { EventEmitter } from 'events';

export function watch(directory) {
  const emitter = new EventEmitter();
  const watcher = chokidar.watch(directory, {
    persistent: true,
    ignoreInitial: true,
    depth: 0,
  });

  watcher.on('add', path => emitter.emit('data', path));

  // Clean up when the process exits
  process.on('exit', () => {
    watcher.close();
  });

  // Return the event emitter directly
  return emitter;
}
