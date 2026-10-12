<script setup>
import GridField from './GridField.vue'
defineProps({ label: String, title: String, intro: String })
</script>

<template>
  <header class="ph">
    <GridField :pulses="4" />
    <div class="wrap ph-in">
      <span class="label">{{ label }}</span>
      <h1 v-split.now>{{ title }}</h1>
      <p v-if="intro" class="lede" v-fade>{{ intro }}</p>
      <slot />
    </div>
  </header>
</template>

<style scoped>
.ph { position: relative; padding: calc(var(--header) + clamp(4rem, 10vw, 8rem)) 0 clamp(3rem, 6vw, 5rem); overflow: hidden; border-bottom: 1px solid var(--line); }
.ph-in { position: relative; }
.ph h1 { font-size: var(--step-5); max-width: 14ch; }
</style>
