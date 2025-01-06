export enum TargetType {
  DIR = 'dir',
  FILE = 'file'
}

export interface TargetInfo {
  type: TargetType
  path: string
  size: number
  parent: string | null
  parentName: string | null
}

export interface TermSearch {
  kids: TargetInfo[]
  text: string
}
