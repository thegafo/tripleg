# Status Module

The Status module provides an interface for dynamically updating the status icon in the macOS menu bar using Node.js and Swift. The module consists of two main files:

- `Status.swift`: This Swift file defines the macOS application that creates a menu bar status item. It uses SwiftUI to handle the status icon and a menu with a quit option. The application listens for input from the command line to update the icon dynamically.

- `status.js`: This JavaScript file handles the execution and management of child processes to compile and run the Swift application. It imports necessary Node.js modules and defines functions to handle process management and status updates.

## How It Works

1. The `status.js` file compiles the Swift code if the binary does not exist and then runs it, passing environment variables to customize the icon.
2. The `Status.swift` application initializes a status item in the macOS menu bar. When launched, it continuously listens for command-line inputs to update the icon according to the input received.
3. Users can update the status icon by providing new icon names through the Node.js application, which communicates these changes to the Swift application via standard input.

## Usage

To use the module, simply call the `status()` function from `status.js` with an icon name to initialize and call `updateStatus()` to update the menu bar icon dynamically.
