<script
  setup
  lang="ts"
>
import { ref } from 'vue';
import { AddIcon } from '@/components/icons';

const emit = defineEmits<{
  submit: [title: string, description?: string]
}>();

const title = ref('');
const description = ref('');

const showAdd = ref(false);

const cancel = () => {
  title.value = '';
  description.value = '';
  showAdd.value = false;
};

</script>

<template>
  <div class="add-todo">
    <div
      class="add-trigger"
      :class="showAdd ? 'add-trigger--active' : ''"
      @click="showAdd = !showAdd"
    >
      <AddIcon :size="18" />
      <span>Add Todo</span>
    </div>
    <div
      class="add-form"
      :class="showAdd ? 'add-form--visible' : ''"
    >
      <div class="add-form-content">
        <div class="add-todo-inputs">
          <input
            v-model="title"
            class="add-title"
            type="text"
            placeholder="What to do?"
          />
          <textarea
            v-model="description"
            class="add-description"
            placeholder="Add a description (optional)"
            rows="3"
          />
        </div>
        <div class="add-actions">
          <button
            class="btn btn--cancel"
            @click="cancel()"
          >
            Cancel
          </button>
          <button
            class="btn btn--confirm"
            :disabled="!title.trim()"
            @click="emit('submit', title, description)"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style
  scoped
  lang="scss"
>

.add-todo {
  .add-trigger {
    font-size:       0.9375rem;
    display:         flex;
    align-items:     center;
    justify-content: center;
    margin-bottom:   18px;
    padding:         var(--space-3);
    cursor:          pointer;
    transition:      all var(--transition-fast);
    color:           var(--theme-c-text-muted);
    border:          2px dashed var(--theme-c-border);
    border-radius:   99px;
    gap:             var(--space-2);

    svg {
      flex-shrink: 0;
      width:       18px;
      height:      18px;
    }

    &:hover {
      color:        var(--theme-c-accent);
      border-color: var(--theme-c-accent);
    }

    &--active {
      border-bottom-radius: 0;
    }
  }

  .add-form {
    display:            grid;
    overflow:           hidden;
    width:              100%;
    transition:         all var(--transition-base);
    opacity:            0;
    border:             1px solid var(--no-color);
    border-radius:      var(--radius-md);
    grid-template-rows: 0fr;

    &--visible {
      padding:            var(--space-3);
      transition:         all var(--transition-base);
      opacity:            1;
      border:             1px solid var(--theme-c-border);
      background-color:   var(--theme-c-card-bg);
      grid-template-rows: 1fr;
    }

    .add-form-content {
      min-height: 0;

      .add-todo-inputs {
        display:        flex;
        flex-direction: column;
        gap:            var(--space-2);
      }

      .add-actions {
        display:         flex;
        justify-content: flex-end;
        margin-top:      var(--space-3);
        gap:             var(--space-2);
      }

      .add-title,
      .add-description {
        font-size:  0.9375rem;
        width:      100%;
        padding:    var(--space-2) var(--space-3);
        transition: border-color var(--transition-fast);
        color:      var(--theme-c-text);
        border:     1px solid var(--theme-c-border);
        background: var(--theme-c-page-bg);

        &:focus {
          border-color: var(--theme-c-accent);
          outline:      none;
        }
      }

      .add-title {
        border-radius: 99px;
      }

      .add-description {
        min-height:    60px;
        margin-top:    var(--space-2);
        resize:        vertical;
        border-radius: var(--radius-lg);
      }

      .btn {
        font-size:     0.875rem;
        font-weight:   500;
        padding:       var(--space-2) var(--space-4);
        cursor:        pointer;
        transition:    all var(--transition-fast);
        border:        none;
        border-radius: 99px;

        &--cancel {
          color:      var(--theme-c-text-muted);
          background: transparent;

          &:hover {
            color:      var(--theme-c-text);
            background: var(--theme-c-border);
          }
        }

        &--confirm {
          color:      var(--md-sys-color-on-primary-container);
          background: var(--theme-c-accent);

          &:disabled {
            cursor:  not-allowed;
            opacity: 0.5;
          }

          &:hover:not(:disabled) {
            opacity: 0.9;
          }
        }
      }
    }
  }
}

</style>