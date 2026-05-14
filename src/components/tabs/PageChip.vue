<script setup lang="ts">
import { BookmarkIcon, CloseIcon, GlobeIcon } from '@/components/icons';
import { useDeferredStore, useTabsStore } from '@/stores';
import type { Tab } from '@/types';
import { ref } from 'vue';

const props = defineProps<{
  tab: Tab
}>();

const tabsStore = useTabsStore();
const deferredStore = useDeferredStore();

const showActions = ref(false);

async function focus() {
  await tabsStore.focusTab(props.tab.id);
}

async function close(e?: Event) {
  e?.stopPropagation();
  await tabsStore.closeTab(props.tab.id)
}

async function save(e?: Event) {
  e?.stopPropagation();
  await deferredStore.add(props.tab.url, props.tab.title);
  await tabsStore.closeTab(props.tab.id)
}
</script>

<template>
  <div
    class="page-chip"
    :class="{ 'page-chip--active': tab.active }"
    @click="focus"
    @mouseenter="showActions = true"
    @mouseleave="showActions = false"
  >
    <img
      v-if="tab.favIconUrl"
      :src="tab.favIconUrl"
      class="page-chip-favicon"
      alt=""
    />
    <GlobeIcon v-else class="page-chip-favicon" />
    <span class="page-chip-title">{{ tab.title || 'Untitled' }}</span>
    <div class="page-chip-actions" :class="{ 'page-chip-actions--visible': showActions }">
      <button class="page-chip-action" title="Save for later" @click="save">
        <BookmarkIcon :size="16" />
      </button>
      <button class="page-chip-action page-chip-action--danger" title="Close" @click="close">
        <CloseIcon :size="16" />
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-chip {
  position:      relative;
  display:       flex;
  align-items:   center;
  margin:        0 var(--space-2);
  padding:       var(--space-3) var(--space-3);
  cursor:        pointer;
  transition:    background-color var(--transition-fast);
  border:        none;
  border-radius: var(--radius-md);
  background:    transparent;
  gap:           var(--space-3);
}

.page-chip:hover {
  background: var(--theme-c-active-bg);
}

.page-chip--active {
  background: var(--md-sys-color-primary-container);

  .page-chip-title {
    font-weight: 600;
    color:       var(--md-sys-color-on-primary-container);
  }
}

.page-chip-favicon {
  flex-shrink:   0;
  width:         16px;
  height:        16px;
  border-radius: 3px;
}

.page-chip-title {
  font-size:     0.9375rem;
  overflow:      hidden;
  flex:          1;
  white-space:   nowrap;
  text-overflow: ellipsis;
  color:         var(--theme-c-text);
}

.page-chip-actions {
  display:     flex;
  flex-shrink: 0;
  margin-left: auto;
  transition:  opacity var(--transition-fast);
  opacity:     0.7;
  gap:         var(--space-1);

  &--visible {
    opacity: 1;
  }
}

.page-chip-action {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           40px;
  height:          40px;
  transition:      all var(--transition-fast);
  color:           var(--md-sys-color-on-surface-variant);
  border:          none;
  border-radius:   50%;
  background:      transparent;
}

.page-chip-action:hover {
  color:      var(--theme-c-text);
  background: var(--theme-c-active-bg);
}

.page-chip-action--danger:hover {
  color:      var(--theme-c-danger);
  background: color-mix(in srgb, var(--theme-c-danger) 15%, transparent);
}

.page-chip-action svg {
  width:  18px;
  height: 18px;
}
</style>
