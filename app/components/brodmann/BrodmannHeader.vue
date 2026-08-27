<script setup lang="ts">
import type { BrodmannStore } from '~/composables/useBrodmannAreas'

const { store } = defineProps<{ store: BrodmannStore }>()
</script>

<template>
  <div class="flex flex-col gap-4 border-b border-default pb-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 class="font-serif text-2xl text-primary sm:text-3xl">Áreas de Brodmann</h1>
      <p class="mt-1 max-w-2xl text-sm text-muted">
        Mapa citoarquitetônico do hemisfério esquerdo. Clique em uma área na figura, marque-a na
        lista ou aplique um conjunto pronto.
      </p>
    </div>
    <div class="flex shrink-0 gap-2">
      <UButton variant="outline" color="neutral" @click="store.clearSelection()">
        Limpar seleção
      </UButton>
      <UButton color="primary" @click="store.toggleLectureMode(true)">
        Modo aula
      </UButton>
    </div>
  </div>
</template>
