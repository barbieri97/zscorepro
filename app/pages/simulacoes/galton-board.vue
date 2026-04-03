<script setup lang="ts">
import { ref, onMounted } from 'vue'

const {
  canvasRef,
  chartCanvas,
  ballCount,
  isRunning,
  isPaused,
  totalBalls,
  startSimulation,
  pauseSimulation,
  resetSimulation
} = useGaltonBoard()

const showMobileWarning = ref(false)

onMounted(() => {
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    showMobileWarning.value = true
  }
})
</script>

<template>
  <UContainer class="py-10 flex justify-center">
    <UModal v-model:open="showMobileWarning">
      <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6">
              Aviso de Resolução
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="showMobileWarning = false" />
          </div>
        </template>
        
        <div class="py-4 text-center space-y-4">
          <UIcon name="i-heroicons-device-phone-mobile" class="w-12 h-12 mx-auto text-primary-500" />
          <p class="text-sm">
            Para uma melhor experiência com a simulação do Tabuleiro de Galton, recomendamos o uso de telas maiores (computador ou tablet).
          </p>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton color="primary" @click="showMobileWarning = false">
              Estou ciente
            </UButton>
          </div>
        </template>
      </UCard>
      </template>
    </UModal>

    <UCard class="w-full max-w-4xl">
      <!-- Header -->
      <template #header>
        <div class="text-center space-y-2">
          <h2 class="text-lg font-semibold">
            Tabuleiro de Galton
          </h2>
          <p class="text-sm text-muted">
            Simulação física da distribuição normal
          </p>
        </div>
      </template>

      <!-- Controles -->
      <div class="space-y-4 mb-6">
        <UFormField label="Número de bolas">
          <UInput 
            v-model.number="ballCount" 
            type="number" 
            :min="10"
            :max="500"
            :disabled="isRunning"
            placeholder="Ex: 100" 
          />
        </UFormField>

        <div class="flex gap-2 flex-wrap">
          <UButton
            :disabled="isRunning"
            @click="startSimulation"
            icon="i-heroicons-play"
            color="primary"
          >
            Iniciar
          </UButton>

          <UButton
            v-if="isRunning"
            @click="pauseSimulation"
            :icon="isPaused ? 'i-heroicons-play' : 'i-heroicons-pause'"
            variant="soft"
          >
            {{ isPaused ? 'Retomar' : 'Pausar' }}
          </UButton>

          <UButton
            @click="resetSimulation"
            icon="i-heroicons-arrow-path"
            variant="soft"
            color="neutral"
          >
            Reiniciar
          </UButton>
        </div>
      </div>

      <!-- Canvas da simulação -->
      <div class="flex justify-center mb-6 bg-gray-900 dark:bg-gray-950 rounded-lg overflow-hidden">
        <canvas ref="canvasRef" class="max-w-full" />
      </div>

      <!-- Histograma -->
      <div class="space-y-4">
        <h3 class="font-semibold text-center">
          {{ totalBalls > 0 ? `Distribuição (${totalBalls} bolas)` : 'Distribuição' }}
        </h3>
        
        <!-- Chart.js canvas -->
        <div class="flex justify-center p-4">
          <canvas ref="chartCanvas" style="max-height: 400px; width: 100%;"></canvas>
        </div>
      </div>

      <!-- Footer -->
      <template #footer>
        <div class="space-y-3">
          <UBadge 
            label="Essa simulação apresenta alguns bugs, se quiser contribuir acesse nossa page do github"
            variant="soft"
            color="warning"
            icon="i-heroicons-information-circle"
            class="w-full justify-center"
          />
        </div>
      </template>
    </UCard>
  </UContainer>
</template>

<style scoped>
canvas {
  display: block;
}
</style>