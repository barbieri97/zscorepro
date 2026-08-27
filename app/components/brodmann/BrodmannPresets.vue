<script setup lang="ts">
import { BRODMANN_PRESETS } from '~/composables/useBrodmannAreas'
import type { BrodmannStore } from '~/composables/useBrodmannAreas'

const { store } = defineProps<{ store: BrodmannStore }>()
</script>

<template>
  <div>
    <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Conjuntos</p>
    <div class="flex flex-col gap-0.5">
      <button
        v-for="(preset, index) in BRODMANN_PRESETS"
        :key="preset.nome"
        type="button"
        class="flex items-baseline gap-2 rounded-r border-l-2 px-2 py-1.5 text-left text-sm transition-colors"
        :class="store.activePreset.value === index
          ? 'border-primary bg-primary/10 font-medium text-primary'
          : 'border-transparent hover:bg-elevated'"
        :aria-pressed="store.activePreset.value === index"
        @click="store.togglePreset(index)"
      >
        <span class="w-4 shrink-0 font-mono text-[11px] text-muted">{{ String(index + 1).padStart(2, '0') }}</span>
        <span>{{ preset.nome }}</span>
      </button>
    </div>
    <p class="mt-3 text-xs text-muted">Setas ← → percorrem os conjuntos. Esc limpa.</p>
  </div>
</template>
