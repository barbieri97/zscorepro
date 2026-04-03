<script setup lang="ts">
import { onMounted } from "vue";

const {
  participants,
  purchases,
  addParticipant,
  removeParticipant,
  addPurchase,
  removePurchase,
  loadFromLocalStorage,
  clearAll,
  copyResults,
  totalAmount,
  totalParticipants,
  totalUnits,
  costPerUnit,
  results,
  suggestedTransfers,
  getStatusColor,
  getCardClass,
  getStatusIcon,
  getStatusText,
  participantName,
} = useGroupExpense();

onMounted(() => loadFromLocalStorage());

/* Opções do select de pagador para cada compra */
const participantOptions = computed(() =>
  participants.value.map((p) => ({
    label: p.name || "Sem nome",
    value: p.id,
  }))
);
</script>

<template>
  <UContainer class="py-10 flex justify-center">
    <UCard class="w-full max-w-4xl">

      <!-- Header -->
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-scale" class="text-2xl text-primary" />
            <h2 class="text-lg font-semibold">Divisão de Gastos em Grupo</h2>
          </div>
          <UButton
            icon="i-heroicons-trash"
            size="sm"
            color="error"
            variant="ghost"
            title="Limpar todos os dados"
            @click="clearAll"
          >
            Limpar tudo
          </UButton>
        </div>
      </template>

      <!-- ─── PARTICIPANTES ─── -->
      <section class="space-y-3 mb-8">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-muted uppercase tracking-wide">
            Participantes ({{ participants.length }})
          </h3>
          <UButton
            icon="i-heroicons-user-plus"
            size="sm"
            variant="soft"
            @click="addParticipant"
          >
            Adicionar
          </UButton>
        </div>

        <div class="flex flex-wrap gap-2">
          <UCard
            v-for="participant in participants"
            :key="participant.id"
            variant="soft"
            class="border flex-shrink-0"
          >
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-user-circle" class="text-xl text-primary flex-shrink-0" />
              <UInput
                v-model="participant.name"
                placeholder="Nome"
                size="sm"
                class="w-28"
              />
              <UFormField label="" help="Pessoas cobertas">
                <UInput
                  v-model.number="participant.coversCount"
                  type="number"
                  :min="1"
                  step="1"
                  size="sm"
                  class="w-16"
                  title="Quantas pessoas este participante representa"
                >
                  <template #leading>
                    <UIcon name="i-heroicons-users" class="text-muted" />
                  </template>
                </UInput>
              </UFormField>
              <UButton
                icon="i-heroicons-x-mark"
                color="error"
                variant="ghost"
                size="xs"
                :disabled="participants.length <= 1"
                @click="removeParticipant(participant.id)"
              />
            </div>
          </UCard>
        </div>
      </section>

      <USeparator class="my-6" />

      <!-- ─── COMPRAS ─── -->
      <section class="space-y-3 mb-8">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-muted uppercase tracking-wide">
            Compras ({{ purchases.length }})
          </h3>
          <UButton
            icon="i-heroicons-plus"
            size="sm"
            variant="soft"
            @click="addPurchase"
          >
            Adicionar compra
          </UButton>
        </div>

        <div class="space-y-3">
          <UCard
            v-for="(purchase, index) in purchases"
            :key="purchase.id"
            variant="soft"
            class="border"
          >
            <div class="flex items-start gap-3">
              <!-- Número da compra -->
              <UBadge
                :label="`${index + 1}`"
                color="primary"
                variant="solid"
                class="mt-1 flex-shrink-0"
              />

              <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <UFormField label="Descrição">
                  <UInput
                    v-model="purchase.description"
                    placeholder="Ex: Jantar, supermercado…"
                  />
                </UFormField>

                <UFormField label="Valor (R$)">
                  <UInput
                    v-model.number="purchase.amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                  />
                </UFormField>

                <UFormField label="Pago por">
                  <USelect
                    v-model="purchase.paidById"
                    :items="participantOptions"
                    value-key="value"
                    label-key="label"
                    placeholder="Selecionar…"
                  />
                </UFormField>
              </div>

              <UButton
                icon="i-heroicons-trash"
                color="error"
                variant="ghost"
                size="sm"
                class="mt-6"
                :disabled="purchases.length <= 1"
                @click="removePurchase(purchase.id)"
              />
            </div>
          </UCard>
        </div>
      </section>

      <!-- ─── RESUMO ─── -->
      <template v-if="totalAmount > 0">
        <USeparator class="my-6" />

        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-muted uppercase tracking-wide">Resumo</h3>
            <UButton
              icon="i-heroicons-clipboard"
              size="sm"
              variant="ghost"
              @click="copyResults"
            >
              Copiar resumo
            </UButton>
          </div>

          <!-- Cards de totais -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <UCard variant="soft" class="bg-primary/10">
              <div>
                <p class="text-sm text-muted">Responsáveis</p>
                <p class="font-semibold text-2xl text-primary">{{ totalParticipants }}</p>
              </div>
            </UCard>
            <UCard variant="soft" class="bg-primary/10">
              <div>
                <p class="text-sm text-muted">Total de pessoas</p>
                <p class="font-semibold text-2xl text-primary">{{ totalUnits }}</p>
              </div>
            </UCard>
            <UCard variant="soft" class="bg-primary/10">
              <div>
                <p class="text-sm text-muted">Total gasto</p>
                <p class="font-semibold text-2xl text-primary">R$ {{ totalAmount.toFixed(2) }}</p>
              </div>
            </UCard>
            <UCard variant="soft" class="bg-primary/10">
              <div>
                <p class="text-sm text-muted">Custo por pessoa</p>
                <p class="font-semibold text-2xl text-primary">R$ {{ costPerUnit.toFixed(2) }}</p>
              </div>
            </UCard>
          </div>

          <!-- Acerto de contas -->
          <div class="space-y-3 mt-6">
            <h3 class="text-sm font-medium text-muted">Acerto de contas</h3>

            <UCard
              v-for="result in results"
              :key="result.participant.id"
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
                    <div class="flex items-center gap-2">
                      <p class="font-semibold">{{ result.participant.name || "Sem nome" }}</p>
                      <UBadge
                        v-if="result.participant.coversCount > 1"
                        :label="`${result.participant.coversCount} pessoas`"
                        color="primary"
                        variant="soft"
                        size="xs"
                      />
                    </div>
                    <p class="text-sm text-muted">
                      Pagou: R$ {{ result.totalPaid.toFixed(2) }} ·
                      Deveria pagar: R$ {{ result.shouldPay.toFixed(2) }}
                    </p>
                  </div>
                </div>
                <p :class="getStatusColor(result.status)" class="font-semibold text-lg text-right">
                  {{ getStatusText(result.status, result.difference) }}
                </p>
              </div>
            </UCard>
          </div>

          <!-- Sugestões de transferências -->
          <div v-if="suggestedTransfers.length > 0" class="space-y-3 mt-8">
            <h3 class="text-sm font-medium text-muted">
              Sugestão de Transferências ({{ suggestedTransfers.length }})
            </h3>

            <UCard
              v-for="(transfer, index) in suggestedTransfers"
              :key="index"
              variant="soft"
              class="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-300 dark:border-blue-800"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <UBadge :label="`${index + 1}`" color="primary" variant="solid" />
                  <span class="font-medium">{{ transfer.from }}</span>
                  <UIcon name="i-heroicons-arrow-right" class="text-blue-600 dark:text-blue-400 text-xl" />
                  <span class="font-medium">{{ transfer.to }}</span>
                </div>
                <p class="font-semibold text-lg text-blue-600 dark:text-blue-400">
                  R$ {{ transfer.amount.toFixed(2) }}
                </p>
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
        </section>
      </template>

      <!-- Estado vazio -->
      <template v-else>
        <div class="text-center py-10">
          <UIcon name="i-heroicons-banknotes" class="text-6xl text-gray-400 mx-auto mb-4" />
          <p class="text-muted">Adicione os valores das compras para calcular a divisão</p>
        </div>
      </template>

    </UCard>
  </UContainer>
</template>
