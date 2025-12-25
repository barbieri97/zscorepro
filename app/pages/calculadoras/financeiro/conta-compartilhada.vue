<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue"

/* Tipos */
interface Person {
  id: number
  name: string
  amount: number
}

interface AppState {
  people: Person[]
  nextId: number
}

/* Constantes */
const STORAGE_KEY = "group-expense-splitter"

/* Estado */
const people = ref<Person[]>([
  { id: 1, name: "", amount: 0 },
  { id: 2, name: "", amount: 0 }
])
let nextId = 3

const toast = useToast()

/* Local Storage Functions */
function saveToLocalStorage() {
  try {
    const state: AppState = {
      people: people.value,
      nextId: nextId
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error("Erro ao salvar no localStorage:", error)
    toast.add({
      title: "Erro ao salvar",
      description: "Não foi possível salvar os dados localmente",
      icon: "i-heroicons-exclamation-triangle",
      color: "error"
    })
  }
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const state: AppState = JSON.parse(saved)
      people.value = state.people
      nextId = state.nextId
    }
  } catch (error) {
    console.error("Erro ao carregar do localStorage:", error)
    toast.add({
      title: "Erro ao carregar",
      description: "Não foi possível carregar os dados salvos",
      icon: "i-heroicons-exclamation-triangle",
      color: "warning"
    })
  }
}

function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    people.value = [
      { id: 1, name: "", amount: 0 },
      { id: 2, name: "", amount: 0 }
    ]
    nextId = 3
    toast.add({
      title: "Dados limpos",
      description: "Todos os dados foram removidos",
      icon: "i-heroicons-check-circle",
      color: "success"
    })
  } catch (error) {
    console.error("Erro ao limpar localStorage:", error)
  }
}

/* Lifecycle */
onMounted(() => {
  loadFromLocalStorage()
})

/* Watch para salvar automaticamente */
watch(
  people,
  () => {
    saveToLocalStorage()
  },
  { deep: true }
)

/* Adicionar pessoa */
function addPerson() {
  people.value.push({
    id: nextId++,
    name: "",
    amount: 0
  })
  saveToLocalStorage()
}

/* Remover pessoa */
function removePerson(id: number) {
  if (people.value.length <= 2) {
    toast.add({
      title: "Atenção",
      description: "É necessário ter pelo menos 2 pessoas",
      icon: "i-heroicons-exclamation-triangle",
      color: "warning"
    })
    return
  }
  people.value = people.value.filter(p => p.id !== id)
  saveToLocalStorage()
}

/* Cálculos */
const totalAmount = computed(() => {
  return people.value.reduce((sum, person) => sum + (person.amount || 0), 0)
})

const fairAmount = computed(() => {
  const count = people.value.length
  return count > 0 ? totalAmount.value / count : 0
})

const results = computed(() => {
  return people.value.map(person => {
    const difference = (person.amount || 0) - fairAmount.value
    
    return {
      ...person,
      difference,
      status: difference > 0.01 ? "receive" : difference < -0.01 ? "pay" : "even"
    }
  })
})

/* Copiar para área de transferência */
function copyResults() {
  const text = results.value
    .map(r => {
      const name = r.name || "Sem nome"
      if (r.status === "even") {
        return `${name}: Quitado`
      } else if (r.status === "receive") {
        return `${name}: Deve receber R$ ${Math.abs(r.difference).toFixed(2)}`
      } else {
        return `${name}: Deve pagar R$ ${Math.abs(r.difference).toFixed(2)}`
      }
    })
    .join("\n")

  // Adicionar transferências se houver
  let transfersText = ""
  if (suggestedTransfers.value.length > 0) {
    transfersText = "\n\nSugestão de Transferências:\n" + 
      suggestedTransfers.value
        .map((t, index) => 
          `${index + 1}. ${t.from} → ${t.to}: R$ ${t.amount.toFixed(2)}`
        )
        .join("\n")
  }

  const summary = `Divisão de Gastos em Grupo\n\nTotal: R$ ${totalAmount.value.toFixed(2)}\nValor justo por pessoa: R$ ${fairAmount.value.toFixed(2)}\n\nAcerto de contas:\n${text}${transfersText}`

  navigator.clipboard.writeText(summary)

  toast.add({
    title: "Copiado para a área de transferência",
    description: "Resumo completo da divisão copiado",
    icon: "i-heroicons-check-circle",
    color: "success"
  })
}

/* Classes de cor */
function getStatusColor(status: string) {
  switch (status) {
    case "receive":
      return "text-green-600 dark:text-green-400"
    case "pay":
      return "text-red-600 dark:text-red-400"
    default:
      return "text-gray-600 dark:text-gray-400"
  }
}

function getCardClass(status: string) {
  switch (status) {
    case "receive":
      return "bg-green-100 dark:bg-green-950/20 border-green-300 dark:border-green-800"
    case "pay":
      return "bg-red-100 dark:bg-red-950/20 border-red-300 dark:border-red-800"
    default:
      return "bg-gray-100 dark:bg-gray-950/20 border-gray-300 dark:border-gray-800"
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "receive":
      return "i-heroicons-arrow-down-circle"
    case "pay":
      return "i-heroicons-arrow-up-circle"
    default:
      return "i-heroicons-check-circle"
  }
}

function getStatusText(status: string, difference: number) {
  if (status === "even") {
    return "Quitado"
  } else if (status === "receive") {
    return `Deve receber R$ ${Math.abs(difference).toFixed(2)}`
  } else {
    return `Deve pagar R$ ${Math.abs(difference).toFixed(2)}`
  }
}

/* Algoritmo de transferências */
interface Transfer {
  from: string
  to: string
  amount: number
}

const suggestedTransfers = computed<Transfer[]>(() => {
  // Separar quem deve pagar e quem deve receber
  const payers = results.value
    .filter(r => r.status === "pay")
    .map(r => ({ name: r.name || "Sem nome", amount: Math.abs(r.difference) }))
    .sort((a, b) => b.amount - a.amount)

  const receivers = results.value
    .filter(r => r.status === "receive")
    .map(r => ({ name: r.name || "Sem nome", amount: Math.abs(r.difference) }))
    .sort((a, b) => b.amount - a.amount)

  const transfers: Transfer[] = []

  // Copiar arrays para não modificar os originais
  const payersCopy = payers.map(p => ({ ...p }))
  const receiversCopy = receivers.map(r => ({ ...r }))

  // Algoritmo greedy: emparelhar maiores dívidas com maiores créditos
  let i = 0
  let j = 0

  while (i < payersCopy.length && j < receiversCopy.length) {
    const payer = payersCopy[i]
    const receiver = receiversCopy[j]

    // Validação TypeScript
    if (!payer || !receiver) break

    const transferAmount = Math.min(payer.amount, receiver.amount)

    if (transferAmount > 0.01) {
      transfers.push({
        from: payer.name,
        to: receiver.name,
        amount: transferAmount
      })
    }

    payer.amount -= transferAmount
    receiver.amount -= transferAmount

    if (payer.amount < 0.01) i++
    if (receiver.amount < 0.01) j++
  }

  return transfers
})

</script>

<template>
  <UContainer class="py-10 flex justify-center">
    <UCard class="w-full max-w-4xl">
      <!-- Header -->
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-scale" class="text-2xl text-primary" />
            <h2 class="text-lg font-semibold">
              Divisão de Gastos em Grupo
            </h2>
          </div>
          
          <UButton
            icon="i-heroicons-trash"
            size="sm"
            color="error"
            variant="ghost"
            @click="clearLocalStorage"
            title="Limpar todos os dados"
          >
            Limpar tudo
          </UButton>
        </div>
      </template>

      <!-- Adicionar pessoas -->
      <div class="space-y-4 mb-6">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-muted">
            Pessoas ({{ people.length }})
          </h3>
          <UButton
            icon="i-heroicons-plus"
            size="sm"
            variant="soft"
            @click="addPerson"
          >
            Adicionar pessoa
          </UButton>
        </div>

        <!-- Lista de pessoas -->
        <div class="space-y-3">
          <UCard
            v-for="person in people"
            :key="person.id"
            variant="soft"
            class="border"
          >
            <div class="flex items-center gap-3">
              <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <UFormField label="Nome">
                  <UInput
                    v-model="person.name"
                    placeholder="Ex: João"
                  />
                </UFormField>

                <UFormField label="Valor gasto (R$)">
                  <UInput
                    v-model.number="person.amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </UFormField>
              </div>

              <UButton
                icon="i-heroicons-trash"
                color="error"
                variant="ghost"
                size="sm"
                @click="removePerson(person.id)"
                :disabled="people.length <= 2"
              />
            </div>
          </UCard>
        </div>
      </div>

      <!-- Resumo -->
      <div v-if="totalAmount > 0" class="space-y-4 mt-8">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-muted">Resumo</h3>
          <UButton
            icon="i-heroicons-clipboard"
            size="sm"
            variant="ghost"
            @click="copyResults"
          >
            Copiar resumo
          </UButton>
        </div>

        <!-- Cards de resumo -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UCard variant="soft" class="bg-primary/10">
            <div>
              <p class="text-sm text-muted">Total gasto</p>
              <p class="font-semibold text-2xl text-primary">
                R$ {{ totalAmount.toFixed(2) }}
              </p>
            </div>
          </UCard>

          <UCard variant="soft" class="bg-primary/10">
            <div>
              <p class="text-sm text-muted">Valor justo por pessoa</p>
              <p class="font-semibold text-2xl text-primary">
                R$ {{ fairAmount.toFixed(2) }}
              </p>
            </div>
          </UCard>
        </div>

        <!-- Resultados individuais -->
        <div class="space-y-3 mt-6">
          <h3 class="text-sm font-medium text-muted">Acerto de contas</h3>

          <UCard
            v-for="result in results"
            :key="result.id"
            :class="getCardClass(result.status)"
            class="border-2"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <UIcon
                  :name="getStatusIcon(result.status)"
                  :class="getStatusColor(result.status)"
                  class="text-2xl"
                />
                <div>
                  <p class="font-semibold">
                    {{ result.name || "Sem nome" }}
                  </p>
                  <p class="text-sm text-muted">
                    Gastou: R$ {{ (result.amount || 0).toFixed(2) }}
                  </p>
                </div>
              </div>

              <div class="text-right">
                <p
                  :class="getStatusColor(result.status)"
                  class="font-semibold text-lg"
                >
                  {{ getStatusText(result.status, result.difference) }}
                </p>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Sugestões de transferências -->
        <div v-if="suggestedTransfers.length > 0" class="space-y-3 mt-8">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-muted">
              Sugestão de Transferências ({{ suggestedTransfers.length }})
            </h3>
          </div>

          <UCard
            v-for="(transfer, index) in suggestedTransfers"
            :key="index"
            variant="soft"
            class="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-300 dark:border-blue-800"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-2">
                  <UBadge
                    :label="`${index + 1}`"
                    color="primary"
                    variant="solid"
                  />
                  <span class="font-medium">{{ transfer.from }}</span>
                </div>
                <UIcon
                  name="i-heroicons-arrow-right"
                  class="text-blue-600 dark:text-blue-400 text-xl"
                />
                <span class="font-medium">{{ transfer.to }}</span>
              </div>

              <div class="text-right">
                <p class="font-semibold text-lg text-blue-600 dark:text-blue-400">
                  R$ {{ transfer.amount.toFixed(2) }}
                </p>
              </div>
            </div>
          </UCard>

          <UAlert
            icon="i-heroicons-light-bulb"
            color="primary"
            variant="soft"
            title="Dica"
            description="Estas são as transferências mais eficientes para equilibrar todas as contas do grupo."
          />
        </div>
      </div>

      <!-- Estado vazio -->
      <div v-else class="text-center py-8">
        <UIcon
          name="i-heroicons-banknotes"
          class="text-6xl text-gray-400 mx-auto mb-4"
        />
        <p class="text-muted">
          Adicione os valores gastos para calcular a divisão
        </p>
      </div>
    </UCard>
  </UContainer>
</template>