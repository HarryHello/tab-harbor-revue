<script
  setup
  lang="ts"
>
import { ClearIcon, SearchIcon } from '@/components/icons';
import { ref } from 'vue';

const props = defineProps<{
  placeholder?: string
}>();

const emit = defineEmits<{
  submit: []
}>();

const modelValue = defineModel<string>({ required: true });

const focused = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

function handleContainerClick() {
  inputRef.value?.focus();
}

function handleKeyup(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    emit('submit');
  }
}
</script>

<template>
  <div
    class="search-input"
    :class="{ 'search-input--focused': focused }"
    @click="handleContainerClick"
  >
    <SearchIcon class="search-icon" />
    <input
      ref="inputRef"
      type="text"
      :value="modelValue"
      :placeholder="props.placeholder || 'Search...'"
      class="search-field"
      @input="modelValue = ($event.target as HTMLInputElement).value"
      @focus="focused = true"
      @blur="focused = false"
      @keyup.enter="handleKeyup"
    />
    <button
      v-if="modelValue"
      class="search-clear"
      type="button"
      @click="modelValue = ''"
    >
      <ClearIcon :size="14" />
    </button>
  </div>
</template>

<style
  scoped
  lang="scss"
>
.search-input {
  display:       flex;
  align-items:   center;
  min-height:    56px;
  padding:       var(--space-2) var(--space-4);
  cursor:        text;
  transition:    all var(--transition-fast);
  border:        1px solid transparent;
  border-radius: 9999px;
  background:    var(--md-sys-color-surface-container-highest);
  gap:           var(--space-3);

  &:hover {
    border-color: var(--md-sys-color-on-primary-container);
  }
}

.search-input--focused {
  border-color: var(--md-sys-color-on-primary-container);
  border-width: 2px;
}

.search-icon {
  width:  20px;
  height: 20px;
  color:  var(--md-sys-color-on-surface-variant);
}

.search-field {
  font-size:   1rem;
  line-height: 1.5;
  flex:        1;
  min-height:  24px;
  color:       var(--theme-c-text);
  border:      none;
  outline:     none;
  background:  transparent;
}

.search-field::placeholder {
  font-size:   1rem;
  line-height: 1.5;
  color:       var(--md-sys-color-on-surface-variant);
}

.search-clear {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           40px;
  height:          40px;
  transition:      all var(--transition-fast);
  color:           var(--md-sys-color-on-surface-variant);
  border:          none;
  border-radius:   50%;
  background:      transparent;
}

.search-clear:hover {
  color:      var(--theme-c-text);
  background: var(--theme-c-active-bg);
}

.search-clear svg {
  width:  18px;
  height: 18px;
}
</style>
