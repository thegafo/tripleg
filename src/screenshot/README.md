# Screenshot Utility

This module provides a utility to take interactive screenshots on a macOS system using Node.js. It leverages the `screencapture` command available in macOS.

## Usage

Here's how you can use the `screenshot` function in this module:

### Importing the Function

First, you need to import the `screenshot` function from the module:

```javascript
import { screenshot } from "./screenshot.js";
```

### Taking a Screenshot

You can capture a screenshot by specifying a directory where the screenshot will be saved. The screenshot file will be named based on the current date and time to ensure uniqueness.

```javascript
const directory = "/path/to/your/directory"; // Specify the directory path
screenshot(directory)
  .then((filePath) => console.log(`Screenshot saved to ${filePath}`))
  .catch((err) => console.error(`Error: ${err.message}`));
```

This function makes the user select an area of their screen to capture, and the resulting screenshot is saved to the specified directory.
