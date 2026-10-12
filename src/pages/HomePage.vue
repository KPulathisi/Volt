<script setup>
import VehicleHero from '../components/VehicleHero.vue'
import VehicleShowcase from '../components/VehicleShowcase.vue'
import ConfiguratorPanel from '../components/ConfiguratorPanel.vue'
import DesignStory from '../components/DesignStory.vue'
import FilmBand from '../components/FilmBand.vue'
import PerformanceSpecs from '../components/PerformanceSpecs.vue'
import EnergySection from '../components/EnergySection.vue'
import ModelComparison from '../components/ModelComparison.vue'
import DesignGallery from '../components/DesignGallery.vue'
import FinalCTA from '../components/FinalCTA.vue'
</script>

<template>
  <div>
    <VehicleHero />
    <VehicleShowcase />
    <section class="home-cfg" aria-label="Configurator preview"><ConfiguratorPanel compact /></section>
    <DesignStory />
    <FilmBand />
    <PerformanceSpecs />
    <EnergySection />
    <ModelComparison />
    <DesignGallery />
    <FinalCTA />
  </div>
</template>

<style scoped>
.home-cfg { border-bottom: 1px solid var(--line); }
</style>
