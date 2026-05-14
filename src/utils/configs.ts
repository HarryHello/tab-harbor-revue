import { useThemeStore } from '@/stores/theme';
import { useSettingsStore } from '@/stores/settings';
import { useDeferredStore, useQuickLinksStore, useTodosStore } from '@/stores/items';
import type { configV1, configV2 } from '@/types/config';

// 获取当前扩展版本（从 manifest.json）
function getExtensionVersion(): string {
  return chrome.runtime.getManifest().version;
}

// 将配置导出为文件
export async function exportConfigs() {
  try {
    // 获取所有 store 实例
    const themeStore = useThemeStore();
    const settingsStore = useSettingsStore();
    const deferredStore = useDeferredStore();
    const todosStore = useTodosStore();
    const quickLinksStore = useQuickLinksStore();

    // 构建配置对象 (v2)
    const config: configV2 = {
      extensionVersion: getExtensionVersion(),
      configVersion: 2,
      exportedAt: Date.now(),
      theme: {
        colorScheme: themeStore.colorScheme,
        colorMode: themeStore.colorMode,
      },
      settings: {
        doShowRgbCircle: settingsStore.settings.doShowRgbCircle,
      },
      quickLinks: quickLinksStore.links.map(item => ({
        id: item.id,
        title: item.title,
        url: item.url,
      })),
      deferred: deferredStore.items.map(item => ({
        id: item.id,
        url: item.url,
        title: item.title,
        savedAt: item.savedAt,
        completed: item.completed,
        dismissed: item.dismissed,
      })),
      todos: todosStore.items.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        createdAt: item.createdAt,
        completed: item.completed,
        dismissed: item.dismissed,
      })),
    };

    // 转换为 JSON 字符串
    const jsonString = JSON.stringify(config, null, 2);

    // 创建 Blob 对象
    const blob = new Blob([jsonString], { type: 'application/json' });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tab-harbor-config-${getExtensionVersion()}-${Date.now()}.json`;

    // 触发下载
    document.body.appendChild(a);
    a.click();

    // 清理
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('Config exported successfully');
  } catch (error) {
    console.error('Failed to export config:', error);
    alert('Failed to export configuration. Please check the console for details.');
  }
}

// 导入配置文件
export async function importConfigs() {
  try {
    // 创建文件输入元素
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';

    // 等待用户选择文件
    const file = await new Promise<File | null>((resolve) => {
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        resolve(target.files?.[0] || null);
      };
      input.click();
    });

    if (!file) {
      console.log('Import cancelled by user');
      return;
    }

    // 读取文件内容
    const text = await file.text();
    const raw = JSON.parse(text) as configV1 | configV2;

    // 验证配置版本
    if (!raw.configVersion || (raw.configVersion !== 1 && raw.configVersion !== 2)) {
      console.error(`Unsupported config version: ${raw.configVersion}`);
      alert(`❌ Unsupported config version: ${raw.configVersion}`);
      return;
    }

    // 确认导入
    const confirmed = confirm(
      `⚠️ Import Configuration\n\n` +
      `This will replace all your current data with the imported configuration.\n\n` +
      `Extension Version: ${raw.extensionVersion}\n` +
      `Exported At: ${new Date(raw.exportedAt).toLocaleString()}\n\n` +
      `Are you sure you want to continue?`
    );

    if (!confirmed) {
      console.log('Import cancelled by user');
      return;
    }

    // 获取所有 store 实例
    const themeStore = useThemeStore();
    const settingsStore = useSettingsStore();
    const deferredStore = useDeferredStore();
    const todosStore = useTodosStore();
    const quickLinksStore = useQuickLinksStore();

    // 导入主题设置 — 兼容 v1 和 v2
    if (raw.theme) {
      if (raw.configVersion === 1) {
        const v1 = raw as configV1;
        // v1 只有 light/dark，默认配色为 google-blue
        themeStore.setTheme(v1.theme.themeId);
      } else {
        const v2 = raw as configV2;
        themeStore.setColorScheme(v2.theme.colorScheme);
        themeStore.setColorMode(v2.theme.colorMode);
      }
    }

    // 导入其他设置
    if (raw.settings) {
      settingsStore.updateSetting('doShowRgbCircle', raw.settings.doShowRgbCircle);
    }

    // 导入快速链接
    if (raw.quickLinks) {
      quickLinksStore.links = raw.quickLinks;
      quickLinksStore.save();
    }

    // 导入暂存标签页
    if (raw.deferred) {
      deferredStore.items = raw.deferred.map(item => ({
        id: item.id,
        url: item.url,
        title: item.title,
        savedAt: item.savedAt,
        completed: item.completed,
        completedAt: item.completed ? new Date().toISOString() : undefined,
        dismissed: item.dismissed,
      }));
      await deferredStore.save();
    }

    // 导入待办事项
    if (raw.todos) {
      todosStore.items = raw.todos.map(todo => ({
        id: todo.id,
        title: todo.title,
        description: todo.description || '',
        createdAt: todo.createdAt,
        completed: todo.completed,
        completedAt: todo.completed ? new Date().toISOString() : undefined,
        dismissed: todo.dismissed,
      }));
      await todosStore.save();
    }

    console.log('Config imported successfully');
  } catch (error) {
    console.error('Failed to import config:', error);
    alert(`❌ Failed to import configuration: ${(error as Error).message}`);
  }
}
