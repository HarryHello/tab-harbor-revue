<script
  setup
  lang="ts"
>
import { onMounted, ref } from 'vue';
import AddLinkForm from './AddLinkForm.vue';
import EditLinkForm from './EditLinkForm.vue';
import QuickLinkItem from './QuickLinkItem.vue';
import AddLinkItem from '@/components/dashboard/AddLinkItem.vue';
import type { QuickLink } from '@/types';
import { useQuickLinksStore } from '@/stores/items';

const props = defineProps<{
  showTitle?: boolean
}>();

// 使用 QuickLinks store
const quickLinksStore = useQuickLinksStore();

const addLinkFormRef = ref<InstanceType<typeof AddLinkForm>>();
const editingLink = ref<QuickLink | null>(null);

// 组件挂载时加载数据
onMounted(() => {
  quickLinksStore.load();
});

// 处理添加链接
function handleAddLink(title: string, url: string) {
  let processedUrl = url.trim();

  // 先检查是否已经有协议头
  const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(processedUrl);

  // 只有没有协议头且不是特殊协议时，才添加 https://
  if (!hasProtocol) {
    processedUrl = 'https://' + processedUrl;
  }

  try {
    quickLinksStore.add(title.trim(), processedUrl);
  } catch (error) {
    console.error('Failed to add link:', error);
  }
}

// 处理取消
function handleCancel() {
  // 表单关闭逻辑已在组件内部处理
}

function handleLinkClick(url: string) {
  openLink(url);
}

function handleEditLink(link: QuickLink) {
  editingLink.value = link;
}

function handleUpdateLink(id: string, title: string, url: string) {
  let processedUrl = url.trim();

  // 先检查是否已经有协议头
  const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(processedUrl);

  // 只有没有协议头且不是特殊协议时，才添加 https://
  if (!hasProtocol) {
    processedUrl = 'https://' + processedUrl;
  }

  try {
    quickLinksStore.update(id, title.trim(), processedUrl);
  } catch (error) {
    console.error('Failed to update link:', error);
  }
  
  editingLink.value = null;
}

function handleDeleteFromEdit(id: string) {
  quickLinksStore.remove(id);
  editingLink.value = null;
}

function handleCancelEdit() {
  editingLink.value = null;
}

function openLink(url: string) {
  // 特殊处理 file:// 协议 - 浏览器不允许直接从网页打开本地文件
  if (url.startsWith('file://')) {
    const confirmed = confirm(
      `📁 Local File Link\n\n` +
      `Browsers don't allow opening local files directly from web pages.\n\n` +
      `Would you like to copy the file path to clipboard?\n\n` +
      `You can then paste it into your file explorer or browser address bar.`
    );

    if (confirmed) {
      navigator.clipboard.writeText(url).then(() => {
        alert('✅ File path copied to clipboard!');
      }).catch(() => {
        alert('❌ Failed to copy. Please copy manually:\n\n' + url);
      });
    }
    return;
  }

  window.open(url, '_blank');
}
</script>

<template>
  <div class="quick-links">
    <h3
      v-if="showTitle"
      class="quick-links-title"
    >Quick Links</h3>
    <div class="links-grid">
      <QuickLinkItem
        v-for="link in quickLinksStore.links"
        :key="link.id"
        :link="link"
        @click="handleLinkClick"
        @edit="handleEditLink"
      />

      <AddLinkItem
        @click="addLinkFormRef?.openForm()"
      />
    </div>

    <!-- 添加链接的弹窗 -->
    <AddLinkForm
      ref="addLinkFormRef"
      @submit="handleAddLink"
      @cancel="handleCancel"
    />

    <!-- 编辑链接的弹窗 -->
    <EditLinkForm
      :link="editingLink"
      @submit="handleUpdateLink"
      @delete="handleDeleteFromEdit"
      @cancel="handleCancelEdit"
    />
  </div>
</template>

<style
  scoped
  lang="scss"
>
.quick-links {
  margin-top: var(--space-6);
}

.quick-links-title {
  font-size:      0.875rem;
  font-weight:    500;
  margin-bottom:  var(--space-3);
  text-align:     left;
  letter-spacing: 0.025em;
  color:          var(--md-sys-color-on-surface-variant);
}

.links-grid {
  display:               grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap:                   var(--space-3);
}
</style>
