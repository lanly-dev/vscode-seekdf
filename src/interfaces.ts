export enum TargetType {
  DIR = 'dir',
  FILE = 'file'
}

export interface TargetInfo {
  type: TargetType
  name: string
  term: string
  path: string
  size: number
  parent: string | null
  parentName: string | null
  kids?: TargetInfo[] | null
}

export interface TermSearch {
  text: string
  kids: TargetInfo[] | null,
  totalSize: number
  type: TargetType
}
