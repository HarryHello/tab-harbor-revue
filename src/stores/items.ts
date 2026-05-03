import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DeferredItem, Todo, Shortcut } from '@/types'
import { handleUrlSecurityCheck } from '@/utils/helpers'

const STORAGE_KEYS = {
  deferred: 'tabHarborDeferred',
  todos: 'tabHarborTodos',
  shortcuts: 'tabHarborShortcuts',
} as const

export const useDeferredStore = defineStore('deferred', () => {
  const items = ref<DeferredItem[]>([])
  const isLoading = ref(false)

  async function load() {
    isLoading.value = true
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.deferred)
      console.log('Loaded from storage:', result);
      let data = result[STORAGE_KEYS.deferred]
      
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
      await chrome.storage.local.set({ [STORAGE_KEYS.deferred]: items.value })
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

export const useTodosStore = defineStore('todos', () => {
  const items = ref<Todo[]>([])
  const isLoading = ref(false)

  async function load() {
    isLoading.value = true
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.todos)
      let data = result[STORAGE_KEYS.todos]
      
      // 如果数据是对象但不是数组，转换为数组
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        data = Object.values(data)
      }
      
      items.value = Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Failed to load todos:', error)
      items.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function save() {
    try {
      await chrome.storage.local.set({ [STORAGE_KEYS.todos]: items.value })
    } catch (error) {
      console.error('Failed to save todos:', error)
    }
  }

  async function add(title: string, description: string = '') {
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

export const useShortcutsStore = defineStore('shortcuts', () => {
  const items = ref<Shortcut[]>([])
  const isLoading = ref(false)

  async function load() {
    isLoading.value = true
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.shortcuts)
      items.value = (result[STORAGE_KEYS.shortcuts] as Shortcut[] | undefined) || []
    } catch (error) {
      items.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function save() {
    try {
      await chrome.storage.local.set({ [STORAGE_KEYS.shortcuts]: items.value })
    } catch (error) {
      console.error('Failed to save shortcuts:', error)
    }
  }

  async function add(url: string, title: string, favIconUrl?: string) {
    // 验证 URL 安全性
    if (!handleUrlSecurityCheck(url, 'add')) {
      throw new Error('Invalid or unsafe URL');
    }

    const shortcut: Shortcut = {
      id: crypto.randomUUID(),
      url,
      title,
      favIconUrl,
      createdAt: new Date().toISOString(),
    }
    items.value.unshift(shortcut)
    await save()
    return shortcut
  }

  async function remove(id: string) {
    items.value = items.value.filter(i => i.id !== id)
    await save()
  }

  return {
    items,
    isLoading,
    load,
    add,
    remove,
  }
})
