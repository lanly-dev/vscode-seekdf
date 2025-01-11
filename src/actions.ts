import { exec } from 'child_process'
import { window, workspace, ProgressLocation } from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

import { TargetInfo, TargetType, TermSearch } from './interfaces'

const { DIR, FILE } = TargetType
const channel = window.createOutputChannel('SeekDF')

function getCurrentWorkspacePath(): string {
  const { workspaceFolders } = workspace
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

export async function seekDirs(thePath: string, targetName: string): Promise<TargetInfo[] | null> {
  let foundFolders: TargetInfo[] = []
  const items = fs.readdirSync(thePath, { withFileTypes: true })

  for (const item of items) {
    if (item.isFile()) continue
    const itemPath = path.join(thePath, item.name)

    if (item.name === targetName) {
      const subFolders = await seekDirs(itemPath, targetName)
      const parentName = path.basename(thePath)
      foundFolders.push({
        type: DIR,
        name: path.join(parentName, item.name),
        term: targetName,
        path: itemPath,
        size: getDirSize(itemPath),
        parent: thePath,
        parentName,
        kids: subFolders?.length ? subFolders : null
      })
    } else {
      const subFolders = await seekDirs(itemPath, targetName)
      if (subFolders) foundFolders = foundFolders.concat(subFolders)
    }
  }
  return foundFolders.length ? foundFolders : null
}

export async function seekFiles(thePath: string, targetName: string): Promise<TargetInfo[] | null> {
  let foundFiles: TargetInfo[] = []
  const items = fs.readdirSync(thePath, { withFileTypes: true })

  for (const item of items) {
    const itemPath = path.join(thePath, item.name)

    if (item.isFile() && item.name === targetName) {
      const stats = fs.statSync(itemPath)
      const parentName = path.basename(thePath)
      foundFiles.push({
        type: FILE,
        name: path.join(parentName, item.name),
        term: targetName,
        path: itemPath,
        size: stats.size,
        parent: thePath,
        parentName
      })
    } else if (item.isDirectory()) {
      const subFiles = await seekFiles(itemPath, targetName)
      if (subFiles) foundFiles = foundFiles.concat(subFiles)
    }
  }
  return foundFiles.length ? foundFiles : null
}

export async function seek(targetName: string, type: TargetType): Promise<TermSearch> {
  const workspacePath = getCurrentWorkspacePath()
  const fn = type === DIR ? seekDirs : seekFiles
  let kids
  const progressOptions = {
    location: ProgressLocation.Notification,
    title: `Seeking ${type === DIR ? 'directories' : 'files'} for "${targetName}"...`,
    cancellable: false
  }

  await window.withProgress(progressOptions, async () => {
    try {
      kids = await fn(workspacePath, targetName)
    } catch (error) {
      if (error instanceof Error) {
        window.showErrorMessage(error.message)
        channel.append(`${error.message}❌\n`)
      } else {
        window.showErrorMessage('An unknown error occurred')
        channel.append('An unknown error occurred❌\n')
      }
    }
  })

  let totalSize = 0
  if (kids) {
    const calculateTotalSize = (items: TargetInfo[]) => {
      for (const item of items) {
        totalSize += item.size
        if (item.kids) calculateTotalSize(item.kids)
      }
    }
    calculateTotalSize(kids)
  }
  return { text: targetName, kids: kids ?? null, totalSize, type }
}

export function moveToTrash(filePath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const command = [
      'powershell.exe -Command',
      `"$shell = New-Object -ComObject 'Shell.Application';`,
      '$recycleBin = $shell.Namespace(10);',
      `$recycleBin.MoveHere('${filePath}')"`
    ].join(' ')
    exec(command, (error, stdout, stderr) => {
      if (error) {
        window.showErrorMessage(`Error moving ${filePath} to recycle bin: ${error.message}`)
        channel.append(`Error moving ${filePath} to recycle bin: ${error.message}❌\n`)
        reject(error)
      } else {
        channel.show()
        channel.append(`Successfully moved ${filePath} to recycle bin✅\n`)
        resolve()
      }
    })
  })
}
