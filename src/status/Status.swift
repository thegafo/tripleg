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
    }
}

let app = NSApplication.shared
app.delegate = appDelegate
app.run()