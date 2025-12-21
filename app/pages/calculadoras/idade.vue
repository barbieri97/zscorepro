<script setup lang="ts">
import { ref, computed } from "vue"
import { useToast } from "#imports"

const toast = useToast()

/* Inputs */
const birthDate = ref<string>("")
const referenceDate = ref<string>(new Date().toISOString().substr(0, 10))

/* Cálculo da idade */
const age = computed(() => {
  if (!birthDate.value) return null

  const birth = new Date(birthDate.value)
  const refDate = new Date(referenceDate.value)
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

  return { years, months, days }
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
      <div class="grid gap-4 md:grid-cols-2 my-10">
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

      <!-- Resultados -->
      <div v-if="age" class="space-y-4">
        <!-- Anos -->
        <div class="flex items-center justify-between p-3 border rounded">
          <div>
            <p class="font-semibold text-lg">{{ age.years }} anos {{ age.months }} meses e {{ age.days }} dias</p>
          </div>
          <UButton
            icon="i-heroicons-clipboard"
            variant="ghost"
            @click="copyAge('Idade', `${age.years} anos ${age.months} meses e ${age.days} dias`)"
          />
        </div>
        </div>
    </UCard>
  </UContainer>
</template>
