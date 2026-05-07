<script
  setup
  lang="ts"
>
import MoreIcon from '@/components/icons/MoreIcon.vue';
const props = withDefaults(defineProps<{
  hide_title?: boolean,
  is_add?: boolean,
  title: string,
}>(), {
  hide_title: false,
  is_add: false,
});

const emit = defineEmits<{
  click_icon: [],
  edit_link: [],
}>();

function handleClickIcon() {
  emit('click_icon');
}

</script>

<template>
  <div class="link-frame">
    <div
      class="link-avatar-wrapper"
      @click="handleClickIcon"
    >
      <div class="link-icon">
        <slot />
      </div>
    </div>
    <div
      v-if="!hide_title"
      class="link-title"
    >
      {{ title }}
    </div>

    <button
      v-if="!is_add"
      class="link-edit"
      title="Edit"
      @click="emit('edit_link')"
    >
      <MoreIcon :size="14" />
    </button>
  </div>

</template>

<style
  scoped
  lang="scss"
>

.link-frame {
  position:       relative;
  display:        flex;
  align-items:    center;
  flex-direction: column;
  padding:        8px 0;
  border:         none;
  border-radius:  var(--radius-lg);
  background:     none;
  gap:            var(--space-2);
}

.link-avatar-wrapper {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           48px;
  height:          48px;
  cursor:          pointer;
  transition:      all var(--transition-base);
  border:          none;
  border-radius:   50%;
  background:      var(--theme-c-card-bg);

  &:hover {
    background: var(--theme-c-active-bg);
  }
}

.link-icon {
  width:      28px;
  height:     28px;
  object-fit: contain;
}

.link-title {
  cursor:      default;
  user-select: none;
  color:       var(--theme-c-text);
}

.link-edit {
  font-size:       14px;
  line-height:     1;
  position:        absolute;
  top:             4px;
  right:           4px;
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           18px;
  height:          18px;
  cursor:          pointer;
  transition:      opacity var(--transition-fast);
  opacity:         0;
  color:           var(--theme-c-text-muted);
  border:          none;
  border-radius:   50%;
  background:      transparent;

  svg {
    width:  14px;
    height: 14px;
    transform: rotate(90deg);
  }

  &:hover {
    opacity:    1;
    background: color-mix(in srgb, var(--theme-c-active-bg) 50%, transparent);
  }
}

.link-frame:hover .link-edit {
  opacity: 1;
}
</style>