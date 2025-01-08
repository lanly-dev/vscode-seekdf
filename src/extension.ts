import { ExtensionContext, window, commands } from 'vscode'
import { registerTreeDataProvider } from './treeview'
import { seek } from './actions'
import { TargetType } from './interfaces'
const { DIR, FILE } = TargetType

export function activate(context: ExtensionContext) {
  const rc = commands.registerCommand
  const treeDataProvider = registerTreeDataProvider(context, [])
  // No need to window.createTreeView ?

  context.subscriptions.push(
    rc('seekdf.seekDirs', async () => {
      const targetName = await window.showInputBox({ prompt: 'Enter the target directory name' })
      if (targetName) treeDataProvider.addTerm(await seek(targetName, DIR))
    }),
    rc('seekdf.seekFiles', async () => {
      const targetName = await window.showInputBox({ prompt: 'Enter the target file name' })
      if (targetName) treeDataProvider.addTerm(await seek(targetName, FILE))
    })
  )
}

// This method is called when your extension is deactivated
export function deactivate() { }
