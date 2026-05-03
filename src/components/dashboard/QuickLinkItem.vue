<script setup lang="ts">
import { ref } from 'vue';
import { getFaviconUrl, getInitial, getRandomColor } from '@/utils/helpers';

interface QuickLink {
  id: string;
  title: string;
  url: string;
}

const props = defineProps<{
  link: QuickLink;
}>();

const emit = defineEmits<{
  click: [url: string];
  remove: [id: string];
}>();

const imageError = ref(false);

function handleClick() {
  emit('click', props.link.url);
}

function handleRemove(event: Event) {
  event.stopPropagation();
  emit('remove', props.link.id);
}

function handleImageError() {
  imageError.value = true;
}
</script>

<template>
  <div class="link-card" @click="handleClick">
    <div v-if="!imageError" class="link-icon">
      <img
        :src="getFaviconUrl(link.url)"
        :alt="link.title"
        class="link-favicon"
        @error="handleImageError"
      />
    </div>
    <div v-else class="link-icon">
      <div
        class="link-avatar"
        :style="{ backgroundColor: getRandomColor(link.url) }"
      >
        {{ getInitial(link.title) }}
      </div>
    </div>
    <span class="link-title">{{ link.title }}</span>
    <button
      class="link-remove"
      title="Remove"
      @click="handleRemove"
    >
      ×
    </button>
  </div>
</template>

<style scoped lang="scss">
.link-card {
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 8px 0;
  cursor: pointer;
  border: none;
  border-radius: var(--radius-lg);
  background: none;
  gap: var(--space-2);
}

.link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  transition: all var(--transition-base);
  border: none;
  border-radius: 50%;
  background: var(--theme-c-card-bg);
}

.link-card:hover .link-icon {
  background: var(--theme-c-border);
}

.link-favicon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.link-avatar {
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  text-transform: uppercase;
  color: white;
  border-radius: 50%;
}

.link-title {
  font-size: 0.8125rem;
  text-align: center;
  word-break: break-word;
  color: var(--theme-c-text);
}

.link-remove {
  font-size: 14px;
  line-height: 1;
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  cursor: pointer;
  transition: opacity var(--transition-fast);
  opacity: 0;
  color: var(--error);
  border: none;
  border-radius: 50%;
  background: var(--error-light);
}

.link-card:hover .link-remove {
  opacity: 1;
}
</style>
