<script setup lang="ts">
import { ref, computed } from "vue"
import { useToast } from "#imports"

const toast = useToast()

/* Inputs */
const birthDate = ref<string>("")
const referenceDate = ref<string>(new Date().toISOString().substr(0, 10))

// Prematuridade
const isPremature = ref<boolean>(false)
const gestationalWeeks = ref<number | undefined>()
const gestationalDays = ref<number | undefined>()

function calculateAgeDiff(birth: Date, refDate: Date) {
  if (birth > refDate) return null
  
  let years = refDate.getFullYear() - birth.getFullYear()
  let months = refDate.getMonth() - birth.getMonth()
  let days = refDate.getDate() - birth.getDate()

  if (days < 0) {
    months -= 1
    days += new Date(refDate.getFullYear(), refDate.getMonth(), 0).getDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }
  const totalMonths = (years * 12) + months
  return { years, months, days, totalMonths }
}

/* Cálculo da idade cronológica */
const age = computed(() => {
  if (!birthDate.value) return null
  return calculateAgeDiff(new Date(birthDate.value), new Date(referenceDate.value))
})

/* Cálculo da idade corrigida */
const correctedAge = computed(() => {
  if (!isPremature.value || !birthDate.value || !gestationalWeeks.value) return null

  // Gestação a termo é 40 semanas (280 dias)
  const gestDays = (gestationalWeeks.value * 7) + (gestationalDays.value || 0)
  const prematurityDays = 280 - gestDays

  // Se for maior ou igual a 40 semanas, não há correção
  if (prematurityDays <= 0) return null 

  const correctedBirth = new Date(birthDate.value)
  correctedBirth.setDate(correctedBirth.getDate() + prematurityDays)
  
  const refDate = new Date(referenceDate.value)
  if (correctedBirth > refDate) return { isNegative: true }

  return calculateAgeDiff(correctedBirth, refDate)
})

/* Copiar para área de transferência */
function copyAge(label: string, value: string) {
  navigator.clipboard.writeText(value)
  toast.add({
    title: "Copiado para a área de transferência",
    description: `${label}: ${value}`,
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
          Calculadora de Idade
        </h2>
      </template>

      <!-- Inputs -->
      <div class="grid gap-4 md:grid-cols-2 mt-10 mb-6">
        <UFormField label="Data de nascimento">
          <UInput
            v-model="birthDate"
            type="date"
            placeholder="AAAA-MM-DD"
          />
        </UFormField>

        <UFormField label="Data de referência (opcional)">
          <UInput
            v-model="referenceDate"
            type="date"
            placeholder="AAAA-MM-DD"
          />
        </UFormField>
      </div>

      <!-- Prematuridade -->
      <div class="mb-10 p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-800/50">
        <UCheckbox 
          v-model="isPremature" 
          label="Criança nasceu prematura? (antes de 37 semanas)" 
          name="isPremature"
        />
        
        <div v-if="isPremature" class="grid gap-4 md:grid-cols-2 mt-4">
          <UFormField label="Semanas gestacionais ao nascer">
            <UInput
              v-model="gestationalWeeks"
              type="number"
              min="20"
              max="40"
              placeholder="Ex: 32"
            />
          </UFormField>
          <UFormField label="Dias gestacionais (opcional)">
            <UInput
              v-model="gestationalDays"
              type="number"
              min="0"
              max="6"
              placeholder="Ex: 4"
            />
          </UFormField>
        </div>
      </div>

      <!-- Resultados -->
      <div v-if="age" class="space-y-4">
        <!-- Cronológica -->
        <div>
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Idade Cronológica</h3>
          <div class="flex items-center justify-between p-3 border rounded">
            <div>
              <p class="font-semibold text-lg">{{ age.years }} anos {{ age.months }} meses e {{ age.days }} dias</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Ou {{ age.totalMonths }} meses</p>
            </div>
            <UButton
              icon="i-heroicons-clipboard"
              variant="ghost"
              @click="copyAge('Idade Cronológica', `${age.years} anos ${age.months} meses e ${age.days} dias (${age.totalMonths} meses no total)`)"
            />
          </div>
        </div>

        <!-- Corrigida -->
        <div v-if="isPremature && gestationalWeeks">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Idade Corrigida</h3>
            <UBadge v-if="age.years >= 2" color="yellow" variant="subtle" size="xs">Raramente usada após 2 anos</UBadge>
          </div>
          <div class="flex items-center justify-between p-3 border rounded bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-800">
            <div>
              <template v-if="correctedAge?.isNegative">
                <p class="font-semibold text-lg text-orange-600 dark:text-orange-400">Ainda não atingiu as 40 semanas</p>
              </template>
              <template v-else-if="correctedAge">
                <p class="font-semibold text-lg">{{ correctedAge.years }} anos {{ correctedAge.months }} meses e {{ correctedAge.days }} dias</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Ou {{ correctedAge.totalMonths }} meses</p>
              </template>
            </div>
            <UButton
              v-if="correctedAge && !correctedAge.isNegative"
              icon="i-heroicons-clipboard"
              variant="ghost"
              color="primary"
              @click="copyAge('Idade Corrigida', `${correctedAge.years} anos ${correctedAge.months} meses e ${correctedAge.days} dias (${correctedAge.totalMonths} meses no total)`)"
            />
          </div>
        </div>
        </div>
    </UCard>
  </UContainer>
</template>
