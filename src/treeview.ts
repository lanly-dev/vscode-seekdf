import { TreeDataProvider, TreeItem, TreeItemCollapsibleState, window, EventEmitter, Event } from 'vscode'
import { TargetInfo } from './interfaces'

class FolderTreeItem extends TreeItem {
  constructor(public readonly label: string, public readonly parentName: string) {
    super(`${label} (Parent: ${parentName})`, TreeItemCollapsibleState.None)
  }
}

class FolderTreeDataProvider implements TreeDataProvider<FolderTreeItem> {
  private _onDidChangeTreeData: EventEmitter<FolderTreeItem | undefined | void> =
    new EventEmitter<FolderTreeItem | undefined | void>()
  readonly onDidChangeTreeData: Event<FolderTreeItem | undefined | void> = this._onDidChangeTreeData.event

  constructor(private folders: TargetInfo[]) { }

  getTreeItem(element: FolderTreeItem): TreeItem {
    return element
  }

  getChildren(): FolderTreeItem[] {
    if (this.folders.length === 0)
      return [new FolderTreeItem('No folders found. Please perform a search.', '')]

    return this.folders.map(folder => new FolderTreeItem(folder.path, folder.parentName || ''))
  }

  refresh(folders: TargetInfo[]): void {
    this.folders = folders
    this._onDidChangeTreeData.fire()
  }
}

export function registerTreeDataProvider(folders: TargetInfo[]): FolderTreeDataProvider {
  const treeDataProvider = new FolderTreeDataProvider(folders)
  // window.registerTreeDataProvider('seekdfTreeView', treeDataProvider)
  return treeDataProvider
}
