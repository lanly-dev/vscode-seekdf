export enum TargetType {
  DIR = 'dir',
  FILE = 'file'
}

export interface TargetInfo {
  type: TargetType
  name: string
  path: string
  size: number
  parent: string | null
  parentName: string | null
  kids: TargetInfo[] | null
}

export interface TermSearch {
  kids: TargetInfo[]
  text: string
}
