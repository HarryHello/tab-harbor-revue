import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Settings {
  doShowRgbCircle: boolean;
  doUseSync: boolean;
  doSyncTodos: boolean;
}

const STORAGE_KEY = 'tab-harbor-settings';

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>({
    doShowRgbCircle: true,
    doUseSync: true,
    doSyncTodos: false,
  });

  // 保存到 local（主存储），如果开启 sync 则同时同步到云端
  async function saveSettings() {
    try {
      // 始终保存到 local（主存储）
      await chrome.storage.local.set({ [STORAGE_KEY]: settings.value });
      console.log('Saved settings to local storage (primary)');
      
      // 如果开启了 sync，同时同步到云端
      if (settings.value.doUseSync) {
        try {
          await chrome.storage.sync.set({ [STORAGE_KEY]: settings.value });
          console.log('Synced settings to cloud storage');
        } catch (syncError) {
          console.warn('Failed to sync settings to cloud:', syncError);
          // 不影响主存储，继续运行
        }
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  // 从存储加载设置，优先从 sync（如果开启），否则从 local
  async function loadSettings() {
    try {
      // 1. 如果开启了 sync，先尝试从 sync 加载
      if (settings.value.doUseSync) {
        const syncResult = await chrome.storage.sync.get(STORAGE_KEY);
        const syncData = syncResult[STORAGE_KEY];
        
        if (syncData && typeof syncData === 'object' && !Array.isArray(syncData)) {
          settings.value = { ...settings.value, ...syncData as Settings };
          console.log('Loaded settings from sync storage');
          
          // ✅ 重要：将从云端获取的数据写入本地（主存储）
          await chrome.storage.local.set({ [STORAGE_KEY]: settings.value });
          console.log('Cached cloud data to local storage');
          return;
        }
      }

      // 2. 从 local 加载（主存储）
      const localResult = await chrome.storage.local.get(STORAGE_KEY);
      const localData = localResult[STORAGE_KEY];
      
      if (localData && typeof localData === 'object' && !Array.isArray(localData)) {
        settings.value = { ...settings.value, ...localData as Settings };
        console.log('Loaded settings from local storage');
        return;
      }

      // 3. 都没有，尝试从旧版 localStorage 迁移
      const oldLocalData = localStorage.getItem(STORAGE_KEY);
      if (oldLocalData) {
        try {
          const parsed = JSON.parse(oldLocalData);
          settings.value = { ...settings.value, ...parsed };
          console.log('Migrated settings from localStorage');
          // 迁移后保存到当前存储
          await saveSettings();
          // 清除 localStorage 中的旧数据
          localStorage.removeItem(STORAGE_KEY);
          return;
        } catch (parseError) {
          console.error('Failed to parse localStorage settings:', parseError);
        }
      }
      // 4. 都没有数据，使用默认设置（已在初始化时设置）
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  // 获取所有设置（返回响应式引用）
  function getSettings() {
    return settings;
  }

  // 更新单个设置项
  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    settings.value[key] = value;
    saveSettings();
  }

  return {
    settings,
    saveSettings,
    loadSettings,
    getSettings,
    updateSetting,
  };
});
