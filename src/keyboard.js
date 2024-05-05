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