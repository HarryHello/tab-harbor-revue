<script
  setup
  lang="ts"
>
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
    <svg
      class="search-icon"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
        clip-rule="evenodd"
      />
    </svg>
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
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
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
