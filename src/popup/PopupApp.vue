<script setup lang="ts">
import { useTabsStore } from '@/stores'
import { useSettingsStore } from '@/stores/settings'
import { onMounted, ref } from 'vue'

const tabsStore = useTabsStore()
const settingsStore = useSettingsStore()
const tabCount = ref(0)

onMounted(async () => {
  settingsStore.loadSettings()
  const tabs = await chrome.tabs.query({})
  tabCount.value = tabs.length
})

async function openNewTab() {
  const newTabUrl = chrome.runtime.getURL('index.html')
  const allTabs = await chrome.tabs.query({})
  const blankTabs = allTabs.filter(
    t => t.url === 'chrome://newtab/' || t.url === newTabUrl,
  )

  if (blankTabs.length > 0) {
    const latest = blankTabs.reduce((a, b) => (a.id! > b.id! ? a : b))
    await chrome.tabs.update(latest.id!, { active: true })
    if (settingsStore.settings.doCloseDuplicateNewTabs) {
    await tabsStore.closeDuplicateNewTabs()
  }
  } else {
    await chrome.tabs.create({ url: newTabUrl })
  }

  window.close()
}

// openNewTab()
</script>

<template>
  <div class="popup" @click="openNewTab" role="button" aria-label="Open Tab Harbor Vue" tabindex="0">
    <div class="logo">
      <img src="/icons/icon128.png" alt="" width="20" height="20">
    </div>
    <div class="info">
      <div class="title">Tab Harbor Vue</div>
      <div class="subtitle">{{ tabCount }} tabs open</div>
    </div>
    <div class="arrow">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M7 17l9.2-9.2M17 17V7H7"/>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.popup {
  width: 280px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  background: var(--theme-c-page-bg);
  color: var(--theme-c-text);
  transition: background 0.15s;
  font-family: 'Google Sans', system-ui, sans-serif;
}

.popup:hover {
  background: var(--theme-c-active-bg);
}

.popup:active {
  background: var(--theme-c-card-bg);
}

.logo {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--theme-c-accent);
}

.info {
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
  color: var(--theme-c-text);
}

.subtitle {
  font-size: 12px;
  line-height: 1.3;
  color: var(--theme-c-text-muted);
  margin-top: 2px;
}

.arrow {
  flex-shrink: 0;
  color: var(--md-sys-color-on-surface-variant);
}
</style>
