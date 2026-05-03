<script
  setup
  lang="ts"
>
import { ref, watch } from 'vue';
import ModalForm from '@/components/common/ModalForm.vue';

interface QuickLink {
  id: string;
  title: string;
  url: string;
}

const props = defineProps<{
  link: QuickLink | null;
}>();

const emit = defineEmits<{
  submit: [id: string, title: string, url: string];
  delete: [id: string];
  cancel: [];
}>();

const showForm = ref(false);
const title = ref('');
const url = ref('');

// 监听 link 变化，填充表单
watch(() => props.link, (newLink) => {
  if (newLink) {
    title.value = newLink.title;
    url.value = newLink.url;
    showForm.value = true;
  }
}, { immediate: true });

function handleSubmit() {
  if (props.link && title.value && url.value) {
    emit('submit', props.link.id, title.value, url.value);
    showForm.value = false;
  }
}

function handleDelete() {
  if (props.link) {
    const confirmed = confirm('Are you sure you want to delete this link?');
    if (confirmed) {
      emit('delete', props.link.id);
      showForm.value = false;
    }
  }
}

function handleCancel() {
  emit('cancel');
  showForm.value = false;
}

function openForm() {
  if (props.link) {
    title.value = props.link.title;
    url.value = props.link.url;
    showForm.value = true;
  }
}

defineExpose({ openForm });
</script>

<template>
  <ModalForm
    v-model="showForm"
    title="Edit Link"
    @close="handleCancel"
  >
    <form
      class="modal-form"
      @submit.prevent="handleSubmit"
    >
      <div class="form-group">
        <label>Title</label>
        <input
          v-model="title"
          type="text"
          placeholder="e.g., GitHub"
          class="form-input"
          required
          autofocus
        />
      </div>
      <div class="form-group">
        <label>Url</label>
        <input
          v-model="url"
          type="url"
          placeholder="https://example.com"
          class="form-input"
          required
        />
      </div>
    </form>

    <template #actions>
      <button
        type="button"
        class="modal-btn modal-btn--delete"
        @click="handleDelete"
      >
        Delete
      </button>
      <button
        type="submit"
        class="modal-btn modal-btn--save"
        @click="handleSubmit"
      >
        Save Changes
      </button>
    </template>
  </ModalForm>
</template>

<style
  scoped
  lang="scss"
>
.modal-form {
  display:        flex;
  flex-direction: column;
  gap:            var(--space-4);
}

.form-group {
  display:               grid;
  grid-template-columns: 1fr 3fr;
  gap:                   var(--space-2);

  label {
    font-family: var(--font-display);
    font-size:   1rem;
    font-weight: 500;
    align-self:  center;
    cursor:      default;
    color:       var(--theme-c-text-muted);
  }
}

.form-input {
  font-size:     0.9375rem;
  padding:       var(--space-2);
  padding-right: var(--space-3);
  padding-left:  var(--space-3);
  transition:    all var(--transition-fast);
  color:         var(--theme-c-text);
  border:        1px solid transparent;
  border-radius: 9999px;
  outline:       none;
  background:    var(--theme-c-card-bg);

  &:hover {
    border-color: var(--theme-c-accent);
  }

  &:focus {
    border-color: var(--theme-c-accent);
  }
}
</style>
