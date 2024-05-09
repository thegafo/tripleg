# OCR Module

The OCR module provides an interface for performing optical character recognition (OCR) on images using Node.js and Swift. This module consists of two main files:

- `OCR.swift`: This Swift file defines a function for performing text recognition using Apple's Vision framework. It processes an image file to detect and extract textual content.

- `ocr.js`: This JavaScript file manages the execution of the Swift OCR application. It compiles the Swift code if necessary, executes it, and handles the output of recognized text.

## How It Works

1. The `ocr.js` file checks if the Swift executable exists; if not, it compiles `OCR.swift` and runs the compiled program with the image path as an argument.
2. The `OCR.swift` file reads the image, applies text recognition, and prints the recognized text to the standard output.
3. The Node.js application uses the standard output to obtain and return the recognized text.

## Usage

To use the module, call the `ocr()` function from `ocr.js` with the path to an image file. The function returns a promise that resolves with the recognized text or rejects if an error occurs.
