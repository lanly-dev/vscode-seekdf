export interface TargetInfo {
  type: 'dir' | 'file'
  path: string
  size: number
  parent: string | null
  parentName: string | null
}

export interface TermSearch {
  kids: TargetInfo[]
  text: string
}
