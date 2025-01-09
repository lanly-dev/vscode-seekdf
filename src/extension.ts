import { ExtensionContext } from 'vscode'
import { registerTreeDataProvider } from './treeview'

export function activate(context: ExtensionContext) {
  registerTreeDataProvider(context, [])
  // No need to window.createTreeView ?
}

// This method is called when your extension is deactivated
export function deactivate() { }
