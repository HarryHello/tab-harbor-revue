<script setup lang="ts">
import ModalForm from '@/components/common/ModalForm.vue';
import { WindowIcon } from '@/components/icons';
import { useTabsStore } from '@/stores';
import type { Tab } from '@/types';
import { getDomain } from '@/utils/helpers';
import { computed, ref } from 'vue';

const emit = defineEmits<{
  submit: [title: string, url: string]
  cancel: []
}>();

const showForm = ref(false);
const title = ref('');
const url = ref('');
const mode = ref<'manual' | 'tabs'>('manual');

interface OpenTab extends Pick<Tab, 'id' | 'title' | 'url' | 'favIconUrl'> {
  domain: string;
}

const openTabs = ref<OpenTab[]>([]);
const loadingTabs = ref(false);
const faviconErrors = ref(new Set<number>());

const tabCount = computed(() => openTabs.value.length);

function openForm() {
  showForm.value = true;
  title.value = '';
  url.value = '';
  mode.value = 'manual';
}

function handleSubmit() {
  if (title.value && url.value) {
    emit('submit', title.value, url.value);
    showForm.value = false;
  }
}

function handleCancel() {
  emit('cancel');
  showForm.value = false;
}

async function switchToTabs() {
  mode.value = 'tabs';
  loadingTabs.value = true;
  faviconErrors.value.clear();
  try {
    const tabsStore = useTabsStore();
    openTabs.value = tabsStore.tabs
      .filter(tab => tab.url.startsWith('http'))
      .map(tab => ({
        id: tab.id,
        title: tab.title,
        url: tab.url,
        favIconUrl: tab.favIconUrl,
        domain: getDomain(tab.url),
      }));
  } catch (error) {
    console.error('Failed to fetch open tabs:', error);
  } finally {
    loadingTabs.value = false;
  }
}

function switchToManual() {
  mode.value = 'manual';
}

function selectTab(tab: OpenTab) {
  title.value = tab.title;
  url.value = tab.url;
  handleSubmit();
}

defineExpose({ openForm });
</script>

<template>
  <ModalForm
    v-model="showForm"
    :title="mode === 'manual' ? 'Add New Link' : 'Pick an Open Tab'"
    @close="handleCancel"
  >
    <div v-if="mode === 'manual'" class="content-panel">
      <form class="modal-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Title</label>
          <input
            v-model="title"
            type="text"
            placeholder="e.g., GitHub"
            class="form-input"
            required
            autofocus
          />
        </div>
        <div class="form-group">
          <label>Url</label>
          <input
            v-model="url"
            type="url"
            placeholder="https://example.com"
            class="form-input"
            required
          />
        </div>
      </form>

      <div class="mode-switch">
        <button
          type="button"
          class="mode-switch__btn"
          @click="switchToTabs"
        >
          <WindowIcon :size="16" />
          <span>Add from Open Tabs</span>
          <svg class="mode-switch__arrow" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5.25 2.625L9.625 7L5.25 11.375" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <div v-else class="content-panel">
      <button
        type="button"
        class="back-btn"
        @click="switchToManual"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M8.75 2.625L4.375 7L8.75 11.375" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Back to manual</span>
      </button>

      <transition name="tabs-fade" mode="out-in">
        <div v-if="loadingTabs" key="loading" class="tabs-status">
          <div class="tabs-status__spinner" />
          <span>Loading tabs…</span>
        </div>

        <div v-else-if="!openTabs.length" key="empty" class="tabs-status">
          <WindowIcon :size="24" />
          <span>No open tabs with URLs found.</span>
        </div>

        <div v-else key="list" class="tabs-list">
          <span class="tabs-list__count">{{ tabCount }} tab{{ tabCount !== 1 ? 's' : '' }}</span>
          <div
            v-for="(tab, i) in openTabs"
            :key="tab.id"
            class="tab-item"
            :style="{ '--i': i }"
            @click="selectTab(tab)"
          >
            <div class="tab-item__favicon">
              <img
                v-if="tab.favIconUrl && !faviconErrors.has(tab.id)"
                :src="tab.favIconUrl"
                alt=""
                width="18"
                height="18"
                @error="faviconErrors.add(tab.id)"
              />
              <span v-else class="tab-item__initial">{{ tab.title.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="tab-item__info">
              <div class="tab-item__title">{{ tab.title }}</div>
              <div class="tab-item__domain">{{ tab.domain }}</div>
            </div>
            <svg class="tab-item__chevron" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5.25 2.625L9.625 7L5.25 11.375" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </transition>
    </div>

    <template #actions>
      <button type="button" class="modal-btn modal-btn--cancel" @click="handleCancel">
        Cancel
      </button>
      <button
        v-if="mode === 'manual'"
        type="button"
        class="modal-btn modal-btn--save"
        @click="handleSubmit"
      >
        Add Link
      </button>
    </template>
  </ModalForm>
</template>

<style scoped lang="scss">
$ease-out: cubic-bezier(0.22, 1, 0.36, 1);

.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-group {
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: var(--space-2);

  label {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 500;
    align-self: center;
    cursor: default;
    color: var(--theme-c-text-muted);
  }
}

.form-input {
  font-size: 0.9375rem;
  padding: var(--space-2) var(--space-3);
  transition: all var(--transition-fast);
  color: var(--theme-c-text);
  border: 1px solid transparent;
  border-radius: 9999px;
  outline: none;
  background: var(--theme-c-card-bg);

  &:hover {
    border-color: var(--theme-c-accent);
  }

  &:focus {
    border-color: var(--theme-c-accent);
  }
}

.mode-switch {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid var(--theme-c-border);

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    font-size: 0.875rem;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: all var(--transition-fast) $ease-out;
    color: var(--theme-c-accent);
    border: 1px solid transparent;
    border-radius: 9999px;
    background: color-mix(in srgb, var(--theme-c-accent) 8%, transparent);
    will-change: transform;

    &:hover {
      color: var(--theme-c-on-accent, white);
      background: var(--theme-c-accent);
      border-color: var(--theme-c-accent);
      transform: translateY(-1px);

      .mode-switch__arrow {
        transform: translateX(2px);
      }
    }

    &:active {
      transform: translateY(0);
    }
  }

  &__arrow {
    transition: transform var(--transition-fast) $ease-out;
  }
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 4px var(--space-2) 4px 4px;
  margin-bottom: var(--space-3);
  font-size: 0.8125rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-fast) $ease-out;
  color: var(--theme-c-text-muted);
  border: none;
  border-radius: 9999px;
  background: transparent;

  &:hover {
    color: var(--theme-c-text);
    background: var(--theme-c-active-bg);
  }
}

.tabs-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 340px;
  overflow-y: auto;
  scroll-behavior: smooth;

  &__count {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--theme-c-text-muted);
    padding: 0 var(--space-1) var(--space-1);
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .tab-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-2);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast) $ease-out;
    animation: tabItemIn 0.35s $ease-out both;
    animation-delay: calc(var(--i) * 0.025s);

    &:hover {
      background: var(--theme-c-card-bg);

      .tab-item__title {
        color: var(--theme-c-accent);
      }

      .tab-item__chevron {
        opacity: 0.7;
        transform: translateX(2px);
      }
    }

    &:active {
      transform: scale(0.98);
    }

    &__favicon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      overflow: hidden;
      background: var(--theme-c-card-bg);

      img {
        display: block;
        object-fit: contain;
      }

      .tab-item__initial {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--theme-c-text-muted);
        line-height: 1;
      }
    }

    &__info {
      flex: 1;
      min-width: 0;
    }

    &__title {
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color var(--transition-fast);
      color: var(--theme-c-text);
    }

    &__domain {
      font-size: 0.75rem;
      color: var(--theme-c-text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &__chevron {
      flex-shrink: 0;
      opacity: 0;
      transition: all var(--transition-fast) $ease-out;
      color: var(--theme-c-text-muted);
    }
  }
}

.tabs-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-8) var(--space-4);
  color: var(--theme-c-text-muted);
  font-size: 0.875rem;

  &__spinner {
    width: 22px;
    height: 22px;
    border: 2px solid var(--theme-c-card-bg);
    border-top-color: var(--theme-c-accent);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes tabItemIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.tabs-fade-enter-active,
.tabs-fade-leave-active {
  transition: all 0.2s $ease-out;
}

.tabs-fade-enter-from,
.tabs-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.tabs-list {
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 99px;
    background: var(--theme-c-border);

    &:hover {
      background: var(--theme-c-text-muted);
    }
  }
}
</style>
