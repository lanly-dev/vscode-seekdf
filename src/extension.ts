import { ExtensionContext, RelativePattern } from 'vscode'
import {commands, workspace } from 'vscode'

export function activate(context: ExtensionContext) {

  const rc = commands.registerCommand
  context.subscriptions.concat([
    rc('seekdf.searchFolders', searchFolders)
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

  return result
}

// This method is called when your extension is deactivated
export function deactivate() {}
