<script
  setup
  lang="ts"
>
import { computed } from 'vue';
import { type ThemeId, useThemeStore } from '@/stores/theme';
import ModalForm from '@/components/common/ModalForm.vue';
import Switch from '@/components/common/Switch.vue';
import { useSettingsStore } from '@/stores/settings';
import { exportConfigs, importConfigs } from '@/utils/configs';

const props = defineProps<{
  modelValue: boolean
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>();

const themeStore = useThemeStore();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// 从 theme store 获取主题信息
const themes = [
  {
    id: 'light' as ThemeId,
    name: 'Light',
  },
  {
    id: 'dark' as ThemeId,
    name: 'Dark',
  },
];

function selectTheme(themeId: ThemeId) {
  themeStore.setTheme(themeId);
}

// 获取主题的预览颜色（页面背景色）
function getThemePreviewColor(themeId: ThemeId): string {
  const themeColors = {
    light: '#f8f5f0',
    dark: '#1f1f1f',
  };
  return themeColors[themeId];
}

function closeSettings() {
  isOpen.value = false;
}

const settingsStore = useSettingsStore();

const handleExportConfigs = () => {
  exportConfigs();
};

const handleImportConfigs = () => {
  importConfigs();
};
</script>

<template>
  <ModalForm
    v-model="isOpen"
    title="Settings"
    @close="closeSettings"
  >
    <div class="settings-content">
      <section class="settings-section settings-section--theme">
        <h3 class="section-title">Appearance</h3>
        <div class="theme-grid">
          <button
            v-for="theme in themes"
            :key="theme.id"
            class="theme-capsule"
            :class="{ 'theme-capsule--active': themeStore.currentTheme === theme.id }"
            @click="selectTheme(theme.id)"
          >
            <span
              class="theme-color-circle"
              :style="{ backgroundColor: getThemePreviewColor(theme.id) }"
            ></span>
            <span class="theme-name">{{ theme.name }}</span>
          </button>
        </div>
      </section>
      <section class="settings-section settings-section--switchers">
        <h3 class="section-title">Others</h3>
        <div class="switcher-wrapper">
          <div class="switcher-with-label settings-show-ring">
            <Switch
              :model-value="settingsStore.settings.doShowRgbCircle"
              @update:model-value="settingsStore.updateSetting('doShowRgbCircle', $event)"
            />
            <label class="switcher-label">RGB Ring</label>
          </div>
          <div class="switcher-with-label settings-use-sync">
            <Switch
              :model-value="settingsStore.settings.doUseSync"
              @update:model-value="settingsStore.updateSetting('doUseSync', $event)"
            />
            <label class="switcher-label">Use Sync</label>
          </div>
          <div v-if="settingsStore.settings.doUseSync" class="switcher-with-label settings-sync-todos">
            <Switch
              :model-value="settingsStore.settings.doSyncTodos"
              @update:model-value="settingsStore.updateSetting('doSyncTodos', $event)"
            />
            <label class="switcher-label">Sync Todos</label>
          </div>
        </div>
      </section>
      <section class="settings-section settings-section--configs">
        <h3 class="section-title">Config File</h3>
        <div class="config-operations">
          <button class="btn btn--export-export" @click="handleExportConfigs">
            <span class="button-label">Export</span>
          </button>
          <button class="btn btn--import-config" @click="handleImportConfigs">
            <span class="button-label">Import</span>
          </button>
        </div>
      </section>
    </div>
  </ModalForm>
</template>

<style
  scoped
  lang="scss"
>
.settings-content {
  padding: var(--space-6);
}

.settings-section {
  margin-bottom: var(--space-6);

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size:      0.875rem;
  margin-bottom:  var(--space-4);
  user-select:    none;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color:          var(--theme-c-text-muted);
}

.theme-grid {
  display:               grid;
  grid-template-columns: repeat(3, 1fr);
  gap:                   var(--space-3);
}

.theme-capsule {
  position:        relative;
  display:         flex;
  align-items:     center;
  justify-content: end;
  padding:         var(--space-2) var(--space-3);
  cursor:          pointer;
  transition:      all var(--transition-base);
  border:          1px solid var(--theme-c-border);
  border-radius:   9999px;
  background:      var(--theme-c-card-bg);
  gap:             var(--space-2);

  &:hover {
    border-color: var(--theme-c-text-muted);
    box-shadow:   var(--shadow-sm);
  }

  &--active {
    border-color: var(--theme-c-accent);
    background:   var(--theme-c-card-bg-2);

    &:hover {
      border-color: var(--theme-c-accent);
    }

  }
}

.theme-color-circle {
  position:      absolute;
  left:          var(--space-2);
  flex-shrink:   0;
  width:         20px;
  height:        20px;
  border:        1px solid var(--theme-c-border);
  border-radius: 50%;
}

.switcher-wrapper {
  display:               grid;
  grid-template-columns: 1fr 1fr;
  gap:                   var(--space-2);
}

.switcher-with-label {
  display:     flex;
  align-items: center;
  gap:         var(--space-3);
}

.theme-name {
  font-size:    0.875rem;
  font-weight:  600;
  margin-right: 0.25rem;
  color:        var(--theme-c-text);
}

.button-label,
.switcher-label {
  font-weight: 600;
  user-select: none;
  color:       var(--theme-c-text);
}

.switcher-label {
  font-size: 1rem;
}

.button-label {
  font-size: 0.875rem;
}

.config-operations {
  font-family: var(--font-display);
  display:     flex;
  color:       var(--theme-c-text);
  gap:         var(--space-3);

  .btn {
    padding:       var(--space-2) var(--space-3);
    cursor:        pointer;
    transition:    all var(--transition-base);
    border:        1px solid var(--theme-c-border);
    border-radius: 9999px;
    background:    var(--theme-c-card-bg);

    &:hover {
      border-color: var(--theme-c-text-muted);
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

</style>
