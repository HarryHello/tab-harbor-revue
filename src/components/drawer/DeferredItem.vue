<script
  setup
  lang="ts"
>
import type { DeferredItem } from '@/types';
import { useDeferredStore } from '@/stores';
import { getFaviconUrl, getInitial, getRandomColor, handleUrlSecurityCheck } from '@/utils/helpers';

const props = defineProps<{
  item: DeferredItem
}>();

const deferredStore = useDeferredStore();

async function remove() {
  await deferredStore.remove(props.item.id);
}

async function openInNewTab() {
  // 验证 URL 安全性
  if (!handleUrlSecurityCheck(props.item.url, 'open')) {
    return;
  }

  // 特殊处理 file:// 协议 - 浏览器不允许直接从扩展打开本地文件
  if (props.item.url.startsWith('file://')) {
    const confirmed = confirm(
      `📁 Local File Link\n\n` +
      `Browsers don't allow opening local files directly from extensions.\n\n` +
      `Would you like to copy the file path to clipboard?\n\n` +
      `You can then paste it into your file explorer or browser address bar.`
    );
    
    if (confirmed) {
      try {
        await navigator.clipboard.writeText(props.item.url);
        alert('✅ File path copied to clipboard!');
      } catch {
        alert('❌ Failed to copy. Please copy manually:\n\n' + props.item.url);
      }
    }
    
    // 从暂存列表中移除（无论是否复制成功）
    await deferredStore.remove(props.item.id);
    return;
  }

  // 获取当前活动标签页
  const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // 在当前标签页旁边打开新标签页，但不聚焦
  await chrome.tabs.create({
    url: props.item.url,
    index: currentTab.index + 1,
    active: false, // 不聚焦到新标签页
  });

  // 从暂存列表中移除
  await deferredStore.remove(props.item.id);
}
</script>

<template>
  <div class="deferred-item">
    <img
      v-if="getFaviconUrl(item.url)"
      :src="getFaviconUrl(item.url)"
      class="deferred-item-favicon"
      alt=""
    />
    <div
      v-else
      class="deferred-item-icon-placeholder"
      :style="{ backgroundColor: getRandomColor(item.title || item.url) }"
    >
      {{ getInitial(item.title || item.url) }}
    </div>
    <div
      class="deferred-item-content"
      @click="openInNewTab"
    >
      <span class="deferred-item-title">{{ item.title || item.url }}</span>
      <span class="deferred-item-url">{{ item.url }}</span>
    </div>
    <button
      class="deferred-item-action"
      title="Remove"
      @click="remove"
    >
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </div>
</template>

<style
  scoped
  lang="scss"
>
.deferred-item {
  position:      relative;
  display:       flex;
  align-items:   center;
  padding:       8px 48px 8px 20px;
  transition:    border-color var(--transition-fast), box-shadow var(--transition-fast);
  border:        1px solid var(--no-color);
  border-radius: 9999px;
  background:    var(--theme-c-card-bg);
  gap:           var(--space-3);
}

.deferred-item-favicon,
.deferred-item-icon-placeholder {
  flex-shrink:   0;
  width:         20px;
  height:        20px;
  border-radius: 4px;
}

.deferred-item-favicon {
  object-fit: contain;
}

.deferred-item-icon-placeholder {
  font-size:       0.6875rem;
  font-weight:     600;
  display:         flex;
  align-items:     center;
  justify-content: center;
  text-transform:  uppercase;
  color:           white;
}

.deferred-item:hover {
  border-color: var(--theme-c-accent);
  box-shadow:   var(--shadow-sm);
}

.deferred-item-content {
  flex:      1;
  min-width: 0;
  cursor:    pointer;
}

.deferred-item-title {
  font-size:     0.9375rem;
  display:       block;
  overflow:      hidden;
  white-space:   nowrap;
  text-overflow: ellipsis;
  color:         var(--theme-c-text);
}

.deferred-item-url {
  font-size:     0.75rem;
  display:       block;
  overflow:      hidden;
  white-space:   nowrap;
  text-overflow: ellipsis;
  color:         var(--theme-c-text-muted);
}

.deferred-item-action {
  position:        absolute;
  top:             50%;
  right:           18px;
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           28px;
  height:          28px;
  transition:      all var(--transition-fast);
  transform:       translateY(-50%);
  opacity:         0;
  color:           var(--theme-c-text-muted);
  border:          none;
  border-radius:   50%;
  background:      transparent;
}

.deferred-item:hover .deferred-item-action {
  opacity: 1;
}

.deferred-item-action:hover {
  color:      var(--theme-c-danger);
  background: color-mix(in srgb, var(--theme-c-danger) 25%, transparent);
}

.deferred-item-action svg {
  width:  16px;
  height: 16px;
}
</style>
