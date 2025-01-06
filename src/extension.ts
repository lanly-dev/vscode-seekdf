import { ExtensionContext, window, commands } from 'vscode'
import { registerTreeDataProvider } from './treeview'
import { seek } from './actions'
import { TargetType } from './interfaces'
const { DIR, FILE } = TargetType

export function activate(context: ExtensionContext) {
  const rc = commands.registerCommand
  const treeDataProvider = registerTreeDataProvider([])

  context.subscriptions.push(
    rc('seekdf.seekDirs', async () => {
      const targetName = await window.showInputBox({ prompt: 'Enter the target directory name' })
      if (targetName) {
        const folders = await seek(targetName, DIR)
        treeDataProvider.refresh([{ text: targetName, kids: folders }])
      }
    }),
    rc('seekdf.seekFiles', async () => {
      const targetName = await window.showInputBox({ prompt: 'Enter the target files name' })
      if (targetName) {
        const files = await seek(targetName, FILE)
        treeDataProvider.refresh([{ text: targetName, kids: files }])
      }
    })
  )
}

// This method is called when your extension is deactivated
export function deactivate() {}
