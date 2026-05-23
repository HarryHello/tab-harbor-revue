<script
  setup
  lang="ts"
>

const props = withDefaults(defineProps<{
  modelValue: boolean;
}>(), {});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const toggle = () => {
  emit('update:modelValue', !props.modelValue);
};
</script>

<template>
  <div
    class="switch"
    role="switch"
    :aria-checked="modelValue"
    :tabindex="0"
    @click="toggle"
    @keydown.space.prevent="toggle"
    @keydown.enter.prevent="toggle"
  >
    <div
      class="switch-wrapper"
      :class="{ 'switch-wrapper--active': modelValue }"
    >
      <div
        class="switch-handle"
        :class="{ 'switch-handle--active': modelValue }"
      />
    </div>
  </div>
</template>

<style
  scoped
  lang="scss"
>

.switch {
  $switch-size:  48px;
  $handle-size:  20px;
  $gap-size:     3px;
  display:       inline-block;
  width:         $switch-size;
  height:        #{$handle-size + $gap-size * 2};
  cursor:        pointer;
  border-radius: 99px;
  outline:       none;

  &:focus-visible {
    box-shadow: 0 0 0 2px var(--theme-c-accent);
  }

  .switch-wrapper {
    position:      relative;
    display:       inline-block;
    width:         100%;
    height:        100%;
    padding:       0;
    transition:    background-color 0.2s ease-in-out;
    border-radius: 99px;
    background:    color-mix(in srgb, var(--theme-c-text-muted) 50%, var(--theme-c-card-bg));


    .switch-handle {
      position:      absolute;
      top:           $gap-size;
      left:          $gap-size;
      width:         $handle-size;
      height:        $handle-size;
      transition:    all 0.2s ease-in-out;
      border-radius: 50%;
      background:    var(--theme-c-page-bg);
      box-shadow:    var(--shadow-sm);

      &--active {
        left: #{$switch-size - $handle-size - $gap-size};
      }

      &:hover {
        transform: scale(1.5);
        opacity:   0.7;
      }
    }

    &--active {
      background: var(--theme-c-accent);
    }
  }
}


</style>