<script
  setup
  lang="ts"
>
import OpenTabsSection from '@/components/tabs/OpenTabsSection.vue';
import { ref } from 'vue';
import DashboardHeader from './DashboardHeader.vue';

const searchQuery = ref('');
</script>

<template>
  <div class="dashboard">
    <DashboardHeader v-model:search-query="searchQuery" />
    <OpenTabsSection :search-query="searchQuery" />
  </div>
</template>

<style
  scoped
  lang="scss"
>

.dashboard {
  display:        flex;
  flex-direction: column;
  gap:            var(--space-8);
}

@media screen and (min-width: 920px) {
  .dashboard {
    display:         flex;
    align-items:     flex-start;
    flex-direction:  row-reverse;
    justify-content: space-between;
    gap:             64px;

    .dashboard-header {
      position:    sticky;
      top:         calc(64px + var(--space-6)); /* GroupNav height + spacing */
      flex-shrink: 0;
      width:       50%;
    }

    .open-tabs-section {
      width: 45%;
    }
  }

}
</style>
