<script
  setup
  lang="ts"
>
import ModalForm from '@/components/common/ModalForm.vue';
import Switch from '@/components/common/Switch.vue';
import { MoonIcon, SunIcon } from '@/components/icons';
import { useSettingsStore } from '@/stores/settings';
import { useThemeStore, type ColorScheme, COLOR_SCHEMES } from '@/stores/theme';
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

const colorSchemes: { id: ColorScheme; name: string; color: string }[] = [
  { id: 'google-blue',   name: 'Google Blue',   color: '#4285f4' },
  { id: 'forest-green',  name: 'Forest Green',  color: '#34a853' },
  { id: 'paper',         name: 'Paper',          color: '#8a653f' },
  { id: 'sage',          name: 'Sage',           color: '#4f7657' },
  { id: 'mist',          name: 'Mist',           color: '#4f6d88' },
  { id: 'blush',         name: 'Blush',          color: '#a5656f' },
];

function selectScheme(scheme: ColorScheme) {
  themeStore.setColorScheme(scheme);
}

import type { ColorMode } from '@/stores/theme';

function selectMode(mode: ColorMode) {
  themeStore.setColorMode(mode);
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
      <section class="settings-section settings-section--scheme">
        <h3 class="section-title">Color Scheme</h3>
        <div class="scheme-grid">
          <button
            v-for="scheme in colorSchemes"
            :key="scheme.id"
            class="scheme-capsule"
            :class="{ 'scheme-capsule--active': themeStore.colorScheme === scheme.id }"
            @click="selectScheme(scheme.id)"
          >
            <span
              class="scheme-dot"
              :style="{ backgroundColor: scheme.color }"
            />
            <span class="scheme-name">{{ scheme.name }}</span>
          </button>
        </div>
      </section>

      <section class="settings-section settings-section--mode">
        <h3 class="section-title">Mode</h3>
        <div class="mode-toggle">
          <button
            class="mode-btn"
            :class="{ 'mode-btn--active': themeStore.colorMode === 'light' }"
            @click="selectMode('light')"
          >
            <SunIcon :size="18" />
            <span>Light</span>
          </button>
          <button
            class="mode-btn"
            :class="{ 'mode-btn--active': themeStore.colorMode === 'dark' }"
            @click="selectMode('dark')"
          >
            <MoonIcon :size="18" />
            <span>Dark</span>
          </button>
          <button
            class="mode-btn"
            :class="{ 'mode-btn--active': themeStore.colorMode === 'auto' }"
            @click="selectMode('auto')"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <path d="M8 21h8"/>
              <path d="M12 17v4"/>
            </svg>
            <span>Auto</span>
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

/* ---- Color Scheme Grid ---- */
.scheme-grid {
  display:               grid;
  grid-template-columns: repeat(3, 1fr);
  gap:                   var(--space-3);
}

.scheme-capsule {
  position:        relative;
  display:         flex;
  align-items:     center;
  justify-content: center;
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
  }
}

.scheme-dot {
  display: inline-block;
  width:   14px;
  height:  14px;
  border-radius: 50%;
  flex-shrink:   0;
}

.scheme-name {
  font-size:    0.875rem;
  font-weight:  600;
  color:        var(--theme-c-text);
}

/* ---- Mode Toggle ---- */
.mode-toggle {
  display:               grid;
  grid-template-columns: repeat(3, 1fr);
  gap:                   var(--space-3);
}

.mode-btn {
  display:         flex;
  align-items:     center;
  justify-content: center;
  gap:             var(--space-2);
  padding:         var(--space-2) var(--space-3);
  cursor:          pointer;
  transition:      all var(--transition-base);
  border:          1px solid var(--theme-c-border);
  border-radius:   9999px;
  background:      var(--theme-c-card-bg);
  font-size:       0.875rem;
  font-weight:     600;
  color:           var(--theme-c-text);

  &:hover {
    border-color: var(--theme-c-text-muted);
    box-shadow:   var(--shadow-sm);
  }

  &--active {
    border-color: var(--theme-c-accent);
    background:   var(--theme-c-card-bg-2);
  }
}

/* ---- Switchers ---- */
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
