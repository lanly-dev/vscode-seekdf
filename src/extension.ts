import { ExtensionContext, window, commands } from 'vscode'
import { registerTreeDataProvider } from './treeview'
import { searchFolders } from './actions'

export function activate(context: ExtensionContext) {
  const rc = commands.registerCommand
  context.subscriptions.concat([
    rc('seekdf.searchFolders', async () => {
      const targetName = await window.showInputBox({ prompt: 'Enter the target folder name' })
      if (targetName) {
        const folders = await searchFolders(null, targetName)
        registerTreeDataProvider(folders)
      }
    })
  ])
}

// This method is called when your extension is deactivated
export function deactivate() {}
