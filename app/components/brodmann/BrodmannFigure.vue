<script setup lang="ts">
import { ref } from 'vue'
import { exportBrodmannPng, exportBrodmannSvg } from '~/composables/useBrodmannExport'
import type { BrodmannStore, BrodmannView } from '~/composables/useBrodmannAreas'
import BrodmannLateralSvg from './BrodmannLateralSvg.vue'
import BrodmannMedialSvg from './BrodmannMedialSvg.vue'

const props = defineProps<{
  view: BrodmannView
  title: string
  subtitle: string
  store: BrodmannStore
}>()

const { store } = props

const svgComponent = ref<InstanceType<typeof BrodmannLateralSvg> | InstanceType<typeof BrodmannMedialSvg> | null>(null)

function handleExport(kind: 'svg' | 'png') {
  const el = svgComponent.value?.svgEl
  if (!el) return
  const filename = `brodmann-${props.view}.${kind}`
  if (kind === 'svg') exportBrodmannSvg(el, filename)
  else exportBrodmannPng(el, filename)
}
</script>

<template>
  <figure class="rounded-lg border border-neutral-200 bg-white p-4">
    <component
      :is="view === 'lateral' ? BrodmannLateralSvg : BrodmannMedialSvg"
      ref="svgComponent"
      :store="store"
      class="block w-full h-auto"
    />
    <figcaption class="mt-3 flex items-baseline justify-between gap-3 border-t border-neutral-200 pt-2">
      <span class="font-serif text-sm text-neutral-600">
        {{ title }} <em class="italic text-neutral-400">— {{ subtitle }}</em>
      </span>
      <span class="flex gap-1.5">
        <UButton size="xs" variant="outline" color="neutral" @click="handleExport('svg')">
          SVG
        </UButton>
        <UButton size="xs" variant="outline" color="neutral" @click="handleExport('png')">
          PNG
        </UButton>
      </span>
    </figcaption>
  </figure>
</template>
