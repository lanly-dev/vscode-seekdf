import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'
import { FolderInfo } from './interfaces'

function getCurrentWorkspacePath(): string {
  const workspaceFolders = vscode.workspace.workspaceFolders
  if (workspaceFolders && workspaceFolders.length > 0) return workspaceFolders[0].uri.fsPath
  throw new Error('No workspace folder is open')
}

function getFolderSize(folderPath: string): number {
  const files = fs.readdirSync(folderPath)
  let totalSize = 0

  for (const file of files) {
    const filePath = path.join(folderPath, file)
    const stats = fs.statSync(filePath)
    if (stats.isFile()) totalSize += stats.size
    else if (stats.isDirectory()) totalSize += getFolderSize(filePath)
  }

  return totalSize
}

export async function searchFolders(dir: string | null, targetName: string): Promise<FolderInfo[]> {
  if (!dir) dir = getCurrentWorkspacePath()

  let foundFolders: FolderInfo[] = []
  const items = fs.readdirSync(dir, { withFileTypes: true })

  for (const item of items) {
    const itemPath = path.join(dir, item.name)

    if (item.isDirectory()) {
      if (item.name === targetName) {
        const stats = fs.statSync(itemPath)
        foundFolders.push({
          path: itemPath,
          size: getFolderSize(itemPath),
          parent: dir,
          parentName: path.basename(dir)
        })
      }

      const subFolders = await searchFolders(itemPath, targetName)
      foundFolders = foundFolders.concat(subFolders)
    }
  }
  return foundFolders
}
