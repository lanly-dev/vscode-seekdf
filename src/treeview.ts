import { TreeDataProvider, TreeItem, TreeItemCollapsibleState, window } from 'vscode'
import { FolderInfo } from './interfaces'

class FolderTreeItem extends TreeItem {
  constructor(public readonly label: string, public readonly parentName: string) {
    super(`${label} (Parent: ${parentName})`, TreeItemCollapsibleState.None)
  }
}

class FolderTreeDataProvider implements TreeDataProvider<FolderTreeItem> {
  constructor(private folders: FolderInfo[]) { }

  getTreeItem(element: FolderTreeItem): TreeItem {
    return element
  }

  getChildren(): FolderTreeItem[] {
    if (this.folders.length === 0)
      return [new FolderTreeItem('No folders found. Please perform a search.', '')]

    return this.folders.map(folder => new FolderTreeItem(folder.path, folder.parentName || ''))
  }
}

export function registerTreeDataProvider(folders: FolderInfo[]) {
  const treeDataProvider = new FolderTreeDataProvider(folders)
  window.registerTreeDataProvider('seekdfTreeView', treeDataProvider)
}
