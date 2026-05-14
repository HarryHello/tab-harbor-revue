import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { QuickLink } from '@/types'
import { handleUrlSecurityCheck, ensureArray } from '@/utils/helpers'
import { useSettingsStore } from './settings'

const STORAGE_KEY = 'quick-links'

export const useQuickLinksStore = defineStore('quickLinks', () => {
  const links = ref<QuickLink[]>([])
  const settingsStore = useSettingsStore()

  // 获取应该使用的存储区域
  function getStorageArea() {
    // Local-first: 始终使用 local 作为主存储
    return chrome.storage.local
  }

  // 是否应该同步到云端
  function shouldSyncToCloud() {
    return settingsStore.settings.doUseSync
  }

  // 检测并修复存储中的对象格式为数组
  async function fixStorageFormat(storageArea: chrome.storage.StorageArea, data: any): Promise<any> {
    if (data && !Array.isArray(data) && typeof data === 'object') {
      console.log('Detected object format, converting to array...')
      const fixedData = Object.values(data)
      // ✅ 立即修正存储中的数据格式
      await storageArea.set({ [STORAGE_KEY]: fixedData })
      console.log('Fixed storage format to array')
      return fixedData
    }
    return data
  }

  // 从存储加载，优先从 sync（如果开启），否则从 local
  async function load() {
    try {
      // 1. 如果开启了 sync，先尝试从 sync 加载（可能是最新数据）
      if (shouldSyncToCloud()) {
        const syncResult = await chrome.storage.sync.get(STORAGE_KEY)
        let rawData = await fixStorageFormat(chrome.storage.sync, syncResult[STORAGE_KEY])
        const data = ensureArray<QuickLink>(rawData)
        
        if (data.length > 0) {
          links.value = data
          console.log('Loaded quick links from sync storage')
          
          // ✅ 重要：将从云端获取的数据写入本地（主存储）
          await chrome.storage.local.set({ [STORAGE_KEY]: links.value })
          console.log('Cached cloud data to local storage')
          return
        }
      }
      
      // 2. 从 local 加载（主存储）
      const localResult = await chrome.storage.local.get(STORAGE_KEY)
      let rawData = await fixStorageFormat(chrome.storage.local, localResult[STORAGE_KEY])
      const data = ensureArray<QuickLink>(rawData)
      
      if (data.length > 0) {
        links.value = data
        console.log('Loaded quick links from local storage')
        return
      }
      
      // 3. 都没有，尝试从旧版 localStorage 迁移
      const localData = localStorage.getItem(STORAGE_KEY)
      if (localData) {
        try {
          const parsed = JSON.parse(localData)
          if (Array.isArray(parsed)) {
            links.value = parsed
            console.log('Migrated quick links from localStorage')
            // 迁移后保存到当前存储
            await save()
            // 清除 localStorage 中的旧数据
            localStorage.removeItem(STORAGE_KEY)
            return
          }
        } catch (parseError) {
          console.error('Failed to parse localStorage data:', parseError)
        }
      }
      
      // 4. 都没有数据，使用默认链接
      loadDefaultLinks()
    } catch (error) {
      console.error('Failed to load quick links:', error)
      links.value = []
    }
  }

  // 加载默认链接
  function loadDefaultLinks() {
    links.value = [
      { id: '1', title: 'GitHub', url: 'https://github.com' },
      { id: '2', title: 'Google', url: 'https://google.com' },
      { id: '3', title: 'YouTube', url: 'https://youtube.com' },
    ]
    save()
  }

  // 保存到 local（主存储），如果开启 sync 则同时同步到云端
  async function save() {
    try {
      // 始终保存到 local（主存储）
      await chrome.storage.local.set({ [STORAGE_KEY]: links.value })
      console.log('Saved to local storage (primary)')
      
      // 如果开启了 sync，同时同步到云端
      if (shouldSyncToCloud()) {
        try {
          await chrome.storage.sync.set({ [STORAGE_KEY]: links.value })
          console.log('Synced to cloud storage')
        } catch (syncError) {
          console.warn('Failed to sync to cloud:', syncError)
          // 不影响主存储，继续运行
        }
      }
    } catch (error) {
      console.error('Failed to save quick links:', error)
    }
  }

  // 添加链接
  function add(title: string, url: string) {
    // 验证 URL 安全性
    if (!handleUrlSecurityCheck(url, 'add')) {
      throw new Error('Invalid or unsafe URL')
    }

    const link: QuickLink = {
      id: Date.now().toString(),
      title: title.trim(),
      url: url.trim(),
    }
    links.value.push(link)
    save()
    return link
  }

  // 更新链接
  function update(id: string, title: string, url: string) {
    // 验证 URL 安全性
    if (!handleUrlSecurityCheck(url, 'add')) {
      throw new Error('Invalid or unsafe URL')
    }

    const index = links.value.findIndex(link => link.id === id)
    if (index !== -1) {
      links.value[index] = {
        ...links.value[index],
        title: title.trim(),
        url: url.trim(),
      }
      save()
    }
  }

  // 删除链接
  function remove(id: string) {
    links.value = links.value.filter(link => link.id !== id)
    save()
  }

  return {
    links,
    load,
    save,
    add,
    update,
    remove,
  }
})
