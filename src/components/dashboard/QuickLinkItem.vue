<script
  setup
  lang="ts"
>
import QuickLinkFrame from '@/components/dashboard/QuickLinkFrame.vue';
import type { QuickLink } from '@/types';
import { getFaviconUrl, getInitial, getRandomColor } from '@/utils/helpers';
import { computed, ref } from 'vue';

const props = defineProps<{
  link: QuickLink;
}>();

const emit = defineEmits<{
  click: [url: string];
  edit: [link: QuickLink];
  delete: [link: QuickLink];
}>();

const imageError = ref(false);
const useFallback = ref(false);

const faviconResult = computed(() => getFaviconUrl({ domain: props.link.url }));
const currentSrc = computed(() => useFallback.value ? faviconResult.value.fallback : faviconResult.value.url);

function handleClick() {
  emit('click', props.link.url);
}

function handleEdit() {
  emit('edit', props.link);
}

function handleDelete() {
  emit('delete', props.link);
}


function handleImageError() {
  if (!useFallback.value) {
    useFallback.value = true;
  } else {
    imageError.value = true;
  }
}
</script>

<template>
  <QuickLinkFrame
    :title="link.title"
    @click_icon="handleClick"
    @edit_link="handleEdit"
    @delete_link="handleDelete"
    class="quick-link"
  >
    <div v-if="!imageError">
      <img
        :src="currentSrc"
        :alt="link.title"
        class="link-favicon"
        @error="handleImageError"
      />
    </div>
    <div v-else>
      <div
        class="link-avatar"
        :style="{ backgroundColor: getRandomColor(link.url) }"
      >
        {{ getInitial(link.title) }}
      </div>
    </div>
  </QuickLinkFrame>
</template>

<style
  scoped
  lang="scss"
>
.quick-link {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease-in-out;

    &:hover {
      transform: translateY(-2px);
      .link-favicon {
        filter: brightness(0.9);
      }
    }
}
.link-favicon {
  width:      28px;
  height:     28px;
  object-fit: contain;
}

.link-avatar {
  font-family:     var(--font-display);
  font-size:       0.875rem;
  font-weight:     600;
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           28px;
  height:          28px;
  text-transform:  uppercase;
  color:           white;
  border-radius:   50%;
}
</style>
