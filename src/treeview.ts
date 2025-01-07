import { TreeDataProvider, TreeItem, TreeItemCollapsibleState as CoState, window, EventEmitter, Event } from 'vscode'
import { TargetInfo, TermSearch } from './interfaces'
const { Expanded, None } = CoState

class TermTreeItem extends TreeItem {
  constructor(
    public readonly text: string,
    public readonly collapsibleState: CoState,
    public readonly index: number,
    public readonly kids: TargetInfo[] | null
  ) {
    super(`${index + 1}. ${text} (Total: ${kids?.length})`, collapsibleState)
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
    if (!element) return this.terms.map((term, index) => new TermTreeItem(term.text, Expanded, index, term.kids))
    else {
      if (!element.kids) return []
      return element.kids?.map((kid, index) =>
        new TermTreeItem(kid.path, kid.kids?.length ? Expanded : None, index, kid.kids))

    }
    return []
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
