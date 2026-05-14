<script
  setup
  lang="ts"
>
import DrawerPanel from '@/components/drawer/DrawerPanel.vue';
import { BookmarkIcon, CheckmarkIcon, SettingsIcon } from '@/components/icons';
import SettingsPanel from '@/components/settings/SettingsPanel.vue';
import { useDeferredStore, useTabsStore, useTodosStore } from '@/stores';
import { getFaviconUrl, getInitial, getRandomColor } from '@/utils/helpers';
import { computed, ref } from 'vue';

const tabsStore = useTabsStore();
const deferredStore = useDeferredStore();
const todosStore = useTodosStore();

const showSettings = ref(false);
const showDrawer = ref(false);
const drawerTab = ref<'saved' | 'todos'>('saved');

const groups = computed(() => tabsStore.groupedTabs);

const savedCount = computed(() => deferredStore.activeItems().length);
const todoCount = computed(() => todosStore.activeItems().length);

const navItems = computed(() => {
  return groups.value.map(group => ({
    id: group.domain,
    label: group.domain.length > 12 ? group.domain.slice(0, 12) + '...' : group.domain,
    count: group.tabs.length,
    faviconUrl: group.tabs[0]?.favIconUrl || getFaviconUrl(`https://${group.domain}`),
  }));
});

const imageErrors = ref<Record<string, boolean>>({});

function handleImageError(domain: string) {
  imageErrors.value[domain] = true;
}

let highlightTimer: ReturnType<typeof setTimeout> | null = null;

function scrollToGroup(domain: string) {
  const el = document.getElementById(`group-${domain}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.classList.add('group-highlight');
    if (highlightTimer) clearTimeout(highlightTimer);
    highlightTimer = setTimeout(() => {
      el.classList.remove('group-highlight');
      highlightTimer = null;
    }, 2000);
  }
}

async function openDrawer(tab: 'saved' | 'todos') {
  drawerTab.value = tab;
  // 重新加载数据以确保显示最新内容
  if (tab === 'saved') {
    await deferredStore.load();
  } else {
    await todosStore.load();
  }
  showDrawer.value = true;
}

function closeDrawer() {
  showDrawer.value = false;
}
</script>

<template>
  <nav class="group-nav">
    <div class="group-nav-scroll">
      <button
        v-for="item in navItems"
        :key="item.id"
        class="group-nav-item"
        :title="item.label"
        @click="scrollToGroup(item.id)"
      >
        <div
          v-if="!imageErrors[item.id] && item.faviconUrl"
          class="nav-icon-wrapper"
        >
          <img
            :src="item.faviconUrl"
            :alt="item.label"
            class="nav-favicon"
            @error="handleImageError(item.id)"
          />
        </div>
        <div
          v-else
          class="nav-icon-placeholder"
          :style="{ backgroundColor: getRandomColor(item.id) }"
        >
          {{ getInitial(item.id) }}
        </div>
      </button>
    </div>

    <div class="nav-actions">
      <button
        class="nav-action-btn"
        :title="`Saved (${savedCount})`"
        aria-label="Open saved items"
        @click="openDrawer('saved')"
      >
        <BookmarkIcon :size="20" />
        <span
          v-if="savedCount > 0"
          class="nav-badge"
        >{{ savedCount }}</span>
      </button>

      <button
        class="nav-action-btn"
        :title="`Todos (${todoCount})`"
        aria-label="Open todos"
        @click="openDrawer('todos')"
      >
        <CheckmarkIcon :size="20" />
        <span
          v-if="todoCount > 0"
          class="nav-badge"
        >{{ todoCount }}</span>
      </button>

      <button
        class="nav-action-btn settings-trigger"
        title="Settings"
        aria-label="Open settings"
        @click="showSettings = true"
      >
        <SettingsIcon :size="20" />
      </button>
    </div>
  </nav>

  <SettingsPanel v-model="showSettings" />
  <DrawerPanel
    :open="showDrawer"
    :initial-tab="drawerTab"
    @close="closeDrawer"
  />
</template>

<style
  scoped
  lang="scss"
>
.group-nav {
  position:        fixed;
  z-index:         50;
  top:             0;
  right:           0;
  left:            0;
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  height:          60px;
  padding:         0 var(--space-16);
  border-bottom:   1px solid var(--theme-c-border);
  background:      var(--theme-c-page-bg);
}

.group-nav-scroll {
  display:         flex;
  overflow-x:      auto;
  flex:            1;
  margin-right:    32px;
  gap:             var(--space-2);
  scrollbar-width: none;
}

.group-nav-scroll::-webkit-scrollbar {
  display: none;
}

.group-nav-item {
  position:        relative;
  display:         flex;
  align-items:     center;
  flex-shrink:     0;
  justify-content: center;
  width:           40px;
  height:          40px;
  padding:         0;
  transition:      all var(--transition-fast);
  border:          none;
  border-radius:   50%;
  background:      var(--theme-c-card-bg);
}

.group-nav-item:hover {
  background: var(--theme-c-border);
  box-shadow: var(--shadow-sm);
}

.nav-icon-wrapper {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           24px;
  height:          24px;
}

.nav-favicon {
  width:         20px;
  height:        20px;
  border-radius: 4px;
  object-fit:    contain;
}

.nav-icon-placeholder {
  font-size:       0.75rem;
  font-weight:     600;
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           24px;
  height:          24px;
  text-transform:  uppercase;
  color:           white;
  border-radius:   50%;
}

.nav-actions {
  display:     flex;
  align-items: center;
  margin-left: var(--space-4);
  gap:         var(--space-2);
}

.nav-action-btn {
  position:        relative;
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           40px;
  height:          40px;
  padding:         0;
  cursor:          pointer;
  transition:      all var(--transition-fast);
  color:           var(--theme-c-text);
  border:          none;
  border-radius:   50%;
  background:      var(--theme-c-card-bg);

  svg {
    display: block;
    width:   20px;
    height:  20px;
  }

  &:hover {
    background: var(--theme-c-border);
    box-shadow: var(--shadow-sm);
  }
}

.nav-badge {
  font-size:     0.6875rem;
  font-weight:   600;
  line-height:   18px;
  position:      absolute;
  top:           -2px;
  right:         -2px;
  min-width:     18px;
  height:        18px;
  padding:       0 4px;
  text-align:    center;
  color:         white;
  border-radius: 9px;
  background:    var(--theme-c-accent);
}
</style>
