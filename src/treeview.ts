import { TreeDataProvider, TreeItem, window, EventEmitter, Event, commands, Uri, ThemeIcon } from 'vscode'
import { TargetInfo, TermSearch } from './interfaces'
import { TreeItemCollapsibleState as CoState } from 'vscode'

let prettyBytes: any
import('pretty-bytes').then(module => {
  prettyBytes = module.default
}) // Import pretty-bytes dynamically

const { Collapsed, Expanded, None } = CoState

let showIndexAndCount = true // Add a global variable to track the toggle state

class SeekTreeItem extends TreeItem {
  constructor(
    text: string,
    public readonly size: number,
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

    // Set icon based on whether it's a directory or file
    this.iconPath = kids ? new ThemeIcon('folder') : new ThemeIcon('file')
  }
}

class SeekTreeDataProvider implements TreeDataProvider<SeekTreeItem> {
  private _onDidChangeTreeData: EventEmitter<void> = new EventEmitter<void>()
  readonly onDidChangeTreeData: Event<void> = this._onDidChangeTreeData.event

  constructor(private terms: TermSearch[]) { }

  getTreeItem(element: SeekTreeItem): SeekTreeItem {
    element.contextValue = 'seekTreeItem' // Add context value for context menu
    return element
  }

  getChildren(element?: SeekTreeItem): SeekTreeItem[] {
    if (!element) return this.terms.map((term) => new SeekTreeItem(term.text, term.totalSize, term.kids))
    else {
      if (!element.kids) return []
      return element.kids.map((kid, index) => new SeekTreeItem(kid.name, kid.size, kid.kids, index, kid.path))
    }
  }

  addTerm(term: TermSearch): void {
    this.terms.push(term)
    this._onDidChangeTreeData.fire()
  }

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }
}

export function registerTreeDataProvider(terms: TermSearch[]): SeekTreeDataProvider {
  const treeDataProvider = new SeekTreeDataProvider(terms)
  window.registerTreeDataProvider('seekdfTreeView', treeDataProvider)

  // Register the toggle command
  commands.registerCommand('seekdf.toggleIndexAndCount', () => {
    showIndexAndCount = !showIndexAndCount
    treeDataProvider.refresh() // Refresh the tree view
  })

  // Register the reveal in file explorer command
  commands.registerCommand('seekdf.revealInFileExplorer', (item: SeekTreeItem) => {
    if (!item.path) return
    const uri = Uri.file(item.path)
    commands.executeCommand('revealFileInOS', uri)
  })

  return treeDataProvider
}
