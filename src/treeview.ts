import { TreeDataProvider, TreeItem, TreeItemCollapsibleState as CoState, window, EventEmitter, Event } from 'vscode'
import { TargetInfo, TermSearch } from './interfaces'
const { Expanded, None } = CoState

class SeekTreeItem extends TreeItem {
  constructor(
    text: string,
    public readonly kids: TargetInfo[] | null,
    public readonly size: number,
    public readonly index?: number
  ) {
    const i = index !== undefined ? index + 1 + '. ' : ''
    const count = kids ? `(${kids?.length})` : ''
    const cState = kids ? Expanded : None
    super(`${i}${text} ${count} - ${size}`, cState)
  }
}

class SeekTreeDataProvider implements TreeDataProvider<SeekTreeItem> {
  private _onDidChangeTreeData: EventEmitter<void> = new EventEmitter<void>()
  readonly onDidChangeTreeData: Event<void> = this._onDidChangeTreeData.event

  constructor(private terms: TermSearch[]) { }

  getTreeItem(element: SeekTreeItem): SeekTreeItem {
    console.debug(element)
    return element
  }

  getChildren(element?: SeekTreeItem): SeekTreeItem[] {
    if (!element) return this.terms.map((term, index) => new SeekTreeItem(term.text, term.kids, 0))
    else {
      if (!element.kids) return []
      return element.kids.map((kid, index) => new SeekTreeItem(kid.name, kid.kids, kid.size, index))
    }
  }

  addTerm(term: TermSearch): void {
    this.terms.push(term)
    this._onDidChangeTreeData.fire()
  }
}

export function registerTreeDataProvider(terms: TermSearch[]): SeekTreeDataProvider {
  const treeDataProvider = new SeekTreeDataProvider(terms)
  window.registerTreeDataProvider('seekdfTreeView', treeDataProvider)
  return treeDataProvider
}
