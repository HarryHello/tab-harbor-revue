<script
  setup
  lang="ts"
>
import { computed } from 'vue';
import { useTabsStore } from '@/stores';
import MissionCard from './MissionCard.vue';
import { WindowIcon } from '@/components/icons';

const props = defineProps<{
  searchQuery: string
}>();

const tabsStore = useTabsStore();

// 根据搜索查询过滤卡组
const groups = computed(() => {
  const allGroups = tabsStore.groupedTabs;
  const query = props.searchQuery.toLowerCase().trim();
  
  if (!query) return allGroups;
  
  // 过滤卡组：域名或标签页标题/URL 匹配
  return allGroups.filter(group => {
    // 检查域名是否匹配
    if (group.domain.toLowerCase().includes(query)) return true;
    
    // 检查组内是否有标签页匹配
    return group.tabs.some(tab => 
      tab.title?.toLowerCase().includes(query) || 
      tab.url?.toLowerCase().includes(query)
    );
  }).map(group => {
    // 如果有搜索条件，只保留匹配的标签页
    const filteredTabs = group.tabs.filter(tab =>
      tab.title?.toLowerCase().includes(query) || 
      tab.url?.toLowerCase().includes(query)
    );
    
    return {
      ...group,
      tabs: filteredTabs.length > 0 ? filteredTabs : group.tabs
    };
  });
});
</script>

<template>
  <section class="open-tabs-section">
    <div
      v-if="groups.length === 0"
      class="empty-state"
    >
      <WindowIcon :size="80" />
      <h3>All clear!</h3>
      <p>No open tabs. Enjoy the calm.</p>
    </div>
    <TransitionGroup
      v-else
      name="group-list"
      tag="div"
      class="groups-list"
    >
      <MissionCard
        v-for="group in groups"
        :key="group.domain"
        :group="group"
      />
    </TransitionGroup>
  </section>
</template>

<style
  scoped
  lang="scss"
>
.open-tabs-section {
  width: 100%;
}

.empty-state {
  display:         flex;
  align-items:     center;
  flex-direction:  column;
  justify-content: center;
  padding:         var(--space-16) var(--space-8);
  text-align:      center;
  color:           var(--md-sys-color-on-surface-variant);
}

.empty-state svg {
  width:         80px;
  height:        80px;
  margin-bottom: var(--space-6);
  opacity:       0.5;
}

.empty-state h3 {
  font-family:   var(--font-display);
  font-size:     1.5rem;
  font-weight:   500;
  margin-bottom: var(--space-2);
  color:         var(--theme-c-text);
}

.empty-state p {
  font-size: 0.9375rem;
}

.groups-list {
  display:        flex;
  flex-direction: column;
  gap:            var(--space-4);
}

// 卡组列表动画
.group-list-move {
  transition: transform var(--transition-slow);
}

.group-list-enter-active,
.group-list-leave-active {
  transition: opacity var(--transition-slow);
}

.group-list-enter-from {
  transform: translateY(-20px);
  opacity:   0;
}

.group-list-leave-to {
  opacity: 0;
  // transform: translateX(100%);
}

.group-list-leave-active {
  position: absolute;
}
</style>
