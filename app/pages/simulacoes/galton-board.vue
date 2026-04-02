<script setup lang="ts">
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
</script>

<template>
  <UContainer class="py-10 flex justify-center">
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