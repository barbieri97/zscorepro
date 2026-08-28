<script setup lang="ts">
import { BRODMANN_PALETTE } from '~/composables/useBrodmannAreas'
import type { BrodmannStore } from '~/composables/useBrodmannAreas'

const { store } = defineProps<{ store: BrodmannStore }>()

// Refs extraídas do store: o v-model escreve direto na ref, sem mutar o prop.
const { fadeUnselected, showLateral, showMedial, includeLegend } = store
</script>

<template>
  <div>
    <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Aparência</p>

    <div class="mb-3 flex gap-2">
      <button
        v-for="color in BRODMANN_PALETTE"
        :key="color"
        type="button"
        class="h-6 w-6 rounded-full ring-inset transition-shadow"
        :class="store.activeColor.value === color ? 'ring-2 ring-neutral-900 dark:ring-white' : 'ring-1 ring-black/15'"
        :style="{ background: color }"
        :aria-pressed="store.activeColor.value === color"
        :aria-label="`Cor de destaque ${color}`"
        @click="store.setActiveColor(color)"
      />
    </div>

    <label class="flex items-center gap-2 py-1 text-sm">
      <UCheckbox v-model="fadeUnselected" />
      Esmaecer as áreas não selecionadas
    </label>
    <label class="flex items-center gap-2 py-1 text-sm">
      <UCheckbox v-model="showLateral" />
      Mostrar vista lateral
    </label>
    <label class="flex items-center gap-2 py-1 text-sm">
      <UCheckbox v-model="showMedial" />
      Mostrar vista medial
    </label>
    <label class="flex items-center gap-2 py-1 text-sm">
      <UCheckbox v-model="includeLegend" />
      Incluir a legenda na imagem exportada
    </label>
  </div>
</template>
