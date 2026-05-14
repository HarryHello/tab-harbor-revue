<script setup lang="ts">
defineProps<{
  count: number
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button class="overflow-chips" @click="emit('click')">
    +{{ count }} more
  </button>
</template>

<style scoped lang="scss">
.overflow-chips {
  padding: var(--space-2) var(--space-3);
  background: var(--theme-c-border);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  color: var(--theme-c-text-muted);
  transition: all var(--transition-fast);
}

.overflow-chips:hover {
  background: var(--theme-c-accent);
  color: var(--md-sys-color-on-primary-container);
}
</style>
