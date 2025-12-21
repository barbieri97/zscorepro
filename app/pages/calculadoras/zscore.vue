<script setup lang="ts">
import { ref, computed } from "vue"

/* Inputs */
const score = ref<number | null>(null)
const mean = ref<number | null>(null)
const sd = ref<number | null>(null)
const invert = ref(false)
const toast = useToast()

/* Utilitário: função erro (aproximação) */
function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1
  x = Math.abs(x)

  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const t = 1 / (1 + p * x)
  const y =
    1 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) *
      t *
      Math.exp(-x * x))

  return sign * y
}

/* Z-score */
const rawZScore = computed<number | null>(() => {
  if (
    score.value === null ||
    mean.value === null ||
    sd.value === null ||
    sd.value === 0
  ) {
    return null
  }
  return (score.value - mean.value) / sd.value
})

const zScore = computed<number | null>(() => {
  if (rawZScore.value === null) return null
  return invert.value ? -rawZScore.value : rawZScore.value
})

/* Conversões */
const tScore = computed(() =>
  zScore.value !== null ? (50 + 10 * zScore.value).toFixed(0) : null
)

const weightedScore = computed(() =>
  zScore.value !== null ? (10 + 3 * zScore.value).toFixed(0) : null
)

const percentile = computed(() => {
  if (zScore.value === null) return null
  const p = 0.5 * (1 + erf(zScore.value / Math.sqrt(2)))
  return (p * 100).toFixed(1)
})

/* Copiar para área de transferência */
function copy(value: string | null, label?: string) {
  if (!value) return

  navigator.clipboard.writeText(value)

  toast.add({
    title: "Copiado para a área de transferência",
    description: label ? `${label}: ${value}` : value,
    icon: "i-heroicons-check-circle",
    color: "success"
  })
}
</script>

<template>
  <UContainer class="py-10 flex justify-center">
    <UCard class="w-full max-w-3xl">
      <!-- Header -->
      <template #header>
        <h2 class="text-lg font-semibold text-center">
          Calculadora de Z-score
        </h2>
      </template>

      <!-- Inputs -->
      <div class="grid gap-4 md:grid-cols-3 my-10">
        <UFormField label="Escore observado (X)">
          <UInput v-model.number="score" type="number" placeholder="Ex: 110" />
        </UFormField>

        <UFormField label="Média (μ)">
          <UInput v-model.number="mean" type="number" placeholder="Ex: 100" />
        </UFormField>

        <UFormField label="Desvio-padrão (σ)">
          <UInput v-model.number="sd" type="number" placeholder="Ex: 15" />
        </UFormField>

        <UTooltip
        text="Marque esta opção quando valores menores indicarem melhor desempenho (ex: tempo de reação, número de erros)."
        >
            <UFormField>
                <UCheckbox
                v-model="invert"
                label="inverter Z-score"
                />
            </UFormField>
        </UTooltip>

      </div>

      <!-- Resultados -->
      <div v-if="zScore !== null" class="space-y-4">
        <!-- Z -->
        <div class="flex items-center justify-between p-3 border rounded">
          <div>
            <p class="text-sm text-muted">Z-score</p>
            <p class="font-semibold text-lg">
              {{ zScore.toFixed(2) }}
            </p>
          </div>
          <UButton
            icon="i-heroicons-clipboard"
            variant="ghost"
            @click="copy(zScore.toFixed(2), 'z-score')"
          />
        </div>

        <!-- T -->
        <div class="flex items-center justify-between p-3 border rounded">
          <div>
            <p class="text-sm text-muted">T-score</p>
            <p class="font-semibold text-lg">
              {{ tScore }}
            </p>
          </div>
          <UButton
            icon="i-heroicons-clipboard"
            variant="ghost"
            @click="copy(tScore, 't-score')"
          />
        </div>

        <!-- Ponto ponderado -->
        <div class="flex items-center justify-between p-3 border rounded">
          <div>
            <p class="text-sm text-muted">Ponto ponderado</p>
            <p class="font-semibold text-lg">
              {{ weightedScore }}
            </p>
          </div>
          <UButton
            icon="i-heroicons-clipboard"
            variant="ghost"
            @click="copy(weightedScore, 'Ponto ponderado')"
          />
        </div>

        <!-- Percentil -->
        <div class="flex items-center justify-between p-3 border rounded">
          <div>
            <p class="text-sm text-muted">Percentil</p>
            <p class="font-semibold text-lg">
              {{ percentile }}%
            </p>
          </div>
          <UButton
            icon="i-heroicons-clipboard"
            variant="ghost"
            @click="copy(percentile + '%', 'Percentil')"
          />
        </div>
      </div>

      <!-- Footer -->
      <template class="flex align-center" #footer>
         <div class="flex justify-center">

             <UBadge 
             label="Conversões baseadas na distribuição normal padrão. Não usar os resultados para amostras não normativas"
             variant="soft"
             color="warning"
             icon="i-heroicons-exclamation-triangle"
             class="text-center whitespace-normal"
             />
        </div>
      </template>
    </UCard>
  </UContainer>
</template>
