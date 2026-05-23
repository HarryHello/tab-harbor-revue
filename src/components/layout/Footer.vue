<script
  setup
  lang="ts"
>
import { GridIcon } from '@/components/icons';
import { useTabsStore } from '@/stores';
import { computed } from 'vue';

const tabsStore = useTabsStore();

const tabCount = computed(() => tabsStore.totalTabCount);
</script>

<template>
  <footer class="footer">
    <div class="footer-stats">
      <span class="footer-stat">
        <GridIcon :size="16" />
        {{ tabCount }} tabs
      </span>
    </div>
  </footer>
</template>

<style
  scoped
  lang="scss"
>
.footer {
  font-size:       0.8125rem;
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  padding:         var(--space-4) var(--space-6);
  color:           var(--md-sys-color-on-surface-variant);
  border-top:      1px solid var(--md-sys-color-outline-variant);
}

.footer-stats {
  display: flex;
  gap:     var(--space-4);
}

.footer-stat {
  display:     flex;
  align-items: center;
  gap:         var(--space-1);
}

.footer-stat svg {
  width:  16px;
  height: 16px;
}

.footer-info {
  color: var(--theme-c-text-muted);
}
</style>
