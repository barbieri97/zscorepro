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

const classification = computed<string | null>(() => {
  if (zScore.value === null) return null

  const z = zScore.value

  if (z < -2) return "Inferior"
  if (z < -1) return "Limítrofe"
  if (z < -0.5) return "Média inferior"
  if (z <= 0.5) return "Média"
  if (z <= 1) return "Média superior"
  if (z <= 2) return "Superior"
  return "Muito superior"
})

const classificationBgClass = computed(() => {
  if (!classification.value) return ""

  switch (classification.value) {
    case "Inferior":
      return "bg-red-200 dark:bg-red-950/20"
    case "Limítrofe":
      return "bg-orange-200 dark:bg-orange-950/20"
    case "Média inferior":
      return "bg-amber-200 dark:bg-amber-950/20"
    case "Média":
      return "bg-green-200 dark:bg-green-950/20"
    case "Média superior":
      return "bg-sky-200 dark:bg-sky-950/20"
    case "Superior":
      return "bg-blue-200 dark:bg-blue-950/20"
    case "Muito superior":
      return "bg-indigo-200 dark:bg-indigo-950/20"
    default:
      return ""
  }
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

        <UFormField class="flex items-center gap-2 flex-wrap">
          <div class="flex items-center gap-2 flex-wrap">

            <UCheckbox
            v-model="invert"
            label="inverter Z-score"
            />
            <UTooltip
            text="Marque esta opção quando valores menores indicarem melhor desempenho (ex: tempo de reação, número de erros)."
            >
            <UIcon name="i-heroicons-information-circle" class="text-primary" />
          </UTooltip>
        </div>
            </UFormField>

      </div>

      <!-- Resultados -->
      <div v-if="zScore !== null" class="space-y-4">
        <!-- Z -->
         <UCard variant="soft">
           <div class="flex items-center justify-between">
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
        </UCard>

        <!-- T -->
         <UCard variant="soft">

           <div class="flex items-center justify-between">
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
        </UCard>

        <!-- Ponto ponderado -->
         <UCard variant="soft">

           <div class="flex items-center justify-between">
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
      </UCard>

        <!-- Percentil -->
        <UCard variant="soft">
           <div class="flex items-center justify-between">

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
        </UCard>
        <UCard :class="classificationBgClass" variant="soft">
           <div class="flex items-center justify-between">
           <div>
             <p class="text-sm text-muted">Classificação</p>
             <p class="font-semibold text-lg">
               {{ classification }}
             </p>
           </div>
         
           <UButton
             icon="i-heroicons-clipboard"
             variant="ghost"
             @click="copy(classification, 'Classificação')"
           />
          </div>
        </UCard>
      </div>

      <!-- Footer -->
      <template class="flex align-center" #footer>
         <div class="flex justify-center">

             <UBadge 
             label="Conversões válidas apenas para distribuições normais."
             variant="soft"
             color="warning"
             icon="i-heroicons-exclamation-triangle"
             />
        </div>
      </template>
    </UCard>
  </UContainer>
</template>
