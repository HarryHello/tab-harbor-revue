import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DeferredItem } from '@/types'
import { handleUrlSecurityCheck } from '@/utils/helpers'

const STORAGE_KEY = 'tabHarborDeferred'

export const useDeferredStore = defineStore('deferred', () => {
  const items = ref<DeferredItem[]>([])
  const isLoading = ref(false)

  async function load() {
    isLoading.value = true
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY)
      console.log('Loaded from storage:', result);
      let data = result[STORAGE_KEY]
      
      // 如果数据是对象但不是数组，转换为数组
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        console.log('Converting object to array');
        data = Object.values(data)
      }
      
      console.log('Deferred data:', data, 'Is array?', Array.isArray(data));
      items.value = Array.isArray(data) ? data : []
      console.log('Items loaded:', items.value.length);
    } catch (error) {
      console.error('Failed to load deferred:', error)
      items.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function save() {
    try {
      console.log('Saving deferred items to storage:', items.value);
      await chrome.storage.local.set({ [STORAGE_KEY]: items.value })
      console.log('Save successful');
    } catch (error) {
      console.error('Failed to save deferred:', error)
    }
  }

  async function add(url: string, title: string) {
    // 验证 URL 安全性
    if (!handleUrlSecurityCheck(url, 'add')) {
      throw new Error('Invalid or unsafe URL');
    }

    const item: DeferredItem = {
      id: crypto.randomUUID(),
      url,
      title,
      savedAt: new Date().toISOString(),
      completed: false,
      dismissed: false,
    }
    console.log('Adding deferred item:', item);
    items.value.unshift(item)
    await save()
    console.log('After save, items count:', items.value.length);
    return item
  }

  async function toggleComplete(id: string) {
    const item = items.value.find(i => i.id === id)
    if (item) {
      item.completed = !item.completed
      item.completedAt = item.completed ? new Date().toISOString() : undefined
      await save()
    }
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
