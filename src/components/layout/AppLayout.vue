<script
  setup
  lang="ts"
>
import Footer from './Footer.vue';
import GroupNav from './GroupNav.vue';
</script>

<template>
  <div class="app-layout">
    <GroupNav />
    <main class="app-main">
      <div class="app-content">
        <slot />
      </div>
    </main>
    <Footer />
  </div>
</template>

<style
  scoped
  lang="scss"
>
.app-layout {
  display:        flex;
  flex-direction: column;
  min-height:     100vh;
  padding:        0 80px;
  margin:         0 auto;
}

.app-main {
  flex:        1;
  padding:     var(--space-6);
  padding-top: calc(64px + var(--space-6));
}

.app-content {
  margin:    0 24px;
  animation: fadeUp var(--transition-slow) ease-out;
}
</style>
