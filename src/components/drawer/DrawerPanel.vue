<script
  setup
  lang="ts"
>
import { computed, ref, watch } from 'vue';
import SavedPanel from '@/components/drawer/SavedPanel.vue';
import TodoPanel from '@/components/drawer/TodoPanel.vue';
import { BookmarkIcon, CheckmarkIcon, CloseIcon } from '@/components/icons';

const props = defineProps<{
  open: boolean
  initialTab?: 'saved' | 'todos'
}>();

const emit = defineEmits<{
  close: []
}>();

const activeTab = ref(props.initialTab || 'saved');

watch(() => props.initialTab, (val) => {
  if (val) activeTab.value = val;
});

function close() {
  emit('close');
}

// 计算指示器的位置
const indicatorStyle = computed(() => {
  return {
    transform: activeTab.value === 'saved' ? 'translateX(0)' : 'translateX(40px)',
  };
});
</script>

<template>
  <Transition name="drawer">
    <div
      v-if="open"
      class="drawer-panel"
    >
      <div
        class="drawer-backdrop"
        @click="close"
      />
      <div class="drawer-content">
        <div class="drawer-header">
          <div class="drawer-tabs">
            <div
              class="tab-indicator"
              :style="indicatorStyle"
            />
            <button
              class="drawer-tab"
              :class="{ 'drawer-tab--active': activeTab === 'saved' }"
              aria-label="Saved pages"
              @click="activeTab = 'saved'"
            >
              <BookmarkIcon :size="16" />
            </button>
            <button
              class="drawer-tab"
              :class="{ 'drawer-tab--active': activeTab === 'todos' }"
              aria-label="Todos"
              @click="activeTab = 'todos'"
            >
              <CheckmarkIcon :size="16" />
            </button>
          </div>
          <button
            class="drawer-close"
            aria-label="Close"
            @click="close"
          >
            <CloseIcon :size="20" />
          </button>
        </div>
        <div class="drawer-body">
          <SavedPanel v-if="activeTab === 'saved'" />
          <TodoPanel v-else />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style
  scoped
  lang="scss"
>
.drawer-panel {
  position:        fixed;
  z-index:         100;
  display:         flex;
  align-items:     center;
  justify-content: center;
  padding:         var(--space-6);
  pointer-events:  none;
  inset:           0;

  .drawer-backdrop {
    position:        absolute;
    display:         none;
    pointer-events:  auto;
    background:      rgba(0, 0, 0, 0.3);
    inset:           0;
    backdrop-filter: blur(4px);
  }

  .drawer-content {
    position:        relative;
    z-index:         1;
    display:         flex;
    overflow:        hidden;
    flex-direction:  column;
    width:           560px;
    max-width:       100%;
    height:          100%;
    min-height:      400px;
    max-height:      calc(100vh - 48px);
    pointer-events:  auto;
    border-radius:   var(--radius-xl);
    background:      var(--md-sys-color-surface-container-high);
    box-shadow:      var(--shadow-lg);
  }

  // 大屏幕：右侧圆角浮窗
  @media screen and (min-width: 920px) {
    align-items:     flex-start;
    justify-content: flex-end;
    // GroupNav + spacing + extra
    padding:         calc(32px + var(--space-6) + var(--space-6)) var(--space-8) 0 0;

    .drawer-backdrop {
      display: none;
    }

    .drawer-content {
      width:         720px;
      max-width:     45%;
      max-height:    calc(100vh - 60px - var(--space-6) * 3);
      margin-top:    0;
      border-radius: var(--radius-lg);
    }
  }
}

.drawer-header {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  padding:         var(--space-3) var(--space-6);
  border-bottom:   1px solid var(--md-sys-color-outline-variant);
}

.drawer-tabs {
  position:      relative;
  display:       flex;
  padding:       var(--space-1);
  border-radius: 99px;
  background:    var(--theme-c-card-bg);
  gap:           var(--space-2);
}

.tab-indicator {
  position:      absolute;
  z-index:       0;
  left:          var(--space-1);
  width:         32px;
  height:        32px;
  transition:    transform var(--transition-base);
  border-radius: 50%;
  background:    var(--md-sys-color-primary-container);
  box-shadow:    var(--shadow-sm);
}

.drawer-tab {
  position:        relative;
  z-index:         1;
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           32px;
  height:          32px;
  cursor:          pointer;
  transition:      color var(--transition-fast);
  color:           var(--md-sys-color-on-surface-variant);
  border:          none;
  border-radius:   50%;
  background:      transparent;
}

.drawer-tab svg {
  width:  16px;
  height: 16px;
}

.drawer-tab:hover {
  color: var(--theme-c-text);
}

.drawer-tab--active {
  color: var(--md-sys-color-on-primary-container);
}

.drawer-close {
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

.drawer-close:hover {
  color:      var(--theme-c-text);
  background: var(--theme-c-active-bg);
}

.drawer-close svg {
  width:  20px;
  height: 20px;
}

.drawer-body {
  overflow-y: auto;
  flex:       1;
  padding:    var(--space-6);
}

// Drawer 过渡动画
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity var(--transition-base);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-active .drawer-content,
.drawer-leave-active .drawer-content {
  transition: transform var(--transition-base), opacity var(--transition-base);
}

.drawer-enter-from .drawer-content,
.drawer-leave-to .drawer-content {
  transform: scale(0.95) translateY(20px);
  opacity:   0;
}

// 大屏幕时的动画（从右侧滑入）
@media screen and (min-width: 920px) {
  .drawer-enter-active .drawer-content,
  .drawer-leave-active .drawer-content {
    transition: transform var(--transition-base);
  }

  .drawer-enter-from .drawer-content,
  .drawer-leave-to .drawer-content {
    transform: translateX(100%);
    opacity:   1;
  }
}
</style>
