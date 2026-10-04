<script setup lang="ts">
import type { BrodmannStore } from '~/composables/useBrodmannAreas'

const { store } = defineProps<{ store: BrodmannStore }>()
</script>

<template>
  <div
    v-if="store.tooltip.visible"
    role="status"
    aria-live="polite"
    class="pointer-events-none fixed z-50 max-w-[260px] rounded bg-inverted px-2.5 py-1.5 text-xs leading-snug text-inverted shadow-lg"
    :style="{ left: `${store.tooltip.x + 14}px`, top: `${store.tooltip.y + 16}px` }"
  >
    <template v-if="store.tooltip.ba === 'X'">
      {{ store.tooltip.nome }}
    </template>
    <template v-else>
      <b class="font-mono font-semibold">{{ store.tooltip.ba }}</b> — {{ store.tooltip.nome }}
    </template>
  </div>
</template>
