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
  min-height:    44px;
  padding:       var(--space-3) var(--space-4);
  cursor:        text;
  transition:    all var(--transition-fast);
  border:        1px solid rgba(0, 0, 0, 0);
  border-radius: 9999px;
  background:    var(--theme-c-card-bg);
  gap:           var(--space-2);

  &:hover {
    border-color: var(--theme-c-accent);
  }
}

.search-input--focused {
  border-color: var(--theme-c-accent);
  border-width: 2px;
  transform: scale(1.02);
}

.search-icon {
  width:  18px;
  height: 18px;
  color:  var(--theme-c-text-muted);
}

.search-field {
  font-size:   0.9375rem;
  line-height: 1.5;
  flex:        1;
  min-height:  24px;
  color:       var(--theme-c-text);
  border:      none;
  outline:     none;
  background:  transparent;
}

.search-field::placeholder {
  font-size:   0.9375rem;
  line-height: 1.5;
  color:       var(--theme-c-text-muted);
}

.search-clear {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           24px;
  height:          24px;
  transition:      all var(--transition-fast);
  color:           var(--theme-c-text-muted);
  border-radius:   50%;
}

.search-clear:hover {
  color:      var(--theme-c-text);
  background: var(--theme-c-active-bg);
}

.search-clear svg {
  width:  14px;
  height: 14px;
}
</style>
