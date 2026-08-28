<script setup lang="ts">
import type { BrodmannStore } from '~/composables/useBrodmannAreas'
import BrodmannPresets from './BrodmannPresets.vue'
import BrodmannCustomSet from './BrodmannCustomSet.vue'
import BrodmannAppearance from './BrodmannAppearance.vue'
import BrodmannAreaList from './BrodmannAreaList.vue'

defineProps<{ store: BrodmannStore }>()
</script>

<template>
  <aside class="space-y-6">
    <BrodmannPresets :store="store" />
    <div class="border-t border-default pt-5">
      <BrodmannCustomSet :store="store" />
    </div>
    <div class="border-t border-default pt-5">
      <BrodmannAppearance :store="store" />
    </div>
    <div class="border-t border-default pt-5">
      <BrodmannAreaList :store="store" />
    </div>
  </aside>
</template>
