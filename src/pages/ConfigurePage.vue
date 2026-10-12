<script setup>
import ConfiguratorPanel from '../components/ConfiguratorPanel.vue'
import { useHashScroll } from '../composables/useHashScroll.js'
import { useData } from '../composables/useData.js'
useHashScroll()
const { site } = useData()
</script>

<template>
  <div class="cp">
    <div class="cp-top wrap">
      <p class="notice">{{ site.notice }}</p>
    </div>
    <ConfiguratorPanel sync-url />
  </div>
</template>

<style scoped>
.cp { padding-top: var(--header); }
.cp-top { padding-block: .7rem; }
.cp-top .notice { margin: 0; max-width: none; }
</style>
