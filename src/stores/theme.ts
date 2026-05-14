import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export type ColorScheme = 'google-blue' | 'forest-green' | 'paper' | 'sage' | 'mist' | 'blush';
export type ColorMode = 'light' | 'dark' | 'auto';

export const COLOR_SCHEMES: ColorScheme[] = [
  'google-blue',
  'forest-green',
  'paper',
  'sage',
  'mist',
  'blush',
];

const STORAGE_KEY_SCHEME = 'theme-color-scheme';
const STORAGE_KEY_MODE = 'theme-color-mode';
const LEGACY_STORAGE_KEY = 'theme';

export const useThemeStore = defineStore('theme', () => {
  const colorScheme = ref<ColorScheme>('google-blue');
  const colorMode = ref<ColorMode>('light');
  const systemDark = ref(false);

  let mediaQuery: MediaQueryList | null = null;
  let mediaHandler: (() => void) | null = null;

  const appliedMode = computed<'light' | 'dark'>(() => {
    if (colorMode.value === 'auto') {
      return systemDark.value ? 'dark' : 'light';
    }
    return colorMode.value;
  });

  const currentTheme = computed(() =>
    `${colorScheme.value}--${appliedMode.value}`
  );

  function applyTheme(scheme: ColorScheme, mode: 'light' | 'dark') {
    const root = document.documentElement;
    root.setAttribute('data-color-scheme', scheme);
    root.classList.toggle('dark', mode === 'dark');
  }

  function applyStoredTheme() {
    applyTheme(colorScheme.value, appliedMode.value);
  }

  function startSystemListener() {
    stopSystemListener();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    systemDark.value = mq.matches;
    mediaHandler = () => {
      systemDark.value = mq.matches;
      if (colorMode.value === 'auto') {
        applyTheme(colorScheme.value, appliedMode.value);
      }
    };
    mq.addEventListener('change', mediaHandler);
    mediaQuery = mq;
  }

  function stopSystemListener() {
    if (mediaQuery && mediaHandler) {
      mediaQuery.removeEventListener('change', mediaHandler);
    }
    mediaQuery = null;
    mediaHandler = null;
  }

  function setColorScheme(scheme: ColorScheme) {
    if (!COLOR_SCHEMES.includes(scheme)) {
      console.warn(`Color scheme "${scheme}" is not available`);
      return;
    }
    colorScheme.value = scheme;
    applyStoredTheme();
    localStorage.setItem(STORAGE_KEY_SCHEME, scheme);
  }

  function setColorMode(mode: ColorMode) {
    colorMode.value = mode;
    if (mode === 'auto') {
      startSystemListener();
    } else {
      stopSystemListener();
    }
    applyStoredTheme();
    localStorage.setItem(STORAGE_KEY_MODE, mode);
  }

  function toggleColorMode() {
    if (colorMode.value === 'light') setColorMode('dark');
    else if (colorMode.value === 'dark') setColorMode('auto');
    else setColorMode('light');
  }

 // 兼容旧版 localStorage 单 key 'theme'
  function setTheme(themeId: string) {
    if (themeId === 'light' || themeId === 'dark') {
      setColorMode(themeId);
    }
  }

  function loadTheme() {
    const savedScheme = localStorage.getItem(STORAGE_KEY_SCHEME) as ColorScheme | null;
    const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as ColorMode | null;

    if (savedScheme && COLOR_SCHEMES.includes(savedScheme)) {
      colorScheme.value = savedScheme;
    }

    if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'auto') {
      colorMode.value = savedMode;
    } else {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY) as ColorMode | null;
      if (legacy === 'light' || legacy === 'dark') {
        colorMode.value = legacy;
      } else {
        colorMode.value = 'auto';
      }
    }

    if (colorMode.value === 'auto') {
      startSystemListener();
    }
    applyStoredTheme();
  }

  loadTheme();

  return {
    colorScheme,
    colorMode,
    appliedMode,
    currentTheme,
    setColorScheme,
    setColorMode,
    toggleColorMode,
    setTheme,
    loadTheme,
  };
});
