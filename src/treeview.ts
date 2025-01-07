import { TreeDataProvider, TreeItem, TreeItemCollapsibleState as CoState, window, EventEmitter, Event } from 'vscode'
import { TermSearch } from './interfaces'
const { Expanded, None } = CoState

class TermTreeItem extends TreeItem {
  constructor(
    public readonly text: string,
    public readonly collapsibleState: CoState,
    public readonly index: number,
    public readonly totalCount: number
  ) {
    super(`${index + 1}. ${text} (Total: ${totalCount})`, collapsibleState)
  }
}

class TermTreeDataProvider implements TreeDataProvider<TermTreeItem> {
  private _onDidChangeTreeData: EventEmitter<TermTreeItem | undefined | void> =
    new EventEmitter<TermTreeItem | undefined | void>()
  readonly onDidChangeTreeData: Event<TermTreeItem | undefined | void> = this._onDidChangeTreeData.event

  constructor(private terms: TermSearch[]) { }

  getTreeItem(element: TermTreeItem): TermTreeItem {
    console.debug(element)
    return element
  }

  getChildren(element?: TermTreeItem): TermTreeItem[] {
    if (!element) {
      return this.terms.map((term, index) =>
        new TermTreeItem(term.text, Expanded, index, this.terms.length))
    } else {
      const term = this.terms.find(t => t.text === element.text)
      if (term) {
        return term.kids.map((kid, index) =>
          new TermTreeItem(kid.path, None, index, term.kids.length))
      }
    }
    return []
  }

  addTerm(term: TermSearch): void {
    this.terms.push(term)
    this._onDidChangeTreeData.fire()
  }
}

export function registerTreeDataProvider(terms: TermSearch[]): TermTreeDataProvider {
  const treeDataProvider = new TermTreeDataProvider(terms)
  window.registerTreeDataProvider('seekdfTreeView', treeDataProvider)
  return treeDataProvider
}
