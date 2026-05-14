import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ThemeId = 'light' | 'dark'

// 主题颜色配置
interface ThemeColors {
  '--theme-c-text': string;
  '--theme-c-page-bg': string;
  '--theme-c-border': string;
  '--theme-c-text-muted': string;
  '--theme-c-accent': string;
  '--theme-c-danger': string;
  '--theme-c-card-bg': string;
  '--theme-c-card-bg-2': string;
  '--theme-c-active-bg': string;
  '--shadow-sm': string;
  '--shadow-md': string;
  '--shadow-lg': string;
}

// 定义所有主题的配置
const THEMES: Record<ThemeId, ThemeColors> = {
  light: {
    '--theme-c-text': '#030303',
    '--theme-c-page-bg': '#ffffff',
    '--theme-c-border': '#f4f4f4',
    '--theme-c-text-muted': '#8a8a8a',
    '--theme-c-accent': '#4285f4',
    '--theme-c-danger': '#a50e0e',
    '--theme-c-card-bg': '#e8eef6',
    '--theme-c-card-bg-2': '#d2e3fc',
    '--theme-c-active-bg': 'rgba(113, 168, 255, 0.6)',
    '--shadow-sm': '0 1px 2px rgba(26, 22, 19, 0.05)',
    '--shadow-md': '0 4px 12px rgba(26, 22, 19, 0.08)',
    '--shadow-lg': '0 8px 24px rgba(26, 22, 19, 0.12)',
  },
  dark: {
    '--theme-c-text': '#f5f5f5',
    '--theme-c-page-bg': '#202124',
    '--theme-c-border': '#636363',
    '--theme-c-text-muted': '#a1a1a1',
    '--theme-c-accent': '#4285f4',
    '--theme-c-danger': '#ea4335',
    '--theme-c-card-bg': '#303134',
    '--theme-c-card-bg-2': '#28292a',
    '--theme-c-active-bg': '#636363',
    '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.2)',
    '--shadow-md': '0 4px 12px rgba(0, 0, 0, 0.3)',
    '--shadow-lg': '0 8px 24px rgba(0, 0, 0, 0.4)',
  },
};

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeId>('light');

  // 应用主题到 DOM
  function applyTheme(themeId: ThemeId) {
    const root = document.documentElement;
    const colors = THEMES[themeId];

    if (!colors) {
      console.warn(`Theme "${themeId}" not found, falling back to light theme`);
      return applyTheme('light');
    }

    // 批量设置 CSS 变量
    Object.entries(colors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }

  // 设置主题并保存
  function setTheme(themeId: ThemeId) {
    if (!THEMES[themeId]) {
      console.warn(`Theme "${themeId}" is not available`);
      return;
    }

    currentTheme.value = themeId;
    applyTheme(themeId);
    localStorage.setItem('theme', themeId);
  }

  // 从 localStorage 加载主题，如果没有则根据系统偏好设置
  function loadTheme() {
    const savedTheme = localStorage.getItem('theme') as ThemeId;

    if (savedTheme && THEMES[savedTheme]) {
      // 有保存的主题，直接使用
      currentTheme.value = savedTheme;
      applyTheme(savedTheme);
    } else {
      // 首次使用，根据系统偏好设置
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme: ThemeId = prefersDark ? 'dark' : 'light';

      currentTheme.value = defaultTheme;
      applyTheme(defaultTheme);
    }
  }

  // 在 store 初始化时立即加载主题
  loadTheme();

  return {
    currentTheme,
    setTheme,
    loadTheme,
  };
});
