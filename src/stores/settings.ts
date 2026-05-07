import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Settings {
  doShowRgbCircle: boolean;
  doCloseDuplicateNewTabs: boolean;
}

const STORAGE_KEY = 'tab-harbor-settings';

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>({
    doShowRgbCircle: true,
    doCloseDuplicateNewTabs: false,
  });

  // 保存设置到 localStorage
  async function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  // 从 localStorage 加载设置
  function loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        settings.value = { ...settings.value, ...JSON.parse(saved) };
      }
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