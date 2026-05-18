<script
  setup
  lang="ts"
>
import RGBCircle from '@/components/common/RGBCircle.vue';
import SearchInput from '@/components/drawer/SearchInput.vue';
import { ChevronIcon } from '@/components/icons';
import { useSettingsStore } from '@/stores/settings';
import { handleUrlSecurityCheck } from '@/utils/helpers';
import { computed, ref } from 'vue';
import QuickLinks from './QuickLinks.vue';

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
    // 用用户默认搜索引擎在新标签页打开
    if (typeof chrome !== 'undefined' && chrome.search) {
      chrome.search.query({ text: props.searchQuery, disposition: 'NEW_TAB' });
    } else {
      const query = encodeURIComponent(props.searchQuery);
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
    <form
      class="search-form"
      @submit="handleSearchSubmit"
    >
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
          <ChevronIcon
            :direction="quickLinksCollapsed ? 'down' : 'up'"
            :size="16"
          />
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
  margin-bottom:  var(--space-6);
  gap:            var(--space-2);
}

.greeting-text {
  font-family:    var(--font-display);
  font-size:      2.5rem;
  font-weight:    500;
  line-height:    1.2;
  letter-spacing: -0.02em;
  color:          var(--theme-c-text);
}

.greeting-sub {
  font-family: var(--font-display);
  font-size:   1.25rem;
  color:       var(--md-sys-color-on-surface-variant);
}

.quick-links-wrapper {
  position: relative;
}

.quick-links-header {
  display:     flex;
  align-items: center;
  max-width:   560px;
  margin:      var(--space-6) auto 0;
  cursor:      pointer;
  user-select: none;
  transition:  opacity var(--transition-fast);
  gap:         var(--space-2);

  &:hover {
    opacity: 0.7;
  }
}

.quick-links-title {
  font-size:     0.875rem;
  font-weight:   500;
  margin:        0;
  text-align:    left;
  letter-spacing: 0.025em;
  color:         var(--md-sys-color-on-surface-variant);
}

.collapse-toggle-btn {
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
    color:      var(--theme-c-text);
    background: var(--theme-c-active-bg);
  }
}

.quick-links-content {
  overflow:   hidden;
  max-width:  560px;
  max-height: 500px;
  margin:     0 auto;
  transition: max-height var(--transition-base), opacity var(--transition-base), transform var(--transition-base);
  transform:  translateY(0);
  opacity:    1;

  &--collapsed {
    max-height: 0;
    transform:  translateY(-10px);
    opacity:    0;
  }
}

.search-form {
  width:     100%;
  max-width: 560px;
  margin:    0 auto;
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
