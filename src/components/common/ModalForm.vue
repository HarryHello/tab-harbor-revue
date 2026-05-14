<script
  setup
  lang="ts"
>
import { computed } from 'vue';
import { CloseIcon } from '@/components/icons';

const props = withDefaults(defineProps<{
  modelValue: boolean;
  title?: string;
  maxWidth?: string;
  blur?: boolean;
}>(), {
  blur: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

function handleClose() {
  isOpen.value = false;
  emit('close');
}

function handleOverlayClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    handleClose();
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-form">
      <div
        v-if="isOpen"
        class="modal-form-overlay"
        :class="{'model-form-overlay--blur' : blur}"
        @click="handleOverlayClick"
      >
        <div
          class="modal-form-content"
          :style="{ maxWidth: maxWidth || '500px' }"
        >
          <div
            v-if="title"
            class="modal-form-header"
          >
            <h2 class="modal-form-title">{{ title }}</h2>
            <button
              class="modal-form-close"
              aria-label="Close"
              @click="handleClose"
            >
              <CloseIcon :size="20" />
            </button>
          </div>

          <div class="modal-form-body">
            <slot />
          </div>

          <div
            v-if="$slots.actions"
            class="modal-form-actions"
          >
            <slot name="actions" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style
  scoped
  lang="scss"
>
.modal-form-overlay {
  position:        fixed;
  z-index:         1000;
  display:         flex;
  align-items:     center;
  justify-content: center;
  background:      rgba(0, 0, 0, 0.4);
  inset:           0;

  &--blur {
    backdrop-filter: blur(4px);
  }
}

.modal-form-content {
  overflow-y:    auto;
  width:         90%;
  max-height:    80vh;
  padding:       var(--space-6);
  border-radius: var(--radius-xl);
  background:    var(--md-sys-color-surface-container-high);
  box-shadow:    var(--shadow-lg);
  will-change:   transform, opacity;
}

.modal-form-header {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  margin-bottom:   var(--space-4);
  padding-bottom:  var(--space-4);
  border-bottom:   1px solid var(--md-sys-color-outline-variant);
}

.modal-form-title {
  font-family: var(--font-display);
  font-size:   1.5rem;
  font-weight: 500;
  margin:      0;
  color:       var(--theme-c-text);
}

.modal-form-close {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           40px;
  height:          40px;
  cursor:          pointer;
  transition:      all var(--transition-fast);
  color:           var(--md-sys-color-on-surface-variant);
  border:          none;
  border-radius:   50%;
  background:      transparent;

  &:hover {
    color:      var(--theme-c-text);
    background: var(--theme-c-active-bg);
  }

  svg {
    width:  20px;
    height: 20px;
  }
}

.modal-form-actions {
  display:    flex;
  margin-top: var(--space-4);
  gap:        var(--space-3);

  :deep(.modal-btn) {
    font-size:     0.9375rem;
    font-weight:   500;
    flex:          1;
    padding:       var(--space-3);
    cursor:        pointer;
    transition:    all var(--transition-fast);
    border:        none;
    border-radius: 9999px;

    &:hover {
      transform: translateY(-1px);
    }
  }

  :deep(.modal-btn--cancel) {
    color:      var(--theme-c-text);
    background: var(--theme-c-card-bg);

    &:hover {
      background: var(--theme-c-active-bg);
    }
  }

  :deep(.modal-btn--save) {
    color:      white;
    background: var(--theme-c-accent);

    &:hover {
      opacity: 0.9;
    }
  }

  :deep(.modal-btn--delete) {
    font-weight: bold;
    color:       var(--theme-c-danger);
    background:  color-mix(in srgb, var(--theme-c-danger) 30%, transparent);

    &:hover {
      opacity: 0.9;
    }
  }
}

// Modal 过渡动画
.modal-form-enter-active,
.modal-form-leave-active {
  transition: opacity var(--transition-base);
}

.modal-form-enter-from,
.modal-form-leave-to {
  opacity: 0;
}

.modal-form-enter-active .modal-form-content,
.modal-form-leave-active .modal-form-content {
  transition: transform var(--transition-base), opacity var(--transition-base);
}

.modal-form-enter-from .modal-form-content,
.modal-form-leave-to .modal-form-content {
  transform: scale(0.95) translateY(10px);
  opacity:   0;
}
</style>
