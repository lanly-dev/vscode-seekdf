import { TreeDataProvider, TreeItem, TreeItemCollapsibleState, window } from 'vscode'

class FolderTreeItem extends TreeItem {
  constructor(public readonly label: string) {
    super(label, TreeItemCollapsibleState.None)
  }
}

class FolderTreeDataProvider implements TreeDataProvider<FolderTreeItem> {
  constructor(private folders: string[]) { }

  getTreeItem(element: FolderTreeItem): TreeItem {
    return element
  }

  getChildren(): FolderTreeItem[] {
    if (this.folders.length === 0)
      return [new FolderTreeItem('No folders found. Please perform a search.')]

    return this.folders.map(folder => new FolderTreeItem(folder))
  }
}

export function registerTreeDataProvider(folders: string[]) {
  const treeDataProvider = new FolderTreeDataProvider(folders)
  window.registerTreeDataProvider('seekdfTreeView', treeDataProvider)
}
