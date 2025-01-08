import { TreeDataProvider, TreeItem, EventEmitter, Event, Uri, ThemeIcon, ExtensionContext } from 'vscode'
import { TreeItemCollapsibleState as CoState } from 'vscode'
import { window, commands } from 'vscode'

import { TargetInfo, TargetType, TermSearch } from './interfaces'

let prettyBytes: any
import('pretty-bytes').then(module => {
  prettyBytes = module.default
}) // Import pretty-bytes dynamically

const { Collapsed, Expanded, None } = CoState

let showIndexAndCount = true // Add a global variable to track the toggle state

class SeekTreeItem extends TreeItem {
  constructor(
    text: string,
    // Need this to be public?
    public readonly size: number,
    public readonly type: TargetType | null,
    public readonly kids?: TargetInfo[] | null,
    public readonly index?: number,
    public readonly path?: string
  ) {
    let i = ''
    let cState = None
    if (index !== undefined) {
      i = index + 1 + '. '
      if (kids) cState = Collapsed
    } else if (kids) cState = Expanded
    const count = kids ? `(${kids?.length})` : ''
    const humanReadableSize = prettyBytes(size)
    const label = showIndexAndCount ? `${i}${text} ${count} - ${humanReadableSize}` : text
    super(label, cState)
    this.contextValue = 'resultTreeItem'
    if (type) {
      this.iconPath = new ThemeIcon(type === TargetType.DIR ? 'folder' : 'file')
      this.contextValue = 'termTreeItem'
    }
    // Add a command to remove the term
    this.command = {
      command: 'seekdf.removeTerm',
      title: 'Remove Term',
      arguments: [this]
    }
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
    if (!element) return this.terms.map((term) => new SeekTreeItem(term.text, term.totalSize, term.type, term.kids))
    else {
      if (!element.kids) return []
      return element.kids.map((kid, index) => new SeekTreeItem(kid.name, kid.size, null, kid.kids, index, kid.path))
    }
  }

  addTerm(term: TermSearch): void {
    this.terms.push(term)
    this._onDidChangeTreeData.fire()
  }

  removeTerm(term: TermSearch): void {
    this.terms = this.terms.filter((t) => t.text !== term.text)
    this._onDidChangeTreeData.fire()
  }

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }
}

export function registerTreeDataProvider(context: ExtensionContext, terms: TermSearch[]): SeekTreeDataProvider {
  const treeDataProvider = new SeekTreeDataProvider(terms)
  window.registerTreeDataProvider('seekdfTreeView', treeDataProvider)
  const rc = commands.registerCommand

  context.subscriptions.push(
    rc('seekdf.toggleIndexAndCount', () => {
      showIndexAndCount = !showIndexAndCount
      treeDataProvider.refresh()
    }),
    rc('seekdf.revealInFileExplorer', (item: SeekTreeItem) => {
      if (!item.path) return
      const uri = Uri.file(item.path)
      commands.executeCommand('revealFileInOS', uri)
    }),
    rc('seekdf.removeTerm', (item: SeekTreeItem) => {
      const term = terms.find(term => term.text === item.label)
      if (term) treeDataProvider.removeTerm(term)
    })
  )

  return treeDataProvider
}
