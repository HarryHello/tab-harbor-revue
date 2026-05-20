<script
  setup
  lang="ts"
>
withDefaults(defineProps<{
  size?: number
}>(), {
  size: 16,
});
</script>

<template>
  <svg
    viewBox="0 0 20 20"
    fill="none"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <path
      d="M13.5858 3.58579C14.3668 2.80474 15.6332 2.80474 16.4142 3.58579C17.1953 4.36683 17.1953 5.63316 16.4142 6.41421L15.4142 7.41421L12.5858 4.58579L13.5858 3.58579Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M11.5858 5.58579L14.4142 8.41421L7.41421 15.4142C7.149 15.6794 6.80474 15.85 6.43934 15.9239L3.43934 16.5239C2.82838 16.6462 2.24411 16.0984 2.33984 15.4766L2.73082 12.9123C2.79265 12.508 2.97386 12.1295 3.2626 11.8408L11.5858 5.58579Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
