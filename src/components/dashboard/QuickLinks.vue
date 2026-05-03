<script
  setup
  lang="ts"
>
import { onMounted, ref } from 'vue';
import AddLinkForm from './AddLinkForm.vue';
import EditLinkForm from './EditLinkForm.vue';
import QuickLinkItem from './QuickLinkItem.vue';
import { handleUrlSecurityCheck } from '@/utils/helpers';

interface QuickLink {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

const props = defineProps<{
  showTitle?: boolean
}>();

const STORAGE_KEY = 'quick-links';

// 默认链接
const defaultLinks: QuickLink[] = [
  { id: '1', title: 'GitHub', url: 'https://github.com' },
  { id: '2', title: 'Google', url: 'https://google.com' },
  { id: '3', title: 'YouTube', url: 'https://youtube.com' },
];

const links = ref<QuickLink[]>([]);
const addLinkFormRef = ref<InstanceType<typeof AddLinkForm>>();
const editingLink = ref<QuickLink | null>(null);

// 从 localStorage 加载链接
function loadLinks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      links.value = JSON.parse(saved);
    } else {
      links.value = defaultLinks;
      saveLinks();
    }
  } catch (error) {
    console.error('Failed to load quick links:', error);
    links.value = defaultLinks;
  }
}

// 保存链接到 localStorage
function saveLinks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links.value));
  } catch (error) {
    console.error('Failed to save quick links:', error);
  }
}

// 处理添加链接
function handleAddLink(title: string, url: string) {
  let processedUrl = url.trim();

  // 先检查是否已经有协议头
  const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(processedUrl);

  // 只有没有协议头且不是特殊协议时，才添加 https://
  if (!hasProtocol) {
    processedUrl = 'https://' + processedUrl;
  }

  // 验证 URL 安全性
  if (!handleUrlSecurityCheck(processedUrl, 'add')) {
    return;
  }

  links.value.push({
    id: Date.now().toString(),
    title: title.trim(),
    url: processedUrl,
  });

  saveLinks();
}

// 处理取消
function handleCancel() {
  // 表单关闭逻辑已在组件内部处理
}

// 组件挂载时加载数据
onMounted(() => {
  loadLinks();
});

function removeLink(id: string) {
  links.value = links.value.filter(link => link.id !== id);
  saveLinks(); // 保存更改
}

function handleLinkClick(url: string) {
  openLink(url);
}

function handleEditLink(link: QuickLink) {
  editingLink.value = link;
}

function handleUpdateLink(id: string, title: string, url: string) {
  // 验证 URL 安全性
  if (!handleUrlSecurityCheck(url, 'add')) {
    return;
  }

  const index = links.value.findIndex(link => link.id === id);
  if (index !== -1) {
    links.value[index] = {
      ...links.value[index],
      title: title.trim(),
      url: url.trim(),
    };
    saveLinks();
  }
  editingLink.value = null;
}

function handleDeleteFromEdit(id: string) {
  removeLink(id);
  editingLink.value = null;
}

function handleCancelEdit() {
  editingLink.value = null;
}

function openLink(url: string) {
  // 验证 URL 安全性
  if (!handleUrlSecurityCheck(url, 'open')) {
    return;
  }

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
      v-if="props.showTitle !== false"
      class="quick-links-title"
    >Quick Links</h3>
    <div class="links-grid">
      <QuickLinkItem
        v-for="link in links"
        :key="link.id"
        :link="link"
        @click="handleLinkClick"
        @edit="handleEditLink"
      />

      <button
        class="link-card link-card--add"
        @click="addLinkFormRef?.openForm()"
      >
        <div class="link-icon link-icon--add">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M12 5v14M5 12h14"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <span class="link-title">Add Link</span>
      </button>
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
  font-size:     0.875rem;
  margin-bottom: var(--space-3);
  text-align:    left;
  color:         var(--theme-c-text-muted);
}

.links-grid {
  display:               grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap:                   var(--space-3);
}

.link-card {
  position:       relative;
  display:        flex;
  align-items:    center;
  flex-direction: column;
  padding:        8px 0;
  cursor:         pointer;
  border:         none;
  border-radius:  var(--radius-lg);
  background:     none;
  gap:            var(--space-2);
}

.link-icon--add svg {
  width:  24px;
  height: 24px;
}

.link-card--add {
  position:       relative;
  display:        flex;
  align-items:    center;
  flex-direction: column;
  padding:        8px 0;
  cursor:         pointer;
  border:         none;
  border-radius:  var(--radius-lg);
  background:     none;
  gap:            var(--space-2);
  opacity: 0.7;
}

.link-card--add:hover {
  opacity: 1;
}

.link-input {
  font-size:     0.8125rem;
  width:         100%;
  padding:       var(--space-2);
  border:        1px solid var(--theme-c-border);
  border-radius: var(--radius-md);
  outline:       none;
}

.link-input:focus {
  border-color: var(--theme-c-accent);
}

.link-actions {
  display:    flex;
  margin-top: var(--space-2);
  gap:        var(--space-2);
}

.link-btn {
  font-size:     0.75rem;
  flex:          1;
  padding:       var(--space-2);
  cursor:        pointer;
  transition:    opacity var(--transition-fast);
  border:        none;
  border-radius: var(--radius-md);
}

.link-btn:hover {
  opacity: 0.8;
}

.link-btn--cancel {
  color:      var(--theme-c-text);
  background: var(--theme-c-border);
}

.link-btn--save {
  color:      white;
  background: var(--theme-c-accent);
}
</style>
