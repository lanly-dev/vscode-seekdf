import { TreeDataProvider, TreeItem, TreeItemCollapsibleState as CoState, window, EventEmitter, Event } from 'vscode'
import { TargetInfo, TermSearch } from './interfaces'
const { Collapsed,Expanded, None } = CoState

class SeekTreeItem extends TreeItem {
  constructor(
    text: string,
    public readonly kids: TargetInfo[] | null,
    public readonly size: number,
    public readonly index?: number
  ) {
    let i = ''
    let cState = None
    if (index !== undefined) {
      i = index + 1 + '. '
      if (kids) cState = Collapsed
    } else if (kids) cState = Expanded
    const count = kids ? `(${kids?.length})` : ''
    super(`${i}${text} ${count} - ${size}`, cState)
  }
}

class SeekTreeDataProvider implements TreeDataProvider<SeekTreeItem> {
  private _onDidChangeTreeData: EventEmitter<void> = new EventEmitter<void>()
  readonly onDidChangeTreeData: Event<void> = this._onDidChangeTreeData.event

  constructor(private terms: TermSearch[]) { }

  getTreeItem(element: SeekTreeItem): SeekTreeItem {
    return element
  }

  getChildren(element?: SeekTreeItem): SeekTreeItem[] {
    if (!element) return this.terms.map((term) => new SeekTreeItem(term.text, term.kids, term.totalSize))
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
