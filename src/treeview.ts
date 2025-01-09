import { TreeDataProvider, TreeItem, EventEmitter, Event, Uri, ThemeIcon, ExtensionContext } from 'vscode'
import { TreeItemCollapsibleState as CoState } from 'vscode'
import { window, commands } from 'vscode'

import { TargetInfo, TargetType, TermSearch } from './interfaces'
import { seek } from './actions'
const { DIR, FILE } = TargetType

let prettyBytes: any
import('pretty-bytes').then(module => { prettyBytes = module.default }) // Import pretty-bytes dynamically

const { Collapsed, Expanded, None } = CoState

let showIndexAndCount = true // Add a global variable to track the toggle state

class SeekTreeItem extends TreeItem {
  constructor(
    public readonly text: string,
    public readonly size: number, // Need this to be public?
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
  }
}

class SeekTreeDataProvider implements TreeDataProvider<SeekTreeItem> {
  private _onDidChangeTreeData: EventEmitter<void> = new EventEmitter<void>()
  readonly onDidChangeTreeData: Event<void> = this._onDidChangeTreeData.event

  constructor(private terms: TermSearch[]) {
    // Bind the method to the instance
    this.refresh = this.refresh.bind(this)
    this.refreshTerm = this.refreshTerm.bind(this)
    this.removeTerm = this.removeTerm.bind(this)
  }

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

  async addTerm(targetName: string, type: TargetType): Promise<void> {
    if (this.terms.find((t) => t.text === targetName)) {
      window.showInformationMessage(`Term "${targetName}" already on the list.`)
      return
    }
    const newTerm = await seek(targetName, type)
    this.terms.push(newTerm)
    this._onDidChangeTreeData.fire()
  }

  removeTerm(item: SeekTreeItem): void {
    this.terms = this.terms.filter((t) => t.text !== item.text)
    this._onDidChangeTreeData.fire()
  }

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  refreshTerm(item: SeekTreeItem): void {
    this.removeTerm(item)
    this.addTerm(item.text, item.type!)
  }
}

export function registerTreeDataProvider(context: ExtensionContext, terms: TermSearch[]): SeekTreeDataProvider {
  const treeDataProvider = new SeekTreeDataProvider(terms)
  window.registerTreeDataProvider('seekdfTreeView', treeDataProvider)
  const rc = commands.registerCommand

  context.subscriptions.push(
    rc('seekdf.removeTerm', treeDataProvider.removeTerm),
    rc('seekdf.refreshTerm', treeDataProvider.refreshTerm),
    rc('seekdf.seekDirs', async () => {
      const targetName = await window.showInputBox({ prompt: 'Enter the target directory name' })
      if (targetName) treeDataProvider.addTerm(targetName, DIR)
    }),
    rc('seekdf.seekFiles', async () => {
      const targetName = await window.showInputBox({ prompt: 'Enter the target file name' })
      if (targetName) treeDataProvider.addTerm(targetName, FILE)
    }),
    rc('seekdf.toggleIndexAndCount', () => {
      showIndexAndCount = !showIndexAndCount
      treeDataProvider.refresh()
    }),
    rc('seekdf.revealInFileExplorer', (item: SeekTreeItem) => {
      if (!item.path) return
      const uri = Uri.file(item.path)
      commands.executeCommand('revealFileInOS', uri)
    })
  )

  return treeDataProvider
}
