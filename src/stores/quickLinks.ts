import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { QuickLink } from '@/types'
import { handleUrlSecurityCheck } from '@/utils/helpers'

const STORAGE_KEY = 'quick-links'

export const useQuickLinksStore = defineStore('quickLinks', () => {
  const links = ref<QuickLink[]>([])

  // 从 localStorage 加载
  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        links.value = JSON.parse(saved)
      } else {
        // 默认链接
        links.value = [
          { id: '1', title: 'GitHub', url: 'https://github.com' },
          { id: '2', title: 'Google', url: 'https://google.com' },
          { id: '3', title: 'YouTube', url: 'https://youtube.com' },
        ]
        save()
      }
    } catch (error) {
      console.error('Failed to load quick links:', error)
      links.value = []
    }
  }

  // 保存到 localStorage
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links.value))
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
