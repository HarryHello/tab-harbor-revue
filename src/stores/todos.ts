import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Todo } from '@/types'
import { useSettingsStore } from './settings'
import { ensureArray } from '../utils/helpers'

const STORAGE_KEY = 'tabHarborTodos'
const MIGRATION_KEY = 'tabHarborTodosMigrated'
const MAX_TODOS_WARNING = 100  // 警告阈值
const MAX_TODOS_HARD_LIMIT = 200  // 硬限制

export const useTodosStore = defineStore('todos', () => {
  const items = ref<Todo[]>([])
  const isLoading = ref(false)
  const settingsStore = useSettingsStore()

  // 是否应该同步到云端
  function shouldSyncToCloud() {
    // 只有 doUseSync && doSyncTodos 都为 true 时才同步
    return settingsStore.settings.doUseSync && settingsStore.settings.doSyncTodos
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

  async function load() {
    isLoading.value = true
    try {
      // 1. 如果开启了 sync，先尝试从 sync 加载（可能是最新数据）
      if (shouldSyncToCloud()) {
        const syncResult = await chrome.storage.sync.get(STORAGE_KEY)
        let rawData = await fixStorageFormat(chrome.storage.sync, syncResult[STORAGE_KEY])
        const data = ensureArray<Todo>(rawData)
        
        if (data.length > 0) {
          items.value = data
          console.log('Loaded todos from sync storage')
          
          // ✅ 重要：将从云端获取的数据写入本地（主存储）
          await chrome.storage.local.set({ [STORAGE_KEY]: items.value })
          console.log('Cached cloud data to local storage')
          
          await checkAndMigrateFromOldVersion()
          return
        }
      }
      
      // 2. 从 local 加载（主存储）
      const localResult = await chrome.storage.local.get(STORAGE_KEY)
      let rawData = await fixStorageFormat(chrome.storage.local, localResult[STORAGE_KEY])
      const data = ensureArray<Todo>(rawData)
      
      if (data.length > 0) {
        items.value = data
        console.log('Loaded todos from local storage')
      } else {
        // 3. 都没有数据，初始化为空数组
        items.value = []
      }
      
      // 检查是否需要从旧版本迁移（仅首次加载时）
      await checkAndMigrateFromOldVersion()
    } catch (error) {
      console.error('Failed to load todos:', error)
      items.value = []
    } finally {
      isLoading.value = false
    }
  }

  // 检查并迁移旧版本数据
  async function checkAndMigrateFromOldVersion() {
    try {
      // 检查是否已经迁移过（在 local 中记录）
      const migrationCheck = await chrome.storage.local.get(MIGRATION_KEY)
      if (migrationCheck[MIGRATION_KEY]) {
        console.log('Todos already migrated, skipping...')
        return
      }

      // 尝试从 localStorage 读取旧数据
      const oldData = localStorage.getItem(STORAGE_KEY)
      if (oldData) {
        try {
          const parsed = JSON.parse(oldData)
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`Found ${parsed.length} todos in localStorage, merging...`)
            
            // 合并策略：将旧数据与新数据合并，去重（基于 ID）
            const existingIds = new Set(items.value.map(item => item.id))
            const newItems = parsed.filter((item: Todo) => !existingIds.has(item.id))
            
            if (newItems.length > 0) {
              // 将新数据添加到前面
              items.value = [...newItems, ...items.value]
              console.log(`Merged ${newItems.length} todos from localStorage`)
              
              // 保存合并后的数据
              await save()
              
              // 清除 localStorage 中的旧数据
              localStorage.removeItem(STORAGE_KEY)
            }
          }
        } catch (parseError) {
          console.error('Failed to parse old todos data:', parseError)
        }
      }

      // 标记为已迁移
      await chrome.storage.local.set({ [MIGRATION_KEY]: true })
      console.log('Migration check completed')
    } catch (error) {
      console.error('Migration check failed:', error)
    }
  }

  async function save() {
    try {
      // 始终保存到 local（主存储）
      await chrome.storage.local.set({ [STORAGE_KEY]: items.value })
      console.log(`Saved ${items.value.length} todos to local storage (primary)`)
      
      // 如果开启了 sync，同时同步到云端（限制最多 100 项）
      if (shouldSyncToCloud()) {
        try {
          const itemsToSync = items.value.slice(0, 100)
          await chrome.storage.sync.set({ [STORAGE_KEY]: itemsToSync })
          console.log(`Synced ${itemsToSync.length} todos to cloud storage`)
        } catch (syncError) {
          console.warn('Failed to sync todos to cloud:', syncError)
          // 不影响主存储，继续运行
        }
      }
    } catch (error) {
      console.error('Failed to save todos:', error)
    }
  }

  async function add(title: string, description: string = '') {
    // 检查是否超过硬限制
    if (items.value.length >= MAX_TODOS_HARD_LIMIT) {
      console.warn(`Cannot add todo: reached hard limit of ${MAX_TODOS_HARD_LIMIT} items`)
      throw new Error(`Maximum todo limit reached (${MAX_TODOS_HARD_LIMIT} items). Please delete some old todos first.`)
    }

    // 如果超过警告阈值，给出提示
    if (items.value.length >= MAX_TODOS_WARNING) {
      console.warn(`Warning: Todo count (${items.value.length}) exceeds recommended limit of ${MAX_TODOS_WARNING}`)
    }

    const todo: Todo = {
      id: crypto.randomUUID(),
      title,
      description,
      createdAt: new Date().toISOString(),
      completed: false,
      dismissed: false,
    }
    items.value.unshift(todo)
    await save()
    return todo
  }

  async function toggleComplete(id: string) {
    const index = items.value.findIndex(i => i.id === id)
    if (index === -1) return
    
    const item = items.value[index]
    item.completed = !item.completed
    item.completedAt = item.completed ? new Date().toISOString() : undefined
    
    // 从当前位置移除
    items.value.splice(index, 1)
    
    if (item.completed) {
      // 如果标记为完成，找到第一个已完成任务的位置，插到它前面
      const firstCompletedIndex = items.value.findIndex(i => i.completed)
      if (firstCompletedIndex === -1) {
        // 没有已完成任务，放到末尾
        items.value.push(item)
      } else {
        // 插到第一个已完成任务之前（即已完成任务的开头）
        items.value.splice(firstCompletedIndex, 0, item)
      }
    } else {
      // 如果取消完成，找到第一个已完成任务的位置，插到它前面
      const firstCompletedIndex = items.value.findIndex(i => i.completed)
      if (firstCompletedIndex === -1) {
        // 没有已完成任务，放到末尾
        items.value.push(item)
      } else {
        // 插到第一个已完成任务之前（即未完成任务的末尾）
        items.value.splice(firstCompletedIndex, 0, item)
      }
    }
    
    await save()
  }

  async function remove(id: string) {
    items.value = items.value.filter(i => i.id !== id)
    await save()
  }

  const activeItems = () => items.value.filter(i => !i.completed && !i.dismissed)
  const completedItems = () => items.value.filter(i => i.completed && !i.dismissed)

  return {
    items,
    isLoading,
    load,
    save,
    add,
    toggleComplete,
    remove,
    activeItems,
    completedItems,
  }
})
