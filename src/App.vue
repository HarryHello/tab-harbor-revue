<script setup lang="ts">
import Dashboard from '@/components/dashboard/Dashboard.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useDeferredStore, useSettingsStore, useTabsStore, useThemeStore, useTodosStore } from '@/stores'
import { nextTick, onMounted, onUnmounted } from 'vue'

const tabsStore = useTabsStore()
const deferredStore = useDeferredStore()
const todosStore = useTodosStore()
const themeStore = useThemeStore()
const settingsStore = useSettingsStore()
onMounted(async () => {
  settingsStore.loadSettings()
  await Promise.all([
    tabsStore.fetchTabs(),
    deferredStore.load(),
    todosStore.load(),
  ])

  await nextTick()
  if (settingsStore.settings.doCloseDuplicateNewTabs) {
    await tabsStore.closeDuplicateNewTabs()
  }
  tabsStore.startListening()
})

onUnmounted(() => {
  tabsStore.stopListening()
})
</script>

<template>
  <AppLayout>
    <Dashboard />
  </AppLayout>
</template>
