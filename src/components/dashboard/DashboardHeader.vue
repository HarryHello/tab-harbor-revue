<script
  setup
  lang="ts"
>
import { computed, ref } from 'vue';
import SearchInput from '@/components/drawer/SearchInput.vue';
import QuickLinks from './QuickLinks.vue';
import RGBCircle from '@/components/common/RGBCircle.vue';
import { useSettingsStore } from '@/stores/settings';
import { handleUrlSecurityCheck } from '@/utils/helpers';

const props = defineProps<{
  searchQuery: string
}>();

const emit = defineEmits<{
  'update:searchQuery': [value: string]
}>();

const quickLinksCollapsed = ref(false);

const greetingText = computed(() => {
  let hour = new Date().getHours();
  if (hour < 5 || hour > 18) {
    return 'Night';
  }
  return hour < 12 ? 'Morning' : 'Afternoon';
});

const greetingSub = computed(() => {
  const week_day = new Date().getDay();
  const day_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return `It\'s ${day_names[week_day]}!`;
});

function handleSearchSubmit(event: Event) {
  event.preventDefault();
  if (props.searchQuery.trim()) {
    // 使用浏览器默认搜索引擎
    const query = encodeURIComponent(props.searchQuery);
    // 尝试使用 chrome.search API（如果是扩展环境）
    if (typeof chrome !== 'undefined' && chrome.search) {
      chrome.search.query({ text: props.searchQuery });
    } else {
      // 回退方案：在新标签页打开搜索结果
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    }
    emit('update:searchQuery', '');
  }
}

function toggleQuickLinks() {
  quickLinksCollapsed.value = !quickLinksCollapsed.value;
}

async function openProjectRepo() {
  const repoUrl = 'https://github.com/HarryHello/tab-harbor-revue';
  
  // 验证 URL 安全性
  if (!handleUrlSecurityCheck(repoUrl, 'open')) {
    return;
  }

  // 获取当前活动标签页
  const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });

  await chrome.tabs.create({
    url: repoUrl,
    index: currentTab.index + 1,
    active: true,
  });
}

const settingsStore = useSettingsStore();
</script>

<template>
  <div class="dashboard-header">
    <div class="dashboard-greeting">
      <p class="greeting-text">
        <!--        <span style="color: var(&#45;&#45;google-c-blue)">G</span>-->
        <!--        <span style="color: var(&#45;&#45;google-c-red)">o</span>-->
        <!--        <span style="color: var(&#45;&#45;google-c-red)">o</span>-->
        <!--        <span style="color: var(&#45;&#45;google-c-yellow)">d</span>-->
        <span>Good</span>
        <span>{{ ' ' }}</span>
        <span>{{ greetingText }}</span>
      </p>
      <p class="greeting-sub">{{ greetingSub }}</p>
    </div>
    <form @submit="handleSearchSubmit">
      <SearchInput
        :model-value="searchQuery"
        placeholder="Search the web..."
        @update:model-value="emit('update:searchQuery', $event)"
        @keyup.enter="handleSearchSubmit($event as any)"
      />
    </form>
    <div
      class="quick-links-wrapper"
      :class="{ 'quick-links-wrapper--collapsed': quickLinksCollapsed }"
    >
      <div
        class="quick-links-header"
        @click="toggleQuickLinks"
      >
        <h3 class="quick-links-title">Quick Links</h3>
        <button
          class="collapse-toggle-btn"
          :title="quickLinksCollapsed ? 'Expand Quick Links' : 'Collapse Quick Links'"
          @click.stop="toggleQuickLinks"
        >
          <svg
            v-if="!quickLinksCollapsed"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M18 15l-6-6-6 6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
      <div
        class="quick-links-content"
        :class="{ 'quick-links-content--collapsed': quickLinksCollapsed }"
      >
        <QuickLinks :show-title="false" />
      </div>
    </div>
    <RGBCircle
      v-if="settingsStore.settings.doShowRgbCircle"
      class="floating-circle"
      @click="openProjectRepo()"
    />
  </div>
</template>

<style
  scoped
  lang="scss"
>
.dashboard-header {
  text-align: center;
}

.dashboard-greeting {
  display:        flex;
  flex-direction: column;
  margin-bottom:  1rem;
  gap:            var(--space-1);
}

.greeting-text {
  font-family:    var(--font-display);
  font-size:      2.5rem;
  font-weight:    600;
  letter-spacing: -0.02em;
  color:          var(--theme-c-text);
}

.greeting-sub {
  font-family: var(--font-display);
  font-size:   1.5rem;
  color:       var(--theme-c-text-muted);
}

.quick-links-wrapper {
  position: relative;
}

.quick-links-header {
  display:      flex;
  align-items:  center;
  margin-top:   1rem;
  padding-left: 1rem;
  cursor:       pointer;
  user-select:  none;
  transition:   opacity var(--transition-fast);
  gap:          var(--space-2);

  &:hover {
    opacity: 0.7;
  }
}

.quick-links-title {
  font-size:  0.875rem;
  margin:     0;
  text-align: left;
  color:      var(--theme-c-text-muted);
}

.collapse-toggle-btn {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           28px;
  height:          28px;
  padding:         0;
  cursor:          pointer;
  transition:      all var(--transition-fast);
  color:           var(--theme-c-text-muted);
  border:          none;
  border-radius:   50%;
  background:      transparent;

  svg {
    width:  16px;
    height: 16px;
  }

  &:hover {
    color:      var(--theme-c-text);
    background: var(--theme-c-border);
  }
}

.quick-links-content {
  overflow:   hidden;
  max-height: 500px;
  transition: max-height var(--transition-base), opacity var(--transition-base), transform var(--transition-base);
  transform:  translateY(0);
  opacity:    1;

  &--collapsed {
    max-height: 0;
    transform:  translateY(-10px);
    opacity:    0;
  }
}

.floating-circle {
  display: none;
}

@media (min-width: 920px) {
  .floating-circle {
    position: fixed;
    right:    30px;
    bottom:   30px;
    display:  block;
  }

}
</style>
