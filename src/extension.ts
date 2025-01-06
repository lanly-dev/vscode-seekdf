import { ExtensionContext, window, commands } from 'vscode'
import { registerTreeDataProvider } from './treeview'
import { searchFolders, searchFiles } from './actions'

export function activate(context: ExtensionContext) {
  const rc = commands.registerCommand
  const treeDataProvider = registerTreeDataProvider([])

  context.subscriptions.push(
    rc('seekdf.searchFolders', async () => {
      const targetName = await window.showInputBox({ prompt: 'Enter the target folder name' })
      if (targetName) {
        const folders = await searchFolders(null, targetName)
        treeDataProvider.refresh(folders)
      }
    }),
    rc('seekdf.searchFiles', async () => {
      const targetName = await window.showInputBox({ prompt: 'Enter the target file name' })
      if (targetName) {
        const files = await searchFiles(null, targetName)
        treeDataProvider.refresh(files)
      }
    })
  )
}

// This method is called when your extension is deactivated
export function deactivate() {}
