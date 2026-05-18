import type { ColorScheme, ColorMode } from '@/stores/theme';

// 硬编码不同版本的配置项，以防后续版本修改接口影响旧版本配置格式
export interface configV1 {
  extensionVersion: string,
  configVersion: number,
  exportedAt: number,
  theme: {
    themeId: 'light' | 'dark',
  },
  settings: {
    doShowRgbCircle: boolean,
  },
  quickLinks: Array<{
    id: string,
    title: string,
    url: string,
  }>,
  deferred: Array<{
    id: string,
    url: string,
    title: string,
    savedAt: string,
    completed: boolean,
    dismissed: boolean,
  }>,
  todos: Array<{
    id: string,
    title: string,
    description?: string,
    createdAt: string,
    completed: boolean,
    dismissed: boolean,
  }>,
}

export interface configV2 {
  extensionVersion: string,
  configVersion: number,
  exportedAt: number,
  theme: {
    colorScheme: ColorScheme,
    colorMode: ColorMode,
  },
  settings: {
    doShowRgbCircle: boolean,
  },
  quickLinks: Array<{
    id: string,
    title: string,
    url: string,
  }>,
  deferred: Array<{
    id: string,
    url: string,
    title: string,
    savedAt: string,
    completed: boolean,
    dismissed: boolean,
  }>,
  todos: Array<{
    id: string,
    title: string,
    description?: string,
    createdAt: string,
    completed: boolean,
    dismissed: boolean,
  }>,
}
