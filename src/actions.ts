import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'
import { TargetInfo, TargetType } from './interfaces'

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

export async function seekDirs(dir: string, targetName: string): Promise<TargetInfo[]> {

  let foundFolders: TargetInfo[] = []
  const items = fs.readdirSync(dir, { withFileTypes: true })

  for (const item of items) {
    const itemPath = path.join(dir, item.name)

    if (item.isDirectory()) {
      if (item.name === targetName) {
        const stats = fs.statSync(itemPath)
        foundFolders.push({
          type: 'dir',
          path: itemPath,
          size: getDirSize(itemPath),
          parent: dir,
          parentName: path.basename(dir)
        })
      }

      const subFolders = await seekDirs(itemPath, targetName)
      foundFolders = foundFolders.concat(subFolders)
    }
  }
  return foundFolders
}

export async function seekFiles(dir: string, targetName: string): Promise<TargetInfo[]> {

  let foundFiles: TargetInfo[] = []
  const items = fs.readdirSync(dir, { withFileTypes: true })

  for (const item of items) {
    const itemPath = path.join(dir, item.name)

    if (item.isFile() && item.name === targetName) {
      const stats = fs.statSync(itemPath)
      foundFiles.push({
        type: 'file',
        path: itemPath,
        size: stats.size,
        parent: dir,
        parentName: path.basename(dir)
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
  if (type === TargetType.DIR) return seekDirs(workspacePath, targetName)
  return seekFiles(workspacePath, targetName)
}
