import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'
import { TargetInfo, TargetType } from './interfaces'
const { DIR, FILE } = TargetType

function getCurrentWorkspacePath(): string {
  const { workspaceFolders } = vscode.workspace
  if (workspaceFolders?.length) return workspaceFolders[0].uri.fsPath
  throw new Error('No workspace folder is open')
}

function getDirSize(folderPath: string): number {
  const files = fs.readdirSync(folderPath)
  let totalSize = 0

  for (const file of files) {
    const filePath = path.join(folderPath, file)
    const stats = fs.statSync(filePath)
    if (stats.isFile()) totalSize += stats.size
    else if (stats.isDirectory()) totalSize += getDirSize(filePath)
  }
  return totalSize
}

export async function seekDirs(thePath: string, targetName: string): Promise<TargetInfo[]> {
  let foundFolders: TargetInfo[] = []
  const items = fs.readdirSync(thePath, { withFileTypes: true })

  for (const item of items) {
    if (item.isFile()) continue
    const itemPath = path.join(thePath, item.name)

    if (item.name === targetName) {
      foundFolders.push({
        type: DIR,
        path: itemPath,
        size: getDirSize(itemPath),
        parent: thePath,
        parentName: path.basename(thePath)
      })
    }

    const subFolders = await seekDirs(itemPath, targetName)
    foundFolders = foundFolders.concat(subFolders)
  }
  return foundFolders
}

export async function seekFiles(thePath: string, targetName: string): Promise<TargetInfo[]> {
  let foundFiles: TargetInfo[] = []
  const items = fs.readdirSync(thePath, { withFileTypes: true })

  for (const item of items) {
    const itemPath = path.join(thePath, item.name)

    if (item.isFile() && item.name === targetName) {
      const stats = fs.statSync(itemPath)
      foundFiles.push({
        type: FILE,
        path: itemPath,
        size: stats.size,
        parent: thePath,
        parentName: path.basename(thePath)
      })
    } else if (item.isDirectory()) {
      const subFiles = await seekFiles(itemPath, targetName)
      foundFiles = foundFiles.concat(subFiles)
    }
  }
  return foundFiles
}

export async function seek(targetName: string, type: TargetType): Promise<TargetInfo[]> {
  const workspacePath = getCurrentWorkspacePath()
  const fn = type === DIR ? seekDirs : seekFiles
  return fn(workspacePath, targetName)
}
