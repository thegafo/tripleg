import Cocoa
import SwiftUI // Import SwiftUI for SF Symbols

class StatusItemController: NSObject {
    let statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)

    override init() {
        super.init()

        let icon = ProcessInfo.processInfo.environment["STATUS_ICON"] ?? "bolt.horizontal"

        if let button = statusItem.button {
            if let image = NSImage(systemSymbolName: icon, accessibilityDescription: nil) {
                button.image = image
            } else {
                print("Failed to load SF Symbol: \(icon)")
            }
            setupMenu()
        }
    }

    func setupMenu() {
        let menu = NSMenu()
        let quitItem = NSMenuItem(title: "Quit", action: #selector(quitApp(sender:)), keyEquivalent: "")
        quitItem.target = self
        menu.addItem(quitItem)
        statusItem.menu = menu
    }

    func updateIcon(iconName: String) {
        if let image = NSImage(systemSymbolName: iconName, accessibilityDescription: nil) {
            statusItem.button?.image = image
        } else {
            print("Failed to load SF Symbol: \(iconName)")
        }
    }
    
    @objc func quitApp(sender: NSMenuItem) {
        print("Quit")
        NSApplication.shared.terminate(sender)
    }
}

let appDelegate = AppDelegate()

class AppDelegate: NSObject, NSApplicationDelegate {
    var statusItemController: StatusItemController!

    func applicationDidFinishLaunching(_ aNotification: Notification) {
        statusItemController = StatusItemController()
        // Start a new thread for the command line input to avoid blocking the main thread
        DispatchQueue.global(qos: .background).async {
            while true {
                print(">>> ")
                if let input = readLine() {
                    DispatchQueue.main.async {
                        self.statusItemController.updateIcon(iconName: input)
                    }
                }
            }
        }
    }

}

let app = NSApplication.shared
app.delegate = appDelegate
app.run()