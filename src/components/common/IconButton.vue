<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}>();
</script>

<template>
  <button
    class="icon-button"
    :class="[`icon-button--${variant || 'default'}`, `icon-button--${size || 'md'}`]"
  >
    <slot />
  </button>
</template>

<style scoped lang="scss">
.icon-button {
  display:         inline-flex;
  align-items:     center;
  justify-content: center;
  transition:      all var(--transition-fast);
  color:           var(--theme-c-text-muted);
  border-radius:   var(--radius-sm);
}

.icon-button--default:hover {
  color:      var(--theme-c-text);
  background: var(--theme-c-active-bg);
}

.icon-button--danger:hover {
  color:      var(--theme-c-danger);
  background: color-mix(in srgb, var(--theme-c-danger) 15%, transparent);
}

.icon-button--sm {
  width:  28px;
  height: 28px;
}

.icon-button--md {
  width:  36px;
  height: 36px;
}

.icon-button svg {
  width:  18px;
  height: 18px;
}

.icon-button--sm svg {
  width:  16px;
  height: 16px;
}
</style>
