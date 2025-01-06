import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'

function getCurrentWorkspacePath(): string {
  const workspaceFolders = vscode.workspace.workspaceFolders
  if (workspaceFolders && workspaceFolders.length > 0) return workspaceFolders[0].uri.fsPath
  throw new Error('No workspace folder is open')

}

export async function searchFolders(dir: string | null, targetName: string): Promise<string[]> {
  if (!dir) dir = getCurrentWorkspacePath()

  let foundFolders: string[] = []
  const items = fs.readdirSync(dir, { withFileTypes: true })

  for (const item of items) {
    const itemPath = path.join(dir, item.name)

    if (item.isDirectory()) {
      if (item.name === targetName)
        foundFolders.push(itemPath)

      const subFolders = await searchFolders(itemPath, targetName)
      foundFolders = foundFolders.concat(subFolders)
    }
  }
  console.debug(`Found folders: ${foundFolders}`)
  return foundFolders
}
