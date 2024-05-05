import { GlobalKeyboardListener } from 'node-global-key-listener';
import robot from 'robotjs';

robot.setKeyboardDelay(10);

export const type = async (text) => {
  if (text) {
    robot.typeString(text);
  }
}

export const backspace = async (count) => {
  for (let i = 0; i < count; i++) {
    robot.keyTap("backspace");
  }
}

export const listen = (callback) => {
  const v = new GlobalKeyboardListener({
    mac: {
      onError: (errorCode) => {
        console.log(
          `Error starting keyboard listener: ${errorCode}. Ensure you have the correct accesibility permissions.`
        );
        process.exit();
      },
    },
    windows: {
      onError: (errorMessage) => {
        console.log(
          `Error starting keyboard listener: ${errorMessage}. Ensure you have the correct accesibility permissions.`
        );
        process.exit();
      },
    },
  });
  v.addListener(callback);
}