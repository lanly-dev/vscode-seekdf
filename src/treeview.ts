import { TreeDataProvider, TreeItem, TreeItemCollapsibleState, window, EventEmitter, Event } from 'vscode'
import { TargetInfo, TermSearch } from './interfaces'

class FolderTreeItem extends TreeItem {
  constructor(public readonly label: string, public readonly parentName: string, index: number, totalCount: number) {
    super(`${index + 1}. ${label} (Parent: ${parentName}, Total: ${totalCount})`, TreeItemCollapsibleState.None)
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
    if (this.folders.length === 0) return [new FolderTreeItem('Welcome to seekdf.', '', 0, 0)]

    return this.folders.map((folder, index) =>
      new FolderTreeItem(folder.path, folder.parentName || '', index, this.folders.length))
  }

  refresh(folders: TargetInfo[]): void {
    this.folders = folders
    this._onDidChangeTreeData.fire()
  }
}

class TermTreeItem extends TreeItem {
  constructor(public readonly label: string, public readonly collapsibleState: TreeItemCollapsibleState, index: number,
    totalCount: number) {
    super(`${index + 1}. ${label} (Total: ${totalCount})`, collapsibleState)
  }
}

class TermTreeDataProvider implements TreeDataProvider<TermTreeItem> {
  private _onDidChangeTreeData: EventEmitter<TermTreeItem | undefined | void> =
    new EventEmitter<TermTreeItem | undefined | void>()
  readonly onDidChangeTreeData: Event<TermTreeItem | undefined | void> = this._onDidChangeTreeData.event

  constructor(private terms: TermSearch[]) { }

  getTreeItem(element: TermTreeItem): TreeItem {
    return element
  }

  getChildren(element?: TermTreeItem): TermTreeItem[] {
    if (!element) {
      return this.terms.map((term, index) =>
        new TermTreeItem(term.text, TreeItemCollapsibleState.Collapsed, index, this.terms.length))
    } else {
      const term = this.terms.find(t => t.text === element.label)
      if (term) {
        return term.kids.map((kid, index) =>
          new TermTreeItem(kid.path, TreeItemCollapsibleState.None, index, term.kids.length))
      }
    }
    return []
  }

  refresh(terms: TermSearch[]): void {
    this.terms = terms
    this._onDidChangeTreeData.fire()
  }
}

export function registerTreeDataProvider(terms: TermSearch[]): TermTreeDataProvider {
  const treeDataProvider = new TermTreeDataProvider(terms)
  window.registerTreeDataProvider('seekdfTreeView', treeDataProvider)
  return treeDataProvider
}
