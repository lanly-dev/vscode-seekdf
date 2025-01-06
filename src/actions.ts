import { workspace, RelativePattern } from 'vscode'

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
