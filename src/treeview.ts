import { TreeDataProvider, TreeItem, TreeItemCollapsibleState as CoState, window, EventEmitter, Event } from 'vscode'
import { TermSearch } from './interfaces'
const { Expanded, None } = CoState

class TermTreeItem extends TreeItem {
  constructor(public readonly label: string, public readonly collapsibleState: CoState, index: number,
    totalCount: number) {
    console.debug(`TermTreeItem: ${label}, ${collapsibleState}, ${index}, ${totalCount}`)
    // super(`${index + 1}. ${label} (Total: ${totalCount})`, collapsibleState)
    // const text = `${label} (Total: ${totalCount})`
    const text = 'how are you'
    super(text, collapsibleState)
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
        new TermTreeItem(term.text, Expanded, index, this.terms.length))
    } else {
      const term = this.terms.find(t => t.text === element.label)
      if (term) {
        return term.kids.map((kid, index) =>
          new TermTreeItem(kid.path, None, index, term.kids.length))
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
