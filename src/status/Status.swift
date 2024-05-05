import Cocoa
import SwiftUI // Import SwiftUI for SF Symbols

class StatusItemController: NSObject {
    let statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
    
    override init() {
        super.init()
        
        if let button = statusItem.button {
            if let image = NSImage(systemSymbolName: "bolt.horizontal", accessibilityDescription: nil) {
                button.image = image
                button.action = #selector(showPopover(sender:))
            } else {
                print("Failed to load SF Symbol: magnifyingglass")
            }
        }
    }
    
    @objc func showPopover(sender: AnyObject?) {
        // Implement popover behavior if needed
        // For example, display a menu or a popover view
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
