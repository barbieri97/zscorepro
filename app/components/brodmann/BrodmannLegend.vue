<script setup lang="ts">
import type { BrodmannStore } from '~/composables/useBrodmannAreas'

const { store } = defineProps<{ store: BrodmannStore }>()
</script>

<template>
  <div class="mt-6 min-h-5">
    <template v-if="store.legendData.value.mode === 'preset'">
      <h2 class="font-serif text-lg">{{ store.legendData.value.title }}</h2>
      <p class="mb-3 max-w-[78ch] text-sm text-muted">{{ store.legendData.value.note }}</p>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="chip in store.legendData.value.chips"
          :key="chip.label"
          class="flex items-center gap-2 rounded border border-default bg-elevated py-1 pl-1.5 pr-2.5 text-sm"
        >
          <span class="h-3.5 w-3.5 rounded-sm ring-1 ring-inset ring-black/15" :style="{ background: chip.color }" />
          <span>{{ chip.label }}</span>
          <span class="font-mono text-xs text-muted">{{ chip.list }}</span>
        </span>
      </div>
    </template>

    <template v-else-if="store.legendData.value.mode === 'selection'">
      <div class="flex flex-wrap gap-2">
        <span
          v-for="chip in store.legendData.value.chips"
          :key="chip.label"
          class="flex items-center gap-2 rounded border border-default bg-elevated py-1 pl-1.5 pr-2.5 text-sm"
        >
          <span class="h-3.5 w-3.5 rounded-sm ring-1 ring-inset ring-black/15" :style="{ background: chip.color }" />
          <span class="font-mono">{{ chip.label }}</span>
          <span class="text-muted">{{ chip.list }}</span>
        </span>
      </div>
    </template>

    <p v-else class="text-sm text-muted">
      Nenhuma área destacada. Escolha um conjunto ou clique diretamente sobre a figura.
    </p>
  </div>
</template>
