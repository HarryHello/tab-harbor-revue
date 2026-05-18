<script
  setup
  lang="ts"
>
withDefaults(defineProps<{
  size?: number
}>(), {
  size: 20,
});
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    <path d="M8 15s1-3 4-3 5 3 5 3" />
    <path d="M12 4v.01" />
    <path d="M12 8v.01" />
    <path d="M15 6v.01" />
    <path d="M16 9v.01" />
  </svg>
</template>
