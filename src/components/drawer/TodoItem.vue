<script setup lang="ts">
import { ref } from 'vue';
import type { Todo } from '@/types';
import { useTodosStore } from '@/stores';
import Checkbox from '@/components/common/Checkbox.vue';
import { DeleteIcon, PinIcon } from '@/components/icons';

const props = defineProps<{
  item: Todo
}>();

const todosStore = useTodosStore();
const isEditing = ref(false);
const editTitle = ref(props.item.title);
const editDescription = ref(props.item.description);

async function toggle() {
  await todosStore.toggleComplete(props.item.id);
}

async function remove(e?: Event) {
  e?.stopPropagation();
  await todosStore.remove(props.item.id);
}

async function moveToFront(e?: Event) {
  e?.stopPropagation();
  const index = todosStore.items.findIndex(i => i.id === props.item.id);
  if (index === -1) return;

  const item = todosStore.items[index];
  // 从当前位置移除
  todosStore.items.splice(index, 1);

  // 找到同状态的第一个任务位置
  let insertIndex = 0;
  for (let i = 0; i < todosStore.items.length; i++) {
    if (todosStore.items[i].completed === item.completed) {
      insertIndex = i;
      break;
    }
  }

  // 插入到同状态任务的开头
  todosStore.items.splice(insertIndex, 0, item);
  await todosStore.save();
}

function startEdit(e?: Event) {
  if (isEditing.value) return;
  e?.stopPropagation();
  isEditing.value = true;
  editTitle.value = props.item.title;
  editDescription.value = props.item.description;
}

async function saveEdit() {
  if (!editTitle.value.trim()) return;

  // 更新 todo
  const item = todosStore.items.find(i => i.id === props.item.id);
  if (item) {
    item.title = editTitle.value.trim();
    item.description = editDescription.value.trim();
    await todosStore.save();
  }

  isEditing.value = false;
}

function cancelEdit() {
  isEditing.value = false;
  editTitle.value = props.item.title;
  editDescription.value = props.item.description;
}
</script>

<template>
  <div class="todo-item" :class="{ 'todo-item--editing': isEditing }" @click="startEdit">
    <Checkbox :model-value="item.completed" @update:model-value="toggle" @click.stop />

    <!-- 查看模式 -->
    <div v-if="!isEditing" class="todo-item-content">
      <span class="todo-item-title">{{ item.title }}</span>
      <span v-if="item.description" class="todo-item-description">{{ item.description }}</span>
    </div>

    <!-- 编辑模式 -->
    <div v-else class="todo-item-edit" @click.stop>
      <input
        v-model="editTitle"
        type="text"
        class="edit-input"
        placeholder="Todo title"
        @keyup.enter="saveEdit"
        @keyup.esc="cancelEdit"
      />
      <textarea
        v-model="editDescription"
        class="edit-textarea"
        placeholder="Description (optional)"
        rows="2"
        @keyup.esc="cancelEdit"
      />
      <div class="edit-actions">
        <button class="edit-btn edit-btn--cancel" @click="cancelEdit">Cancel</button>
        <button class="edit-btn edit-btn--save" @click="saveEdit">Save</button>
      </div>
    </div>

    <button class="todo-item-action todo-item-action--pin" title="Move to front" @click="moveToFront">
      <PinIcon :size="16" />
    </button>

    <button class="todo-item-action todo-item-action--delete" title="Delete" @click="remove">
      <DeleteIcon :size="16" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.todo-item {
  position: relative;
  display: flex;
  align-items: center;
  height: 60px;
  padding: 8px 48px 8px 20px;
  cursor: pointer;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
  border: 1px solid var(--no-color);
  border-radius: 30px;
  background: var(--theme-c-card-bg);
  gap: var(--space-3);

  &--editing {
    align-items: flex-start;
    height: auto;
    padding: var(--space-3);
    cursor: default;
    border-radius: var(--radius-md);
  }
}

.todo-item:hover {
  border-color: var(--theme-c-accent);
  box-shadow: var(--shadow-sm);
}

.todo-item-content {
  flex: 1;
  min-width: 0;
}

.todo-item-title {
  font-size: 0.9375rem;
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--theme-c-text);
}

.todo-item-description {
  font-size: 0.75rem;
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--theme-c-text-muted);
}

.todo-item-action {
  position: absolute;
  top: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  transition: all var(--transition-fast);
  transform: translateY(-50%);
  opacity: 0;
  color: var(--theme-c-text-muted);
  border: none;
  border-radius: 50%;
  background: transparent;
}

.todo-item-action--pin {
  right: 54px;
}

.todo-item-action--pin:hover {
  color: var(--theme-c-text);
  background: color-mix(in srgb, var(--theme-c-text) 25%, transparent);
}

.todo-item-action--delete {
  right: 18px;
}

.todo-item:hover .todo-item-action {
  opacity: 1;
}

.todo-item-action--delete:hover {
  color: var(--theme-c-danger);
  background: color-mix(in srgb, var(--theme-c-danger) 25%, transparent);
}

.todo-item-action svg {
  width: 16px;
  height: 16px;
}

// 编辑模式样式
.todo-item-edit {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-2);
}

.edit-input,
.edit-textarea {
  font-size: 0.9375rem;
  width: 100%;
  padding: var(--space-2) var(--space-3);
  transition: border-color var(--transition-fast);
  color: var(--theme-c-text);
  border: 1px solid var(--theme-c-border);
  border-radius: var(--radius-sm);
  background: var(--theme-c-page-bg);

  &:focus {
    border-color: var(--theme-c-accent);
    outline: none;
  }
}

.edit-textarea {
  font-family: inherit;
  min-height: 40px;
  resize: vertical;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-1);
  gap: var(--space-2);
}

.edit-btn {
  font-size: 0.875rem;
  font-weight: 500;
  padding: var(--space-2) var(--space-4);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  border-radius: 99px;
}

.edit-btn--cancel {
  color: var(--theme-c-text-muted);
  background: transparent;

  &:hover {
    color: var(--theme-c-text);
    background: var(--theme-c-border);
  }
}

.edit-btn--save {
  color: var(--md-sys-color-on-primary-container);
  background: var(--theme-c-accent);

  &:hover {
    opacity: 0.9;
  }
}
</style>
