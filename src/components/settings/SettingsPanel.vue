<script
  setup
  lang="ts"
>
import ModalForm from '@/components/common/ModalForm.vue';
import Switch from '@/components/common/Switch.vue';
import { MoonIcon, SunIcon } from '@/components/icons';
import { useSettingsStore } from '@/stores/settings';
import { type ThemeId, useThemeStore } from '@/stores/theme';
import { exportConfigs, importConfigs } from '@/utils/configs';
import { computed } from 'vue';

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
            <span class="theme-color-icon">
              <SunIcon v-if="theme.id === 'light'" :size="20" />
              <MoonIcon v-else :size="20" />
            </span>
            <span class="theme-name">{{ theme.name }}</span>
          </button>
        </div>
      </section>
      <section class="settings-section settings-section--switchers">
        <h3 class="section-title">Others</h3>
        <div class="switcher-group">
        <div class="switcher-with-label settings-show-ring">
          <Switch
            :model-value="settingsStore.settings.doShowRgbCircle"
            @update:model-value="settingsStore.updateSetting('doShowRgbCircle', $event)"
          />
          <label class="switcher-label">RGB Ring</label>
        </div>
        <div class="switcher-with-label settings-close-dup">
          <Switch
            :model-value="settingsStore.settings.doCloseDuplicateNewTabs"
            @update:model-value="settingsStore.updateSetting('doCloseDuplicateNewTabs', $event)"
          />
          <label class="switcher-label">Auto-close duplicate new tabs</label>
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

.theme-color-icon {
  position:    absolute;
  left:        var(--space-2);
  flex-shrink: 0;
  width:       20px;
  height:      20px;
  color:       var(--theme-c-text);

  svg {
    width:  100%;
    height: 100%;
  }
}

.switcher-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
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
