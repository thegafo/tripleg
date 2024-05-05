import Foundation
import Vision
import AppKit

// Function to perform text recognition
func recognizeText(in imagePath: String) {
    guard let image = NSImage(contentsOfFile: imagePath) else {
        print("Failed to load image")
        return
    }

    guard let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        print("Cannot create CGImage from NSImage")
        return
    }

    let request = VNRecognizeTextRequest { (request, error) in
        guard error == nil else {
            print("Error in text recognition: \(error!.localizedDescription)")
            return
        }

        guard let observations = request.results as? [VNRecognizedTextObservation] else {
            print("No text found")
            return
        }

        for observation in observations {
            if let topCandidate = observation.topCandidates(1).first {
                print(topCandidate.string)
            }
        }
    }

    request.recognitionLevel = .accurate
    let requests = [request]
    
    let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    do {
        try handler.perform(requests)
    } catch {
        print("Failed to perform text recognition: \(error.localizedDescription)")
    }
}

// Main function to handle command line arguments
func main() {
    let arguments = CommandLine.arguments

    if arguments.count < 2 {
        print("Please provide an image path.")
        return
    }

    let imagePath = arguments[1]
    recognizeText(in: imagePath)
}

main()
