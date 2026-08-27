<script setup lang="ts">
import type { BrodmannStore } from '~/composables/useBrodmannAreas'

const { store } = defineProps<{ store: BrodmannStore }>()

function onToggle(ba: string) {
  store.toggleArea(ba)
}
</script>

<template>
  <div>
    <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Áreas</p>
    <UInput
      v-model="store.search.value"
      type="search"
      placeholder="Buscar por número ou nome"
      aria-label="Buscar área"
      class="mb-3 w-full"
    />

    <div class="max-h-[420px] space-y-3.5 overflow-y-auto pr-1">
      <div v-for="group in store.groupedAreas.value" :key="group.lobo">
        <h3 class="mb-1 border-b border-dotted border-default pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
          {{ group.lobo }}
        </h3>
        <label
          v-for="item in group.items"
          :key="item.ba"
          class="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 hover:bg-elevated"
          @mouseenter="store.setPreview(item.ba)"
          @mouseleave="store.setPreview(null)"
        >
          <UCheckbox :model-value="store.selection.has(item.ba)" @update:model-value="onToggle(item.ba)" />
          <span class="w-6 shrink-0 text-right font-mono text-xs font-semibold">{{ item.ba }}</span>
          <span class="flex-1 text-xs leading-tight">{{ item.nome }}</span>
          <span class="shrink-0 font-mono text-[9.5px] tracking-wide text-muted">
            {{ item.views.includes('lateral') ? 'L' : '' }}{{ item.views.includes('medial') ? 'M' : '' }}
          </span>
        </label>
      </div>
    </div>

    <p class="mt-2.5 text-xs text-muted">
      {{
        store.selectionCount.value === 0
          ? 'Nenhuma área selecionada'
          : store.selectionCount.value === 1
            ? '1 área selecionada'
            : `${store.selectionCount.value} áreas selecionadas`
      }}
    </p>
  </div>
</template>
