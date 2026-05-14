import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ThemeId = 'light' | 'dark'

// MD3 surface container 色阶映射
//  elevations in MD3:
//  level 0: surface
//  level 1: surface-container-low
//  level 2: surface-container
//  level 3: surface-container-high
//  level 4: surface-container-highest

// 主题颜色配置（MD3 兼容）
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
  // MD3 extended tokens
  '--md-sys-color-surface-container-lowest': string;
  '--md-sys-color-surface-container-low': string;
  '--md-sys-color-surface-container': string;
  '--md-sys-color-surface-container-high': string;
  '--md-sys-color-surface-container-highest': string;
  '--md-sys-color-primary-container': string;
  '--md-sys-color-on-primary-container': string;
  '--md-sys-color-outline': string;
  '--md-sys-color-outline-variant': string;
  '--md-sys-color-on-surface-variant': string;
  '--shadow-sm': string;
  '--shadow-md': string;
  '--shadow-lg': string;
}

// 定义所有主题的配置
const THEMES: Record<ThemeId, ThemeColors> = {
  light: {
    '--theme-c-text': '#202124',
    '--theme-c-page-bg': '#ffffff',
    '--theme-c-border': '#dadce0',
    '--theme-c-text-muted': '#5f6368',
    '--theme-c-accent': '#4285f4',
    '--theme-c-danger': '#ea4335',
    '--theme-c-card-bg': '#f1f3f4',
    '--theme-c-card-bg-2': '#e8f0fe',
    '--theme-c-active-bg': 'rgba(66, 133, 244, 0.08)',
    // MD3 extended tokens (light) — Google Blue
    '--md-sys-color-surface-container-lowest': '#ffffff',
    '--md-sys-color-surface-container-low': '#f8f9fa',
    '--md-sys-color-surface-container': '#f1f3f4',
    '--md-sys-color-surface-container-high': '#e8eaed',
    '--md-sys-color-surface-container-highest': '#dadce0',
    '--md-sys-color-primary-container': '#d2e3fc',
    '--md-sys-color-on-primary-container': '#174ea6',
    '--md-sys-color-outline': '#5f6368',
    '--md-sys-color-outline-variant': '#dadce0',
    '--md-sys-color-on-surface-variant': '#5f6368',
    '--shadow-sm': '0 1px 3px 1px rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
    '--shadow-md': '0 4px 8px 3px rgba(0, 0, 0, 0.1), 0 1px 3px 0 rgba(0, 0, 0, 0.06)',
    '--shadow-lg': '0 8px 16px 4px rgba(0, 0, 0, 0.12), 0 2px 4px 0 rgba(0, 0, 0, 0.08)',
  },
  dark: {
    '--theme-c-text': '#e8eaed',
    '--theme-c-page-bg': '#202124',
    '--theme-c-border': '#5f6368',
    '--theme-c-text-muted': '#9aa0a6',
    '--theme-c-accent': '#8ab4f8',
    '--theme-c-danger': '#f28b82',
    '--theme-c-card-bg': '#303134',
    '--theme-c-card-bg-2': '#28292a',
    '--theme-c-active-bg': 'rgba(138, 180, 248, 0.08)',
    // MD3 extended tokens (dark) — Google Blue
    '--md-sys-color-surface-container-lowest': '#0f0f0f',
    '--md-sys-color-surface-container-low': '#1d1d1d',
    '--md-sys-color-surface-container': '#28292a',
    '--md-sys-color-surface-container-high': '#303134',
    '--md-sys-color-surface-container-highest': '#3c4043',
    '--md-sys-color-primary-container': '#174ea6',
    '--md-sys-color-on-primary-container': '#d2e3fc',
    '--md-sys-color-outline': '#9aa0a6',
    '--md-sys-color-outline-variant': '#5f6368',
    '--md-sys-color-on-surface-variant': '#9aa0a6',
    '--shadow-sm': '0 1px 3px 1px rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    '--shadow-md': '0 4px 8px 3px rgba(0, 0, 0, 0.35), 0 1px 3px 0 rgba(0, 0, 0, 0.25)',
    '--shadow-lg': '0 8px 16px 4px rgba(0, 0, 0, 0.4), 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
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
