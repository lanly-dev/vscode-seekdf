import { TreeDataProvider, TreeItem, TreeItemCollapsibleState as CoState, window, EventEmitter, Event } from 'vscode'
import { TargetInfo, TermSearch } from './interfaces'
const { Expanded, None } = CoState

class TermTreeItem extends TreeItem {
  constructor(
    text: string,
    public readonly kids: TargetInfo[] | null,
    public readonly index?: number
  ) {
    const i = index !== undefined ? index + 1 + '. ' : ''
    const count = kids ? `(${kids?.length})` : ''
    const cState = kids ? Expanded : None
    super(`${i}${text} ${count}`, cState)
  }
}

class TermTreeDataProvider implements TreeDataProvider<TermTreeItem> {
  private _onDidChangeTreeData: EventEmitter<void> = new EventEmitter<void>()
  readonly onDidChangeTreeData: Event<void> = this._onDidChangeTreeData.event

  constructor(private terms: TermSearch[]) { }

  getTreeItem(element: TermTreeItem): TermTreeItem {
    console.debug(element)
    return element
  }

  getChildren(element?: TermTreeItem): TermTreeItem[] {
    if (!element) return this.terms.map((term, index) => new TermTreeItem(term.text, term.kids))
    else {
      if (!element.kids) return []
      return element.kids.map((kid, index) => new TermTreeItem(kid.name, kid.kids, index))
    }
  }

  addTerm(term: TermSearch): void {
    console.log(term)
    this.terms.push(term)
    this._onDidChangeTreeData.fire()
  }
}

export function registerTreeDataProvider(terms: TermSearch[]): TermTreeDataProvider {
  const treeDataProvider = new TermTreeDataProvider(terms)
  window.registerTreeDataProvider('seekdfTreeView', treeDataProvider)
  return treeDataProvider
}
