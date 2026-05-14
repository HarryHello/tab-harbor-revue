import type { GroupedTabs, Tab } from '@/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<Tab[]>([])
  const isLoading = ref(false)
  let isListening = false

  const groupedTabs = computed<GroupedTabs[]>(() => {
    const groups: Record<string, GroupedTabs> = {}

    tabs.value.forEach(tab => {
      if (tab.isTabOut) return

      try {
        const url = new URL(tab.url)
        const domain = url.hostname

        if (!groups[domain]) {
          groups[domain] = {
            domain,
            tabs: [],
            isManual: false,
            createdAt: new Date().toISOString(),
          }
        }
        groups[domain].tabs.push(tab)
      } catch {
        if (!groups['unknown']) {
          groups['unknown'] = {
            domain: 'unknown',
            label: 'Unknown',
            tabs: [],
            isManual: false,
            createdAt: new Date().toISOString(),
          }
        }
        groups['unknown'].tabs.push(tab)
      }
    })

    return Object.values(groups).sort((a, b) => {
      if (a.domain === 'unknown') return 1
      if (b.domain === 'unknown') return -1
      
      // 移除 www. 前缀进行比较
      const domainA = a.domain.replace(/^www\./, '')
      const domainB = b.domain.replace(/^www\./, '')
      
      return domainA.localeCompare(domainB)
    })
  })

  const totalTabCount = computed(() =>
    tabs.value.filter(t => !t.isTabOut).length
  )

  const newTabUrl = chrome.runtime.getURL('index.html')

  function isExcludedTabUrl(url: string): boolean {
    return url === 'chrome://newtab/' || url === '' || url === newTabUrl
  }

  async function fetchTabs() {
    isLoading.value = true
    try {
      const chromeTabs = await chrome.tabs.query({})
      tabs.value = chromeTabs.map(tab => ({
        id: tab.id!,
        url: tab.url || '',
        title: tab.title || 'Untitled',
        windowId: tab.windowId,
        active: tab.active || false,
        favIconUrl: tab.favIconUrl || '',
        isTabOut: false,
      })).filter(tab => !isExcludedTabUrl(tab.url))
    } catch (error) {
      console.error('Failed to fetch tabs:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function closeTab(tabId: number) {
    try {
      await chrome.tabs.remove(tabId)
      tabs.value = tabs.value.filter(t => t.id !== tabId)
    } catch (error) {
      console.error('Failed to close tab:', error)
    }
  }

  async function closeDuplicateNewTabs() {
    const allTabs = await chrome.tabs.query({})

    // 筛选出空白新标签页（Ctrl+T 打开的 chrome://newtab/ 或扩展的 index.html）
    const blankTabs = allTabs.filter(
      tab => isExcludedTabUrl(tab.url || ''),
    )

    if (blankTabs.length <= 1) return

    // 保留当前活跃的标签页，关闭其余
    const activeTab = blankTabs.find(tab => tab.active)
    const toKeep = activeTab || blankTabs.reduce((a, b) => (a.id! > b.id! ? a : b))
    await Promise.all(
      blankTabs
        .filter(tab => tab.id !== toKeep.id)
        .map(tab => closeTab(tab.id!)),
    )
  }

  async function focusTab(tabId: number) {
    try {
      await chrome.tabs.update(tabId, { active: true })
      await chrome.windows.update(tabs.value.find(t => t.id === tabId)?.windowId || 0, { focused: true })
    } catch (error) {
      console.error('Failed to focus tab:', error)
    }
  }

  // 处理标签页创建
  function handleTabCreated(tab: chrome.tabs.Tab) {
    if (!tab.id) return
    if (isExcludedTabUrl(tab.url || '')) return
    
    const newTab: Tab = {
      id: tab.id,
      url: tab.url || '',
      title: tab.title || 'Untitled',
      windowId: tab.windowId,
      active: tab.active || false,
      favIconUrl: tab.favIconUrl || '',
      isTabOut: false,
    }
    
    tabs.value.push(newTab)
  }

  // 处理标签页关闭
  function handleTabRemoved(tabId: number) {
    tabs.value = tabs.value.filter(t => t.id !== tabId)
  }

  // 处理标签页更新（URL、标题等变化）
  function handleTabUpdated(tabId: number, _changeInfo: any, tab: chrome.tabs.Tab) {
    if (isExcludedTabUrl(tab.url || '')) {
      tabs.value = tabs.value.filter(t => t.id !== tabId)
      return
    }
    const index = tabs.value.findIndex(t => t.id === tabId)
    if (index === -1) {
      tabs.value.push({
        id: tabId,
        url: tab.url || '',
        title: tab.title || 'Untitled',
        windowId: tab.windowId,
        active: tab.active || false,
        favIconUrl: tab.favIconUrl || '',
        isTabOut: false,
      })
      return
    }

    tabs.value[index] = {
      ...tabs.value[index],
      url: tab.url || tabs.value[index].url,
      title: tab.title || tabs.value[index].title,
      favIconUrl: tab.favIconUrl || tabs.value[index].favIconUrl,
      active: tab.active || false,
    }
  }

  // 处理标签页激活状态变化
  function handleTabActivated(activeInfo: any) {
    tabs.value = tabs.value.map(tab => ({
      ...tab,
      active: tab.id === activeInfo.tabId,
    }))
  }

  // 开始监听标签页变化
  function startListening() {
    if (isListening) return
    
    chrome.tabs.onCreated.addListener(handleTabCreated)
    chrome.tabs.onRemoved.addListener(handleTabRemoved)
    chrome.tabs.onUpdated.addListener(handleTabUpdated)
    chrome.tabs.onActivated.addListener(handleTabActivated)
    
    isListening = true
  }

  // 停止监听
  function stopListening() {
    if (!isListening) return
    
    chrome.tabs.onCreated.removeListener(handleTabCreated)
    chrome.tabs.onRemoved.removeListener(handleTabRemoved)
    chrome.tabs.onUpdated.removeListener(handleTabUpdated)
    chrome.tabs.onActivated.removeListener(handleTabActivated)
    
    isListening = false
  }

  return {
    tabs,
    isLoading,
    groupedTabs,
    totalTabCount,
    fetchTabs,
    closeTab,
    focusTab,
    closeDuplicateNewTabs,
    startListening,
    stopListening,
  }
})
