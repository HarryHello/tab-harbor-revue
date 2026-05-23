<script
  setup
  lang="ts"
>
import EditIcon from '@/components/icons/EditIcon.vue';
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
  delete_link: [],
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
      <EditIcon :size="14" />
    </button>

    <button
    class="link-delete"
    title="Delete"
    @click="emit('delete_link')"
    >
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
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
  top:             6px;
  left:            8px;
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
  }

  &:hover {
    opacity:    1;
    background: color-mix(in srgb, var(--theme-c-active-bg) 50%, transparent);
  }
}
.link-delete {
  font-size:       14px;
  line-height:     1;
  position:        absolute;
  top:             6px;
  right:           8px;
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
  }

  &:hover {
    opacity:    1;
    background: color-mix(in srgb, var(--theme-c-active-bg) 50%, transparent);
  }
}

.link-frame:hover .link-edit,
.link-frame:hover .link-delete {
  opacity: 1;
}
</style>