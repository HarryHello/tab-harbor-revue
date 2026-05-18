export interface Tab {
  id: number
  url: string
  title: string
  windowId: number
  active: boolean
  discarded: boolean
  favIconUrl: string
  isTabOut: boolean
}

export interface GroupedTabs {
  domain: string
  label?: string
  tabs: Tab[]
  isManual: boolean
  manualGroupId?: string
  createdAt: string
}
