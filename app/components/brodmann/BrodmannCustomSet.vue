<script setup lang="ts">
import { computed } from 'vue'
import { BRODMANN_PALETTE } from '~/composables/useBrodmannAreas'
import type { BrodmannBuilderStep, BrodmannStore } from '~/composables/useBrodmannAreas'

const { store } = defineProps<{ store: BrodmannStore }>()

const STEP_META: Partial<Record<BrodmannBuilderStep, { index: number, title: string }>> = {
  nome: { index: 1, title: 'nome do grupo' },
  cor: { index: 2, title: 'cor do grupo' },
  regioes: { index: 3, title: 'regiões do grupo' },
}

const { draftLabel } = store
const step = computed(() => STEP_META[store.builderStep.value])
const draftCount = computed(() => store.draftAreas.size)

function onCustomColor(event: Event) {
  store.setDraftColor((event.target as HTMLInputElement).value)
}
</script>

<template>
  <div>
    <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Meu conjunto</p>

    <ul v-if="store.customGroups.value.length" class="mb-3 flex flex-col gap-0.5">
      <li
        v-for="grupo in store.customGroups.value"
        :key="grupo.id"
        class="flex items-start gap-2 rounded px-1.5 py-1 hover:bg-elevated"
      >
        <span
          class="mt-1 h-3.5 w-3.5 shrink-0 rounded-sm ring-1 ring-inset ring-black/15"
          :style="{ background: grupo.cor }"
        />
        <span class="flex-1 leading-tight">
          <span class="block text-xs font-medium">{{ grupo.rotulo }}</span>
          <span class="block font-mono text-[10px] text-muted">{{ grupo.areas.join(' · ') }}</span>
        </span>
        <UButton
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-heroicons-x-mark"
          :aria-label="`Remover o grupo ${grupo.rotulo}`"
          @click="store.removeCustomGroup(grupo.id)"
        />
      </li>
    </ul>

    <div v-if="store.builderStep.value === 'idle'">
      <div class="flex flex-wrap gap-2">
        <UButton size="xs" color="primary" icon="i-heroicons-plus" @click="store.startCustomGroup()">
          Novo grupo
        </UButton>
        <UButton
          v-if="store.customGroups.value.length"
          size="xs"
          variant="outline"
          color="neutral"
          @click="store.clearCustomSet()"
        >
          Limpar conjunto
        </UButton>
      </div>
      <p v-if="!store.customGroups.value.length" class="mt-2 text-xs text-muted">
        Monte o seu próprio conjunto: cada grupo recebe um nome, uma cor e as áreas que você escolher.
      </p>
    </div>

    <div v-else class="rounded border border-default p-2.5">
      <p class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
        Passo {{ step?.index }} de 3 — {{ step?.title }}
      </p>

      <template v-if="store.builderStep.value === 'nome'">
        <UInput
          v-model="draftLabel"
          size="sm"
          class="w-full"
          placeholder="Ex.: Rede fronto-parietal"
          aria-label="Nome do grupo"
          @keydown.enter="store.confirmDraftLabel()"
        />
        <div class="mt-2 flex flex-wrap gap-2">
          <UButton
            size="xs"
            color="primary"
            :disabled="!draftLabel.trim()"
            @click="store.confirmDraftLabel()"
          >
            Continuar
          </UButton>
          <UButton size="xs" variant="ghost" color="neutral" @click="store.cancelCustomGroup()">
            Cancelar
          </UButton>
        </div>
      </template>

      <template v-else-if="store.builderStep.value === 'cor'">
        <div class="mb-2.5 flex flex-wrap items-center gap-2">
          <button
            v-for="color in BRODMANN_PALETTE"
            :key="color"
            type="button"
            class="h-6 w-6 rounded-full ring-inset transition-shadow"
            :class="store.draftColor.value === color ? 'ring-2 ring-neutral-900 dark:ring-white' : 'ring-1 ring-black/15'"
            :style="{ background: color }"
            :aria-pressed="store.draftColor.value === color"
            :aria-label="`Cor ${color} para o grupo`"
            @click="store.setDraftColor(color)"
          />
          <input
            type="color"
            :value="store.draftColor.value"
            class="h-6 w-6 cursor-pointer rounded-full border border-default bg-transparent p-0"
            aria-label="Escolher outra cor"
            @input="onCustomColor"
          >
        </div>
        <div class="flex flex-wrap gap-2">
          <UButton size="xs" color="primary" @click="store.confirmDraftColor()">
            Continuar
          </UButton>
          <UButton size="xs" variant="ghost" color="neutral" @click="store.goToBuilderStep('nome')">
            Voltar
          </UButton>
        </div>
      </template>

      <template v-else>
        <p class="mb-2 text-xs leading-snug text-muted">
          Clique nas áreas na figura ou marque-as na lista para incluí-las em
          <span class="font-semibold" :style="{ color: store.draftColor.value }">{{ draftLabel }}</span>.
        </p>
        <p class="mb-2 text-xs">
          {{ draftCount === 1 ? '1 área no grupo' : `${draftCount} áreas no grupo` }}
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton size="xs" color="primary" :disabled="draftCount === 0" @click="store.finishCustomGroup()">
            Finalizar grupo
          </UButton>
          <UButton size="xs" variant="ghost" color="neutral" @click="store.goToBuilderStep('cor')">
            Voltar
          </UButton>
          <UButton size="xs" variant="ghost" color="neutral" @click="store.cancelCustomGroup()">
            Cancelar
          </UButton>
        </div>
      </template>
    </div>
  </div>
</template>
