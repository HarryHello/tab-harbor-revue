<script
  setup
  lang="ts"
>
import type { GroupedTabs } from '@/types';
import { computed, ref, nextTick, watch, onMounted } from 'vue';
import PageChip from './PageChip.vue';
import { GlobeIcon, ChevronIcon } from '@/components/icons';

const props = defineProps<{
  group: GroupedTabs
}>();

const tabs = computed(() => props.group.tabs);

const displayDomain = computed(() => {
  return props.group.domain.replace(/^www\./, '');
});

const collapsed = ref(false);
const contentEl = ref<HTMLElement | null>(null);
const contentHeight = ref<string>('');

function applyHeight() {
  nextTick(() => {
    if (!contentEl.value) return;
    contentHeight.value = collapsed.value ? '0px' : `${contentEl.value.scrollHeight}px`;
  });
}

function toggleCollapse() {
  collapsed.value = !collapsed.value;
  applyHeight();
}

watch(tabs, applyHeight);
onMounted(applyHeight);
</script>

<template>
  <div
    :id="`group-${group.domain}`"
    class="mission-card"
    :class="{ 'mission-card--collapsed': collapsed }"
  >
    <div
      class="mission-card-header"
      @click="toggleCollapse"
    >
      <div class="mission-card-title">
        <img
          v-if="group.tabs[0]?.favIconUrl"
          :src="group.tabs[0].favIconUrl"
          class="mission-card-favicon"
          alt=""
        />
        <GlobeIcon v-else class="mission-card-favicon" />
        <span class="mission-card-domain">{{ displayDomain }}</span>
      </div>
      <button
        class="mission-card-toggle"
        :title="collapsed ? 'Expand' : 'Collapse'"
        @click.stop="toggleCollapse"
      >
        <ChevronIcon
          :direction="collapsed ? 'down' : 'up'"
          :size="18"
        />
      </button>
    </div>
    <div
      class="mission-card-tabs"
      :class="{ 'mission-card-tabs--collapsed': collapsed }"
      :style="{ maxHeight: contentHeight }"
    >
      <div
        ref="contentEl"
        class="mission-card-tabs-inner"
      >
        <PageChip
          v-for="tab in tabs"
          :key="tab.id"
          :tab="tab"
        />
      </div>
    </div>
  </div>
</template>

<style
  scoped
  lang="scss"
>
.mission-card {
  display:        flex;
  flex-direction: column;
  padding:        var(--space-2);
  border:         none;
  border-radius:  var(--radius-xl);
  background:     var(--theme-c-card-bg-2);
  transition:     background-color var(--transition-fast), box-shadow var(--transition-fast);
}

.mission-card-header {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  padding:         var(--space-3) var(--space-4);
  cursor:          pointer;
  user-select:     none;
  transition:      background-color var(--transition-fast);
  border-radius:   calc(var(--radius-xl) - var(--space-2));

  &:hover {
    background: var(--theme-c-active-bg);
  }
}

.mission-card-title {
  display:     flex;
  align-items: center;
  gap:         var(--space-2);
}

.mission-card-favicon {
  width:         20px;
  height:        20px;
  border-radius: 4px;
}

.mission-card-domain {
  font-family: var(--font-body);
  font-size:   0.9375rem;
  font-weight: 500;
  color:       var(--theme-c-text);
}

.mission-card-toggle {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           32px;
  height:          32px;
  padding:         0;
  cursor:          pointer;
  transition:      all var(--transition-fast);
  color:           var(--md-sys-color-on-surface-variant);
  border:          none;
  border-radius:   50%;
  background:      transparent;

  svg {
    width:  18px;
    height: 18px;
  }

  &:hover {
    background: var(--theme-c-active-bg);
  }
}

.mission-card-tabs {
  display:        flex;
  overflow:       hidden;
  flex-direction: column;
  max-height:     0;
  transition:     max-height var(--transition-base), opacity var(--transition-base), transform var(--transition-base);
  transform:      translateY(0);
  opacity:        1;

  &--collapsed {
    transform:  translateY(-8px);
    opacity:    0;
  }
}

.mission-card-tabs-inner {
  flex-shrink: 0;
}
</style>
