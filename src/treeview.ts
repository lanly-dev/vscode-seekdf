import { TreeDataProvider, TreeItem, EventEmitter, Event, Uri, ThemeIcon, ExtensionContext } from 'vscode'
import { TreeItemCollapsibleState as CoState } from 'vscode'
import { commands, window, workspace } from 'vscode'
import * as os from 'os'
import pb from 'pretty-bytes'

import { TargetInfo, TargetType, TermSearch } from './interfaces'
import { seek, moveToTrash } from './actions'
const { DIR, FILE } = TargetType

const { Collapsed, Expanded, None } = CoState

let showDetail = workspace.getConfiguration('seekdf').get('showDetail', true)

class SeekTreeItem extends TreeItem {
  constructor(
    public readonly text: string,
    public readonly size: number, // Need this to be public?
    public readonly type: TargetType,
    public readonly term: string,
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
    const humanReadableSize = pb(size)
    const label = showDetail ? `${i}${text} ${count} - ${humanReadableSize}` : text
    super(label, cState)
    if (index === undefined) {
      this.iconPath = new ThemeIcon(type === TargetType.DIR ? 'folder' : 'file')
      this.contextValue = 'termTreeItem'
      if (cState === None) this.contextValue = 'noKidsTermTreeItem'
    } else {
      this.tooltip = path
      this.contextValue = 'resultTreeItem'
    }
    this.id = `${term}${index ?? ''}${this.contextValue}${type}${size}` // Keep expansion state
  }
}

class SeekTreeDataProvider implements TreeDataProvider<SeekTreeItem> {
  private _onDidChangeTreeData: EventEmitter<void> = new EventEmitter<void>()
  readonly onDidChangeTreeData: Event<void> = this._onDidChangeTreeData.event

  private terms: TermSearch[] = []

  constructor() {
    // Bind the method to the instance
    this.refresh = this.refresh.bind(this)
    this.refreshTerm = this.refreshTerm.bind(this)
    this.removeTerm = this.removeTerm.bind(this)
    this.toggleViewDetail = this.toggleViewDetail.bind(this)
    this.updateViewItemCount()
  }

  getTreeItem(element: SeekTreeItem): SeekTreeItem {
    return element
  }

  getChildren(element?: SeekTreeItem): SeekTreeItem[] {
    let children: SeekTreeItem[] = []
    if (!element) {
      // These are term items
      if (this.terms.length === 0) return []
      children = this.terms.map((term) => new SeekTreeItem(term.text, term.totalSize, term.type, term.text, term.kids))
    } else {
      if (!element.kids) return []
      children = element.kids.map(
        (kid, index) => new SeekTreeItem(kid.name, kid.size, kid.type, kid.term, kid.kids, index, kid.path))
    }
    this.updateViewItemCount(children.length)
    return children
  }

  private updateViewItemCount(count: number = 0) {
    commands.executeCommand('setContext', 'viewItemCount', count)
  }

  async addTerm(targetName: string, type: TargetType): Promise<void> {
    const found = this.terms.find((t) => t.text === targetName && t.type === type)
    if (found) {
      window.showInformationMessage(`Term "${targetName}" already on the list.`)
      return
    }
    const newTerm = await seek(targetName, type)
    this.terms.unshift(newTerm)
    this._onDidChangeTreeData.fire()
  }

  removeTerm(item: SeekTreeItem): void {
    this.terms = this.terms.filter((t) => t.text !== item.term || t.type !== item.type)
    this.updateViewItemCount(this.terms.length)
    this._onDidChangeTreeData.fire()
  }

  refresh(): void {
    this._onDidChangeTreeData.fire()
    this.updateViewItemCount(this.terms.length)
  }

  refreshTerm(item: SeekTreeItem): void {
    this.removeTerm(item)
    this.addTerm(item.term, item.type)
  }
  toggleViewDetail() {
    showDetail = !showDetail
    workspace.getConfiguration('seekdf').update('showDetail', showDetail).then(this.refresh)
  }

  async deleteItem(item: SeekTreeItem): Promise<void> {
    if (os.platform() !== 'win32') {
      window.showInformationMessage('This action is only supported on Windows.')
      return
    }
    const confirm = await window.showWarningMessage(
      `Are you sure you want to move ${item.text} to the Recycle Bin?`, { modal: true }, 'Yes')
    if (confirm !== 'Yes') return
    if (item.index === undefined) {
      // It's a term item, move all items to trash
      const term = this.terms.find(t => t.text === item.text && t.type === item.type)
      if (term && term.kids) {
        for (const kid of term.kids) {
          // console.debug(kid.path)
          await moveToTrash(kid.path)
        }
      }
    } else {
      // It's a child item, move it to trash
      await moveToTrash(item.path!)
    }
    this.refreshTerm(item)
  }
}

export default function registerTreeDataProvider(context: ExtensionContext) {
  const treeDataProvider = new SeekTreeDataProvider()
  const rc = commands.registerCommand

  context.subscriptions.push(
    window.registerTreeDataProvider('seekdfTreeView', treeDataProvider),
    rc('seekdf.removeTerm', treeDataProvider.removeTerm),
    rc('seekdf.refreshTerm', treeDataProvider.refreshTerm),
    rc('seekdf.seekDirs', async () => {
      const targetName = await window.showInputBox({
        title: 'seekdf', prompt: 'Enter the target directory name, it must be exact', placeHolder: 'node_modules'
      })
      if (targetName) treeDataProvider.addTerm(targetName, DIR)
    }),
    rc('seekdf.seekFiles', async () => {
      const targetName = await window.showInputBox({
        title: 'seekdf', prompt: 'Enter the target name, it must be exact', placeHolder: 'package.json'
      })
      if (targetName) treeDataProvider.addTerm(targetName, FILE)
    }),
    rc('seekdf.toggleViewDetail1', treeDataProvider.toggleViewDetail),
    rc('seekdf.toggleViewDetail2', treeDataProvider.toggleViewDetail),
    rc('seekdf.revealInFileExplorer', (item: SeekTreeItem) => {
      if (!item.path) return
      const uri = Uri.file(item.path)
      commands.executeCommand('revealFileInOS', uri)
    }),
    rc('seekdf.deleteItem', (item: SeekTreeItem) => treeDataProvider.deleteItem(item))
  )
}
