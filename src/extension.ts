import { ExtensionContext, RelativePattern, window } from 'vscode'
import {commands, workspace } from 'vscode'
import { registerTreeDataProvider } from './treeview'

export function activate(context: ExtensionContext) {

  const rc = commands.registerCommand
  context.subscriptions.concat([
    rc('seekdf.searchFolders', async () => {
      const targetName = await window.showInputBox({ prompt: 'Enter the target folder name' })
      if (targetName) {
        const folders = await searchFolders(targetName)
        registerTreeDataProvider(folders)
      }
    })
  ])
}

// Function to search and return a list of target name folders
export async function searchFolders(targetName: string): Promise<string[]> {
  const workspaceFolders = workspace.workspaceFolders
  if (!workspaceFolders) return []

  const result: string[] = []
  for (const folder of workspaceFolders) {
    const folders = await workspace.findFiles(new RelativePattern(folder, `**/${targetName}`))
    result.push(...folders.map(f => f.fsPath))
  }
  console.debug('result:', result)
  return result
}

// This method is called when your extension is deactivated
export function deactivate() {}
