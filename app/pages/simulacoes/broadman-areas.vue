<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useBrodmannAreas } from '~/composables/useBrodmannAreas'
import BrodmannHeader from '~/components/brodmann/BrodmannHeader.vue'
import BrodmannSidebar from '~/components/brodmann/BrodmannSidebar.vue'
import BrodmannFigure from '~/components/brodmann/BrodmannFigure.vue'
import BrodmannLegend from '~/components/brodmann/BrodmannLegend.vue'
import BrodmannTooltip from '~/components/brodmann/BrodmannTooltip.vue'

const store = useBrodmannAreas()

useHead({
  title: 'Áreas de Brodmann – Atlas Interativo | ZscorePro',
  meta: [
    {
      name: 'description',
      content:
        'Atlas interativo das áreas de Brodmann: selecione áreas numericamente, aplique conjuntos prontos (linguagem, motor, visual e mais) e exporte as pranchas em SVG ou PNG.',
    },
  ],
})

function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  if (target?.matches?.('input,textarea')) return

  if (event.key === 'Escape') {
    if (store.lectureMode.value) store.toggleLectureMode(false)
    else store.clearSelection()
  } else if (event.key === 'ArrowRight') {
    store.cyclePreset(1)
  } else if (event.key === 'ArrowLeft') {
    store.cyclePreset(-1)
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <UContainer class="py-10">
    <UButton
      v-if="store.lectureMode.value"
      class="fixed right-4 top-4 z-40"
      color="primary"
      @click="store.toggleLectureMode(false)"
    >
      Sair do modo aula (Esc)
    </UButton>

    <BrodmannHeader v-if="!store.lectureMode.value" :store="store" class="mb-8" />

    <div class="grid gap-8" :class="store.lectureMode.value ? 'grid-cols-1' : 'lg:grid-cols-[300px_minmax(0,1fr)]'">
      <BrodmannSidebar v-if="!store.lectureMode.value" :store="store" />

      <section>
        <div class="grid gap-6" :class="store.lectureMode.value ? 'md:grid-cols-2' : 'sm:grid-cols-2'">
          <BrodmannFigure
            v-if="store.showLateral.value"
            view="lateral"
            title="Prancha I"
            subtitle="superfície lateral"
            :store="store"
          />
          <BrodmannFigure
            v-if="store.showMedial.value"
            view="medial"
            title="Prancha II"
            subtitle="superfície medial"
            :store="store"
          />
        </div>

        <BrodmannLegend :store="store" />
      </section>
    </div>

    <BrodmannTooltip :store="store" />
  </UContainer>
</template>
