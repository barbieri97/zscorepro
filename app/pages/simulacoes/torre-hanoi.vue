<script setup lang="ts">
import type { PegIndex } from '~/composables/useTorreHanoi'

const {
  diskCount,
  pegs,
  moveCount,
  errorCount,
  isStarted,
  isCompleted,
  selectedPeg,
  errorPeg,
  isAnimatingError,
  formattedTime,
  optimalMoves,
  history,
  initGame,
  resetGame,
  selectPeg,
  clearHistory,
} = useTorreHanoi()

const showHistory = ref(false)

const PEG_LABELS = ['A', 'B', 'C']

// Disk colour: alternates between two brand blues
const DISK_COLORS = ['hsl(213, 97%, 62%)', 'hsl(224, 76%, 44%)']
const diskColor = (size: number) => DISK_COLORS[size % 2]!
const diskShadow = (size: number) =>
  `0 2px 8px ${size % 2 === 0 ? 'hsla(213, 97%, 62%, 0.4)' : 'hsla(224, 76%, 44%, 0.4)'}`

const diskWidth = (size: number, total: number) => {
  const minPct = 18
  const maxPct = 90
  return `${minPct + ((size - 1) / Math.max(total - 1, 1)) * (maxPct - minPct)}%`
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

const formatDuration = (secs: number) => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

useHead({
  title: 'Torre de Hanói – Simulação Neuropsicológica | ZscorePro',
  meta: [
    {
      name: 'description',
      content:
        'Jogue a Torre de Hanói online. Simulação do clássico teste neuropsicológico com contagem de movimentos, cronômetro, detecção de erros e histórico de partidas.',
    },
  ],
})
</script>

<template>
  <UContainer class="py-10">
    <!-- ── Page header ── -->
    <div class="text-center space-y-2 mb-8">
      <h1 class="text-3xl font-bold text-primary">Torre de Hanói</h1>
      <p class="text-muted text-sm max-w-xl mx-auto">
        Teste neuropsicológico de planejamento e resolução de problemas. Mova todos os discos para
        outro pino, nunca colocando um disco maior sobre um menor.
      </p>
    </div>

    <!-- ── Setup screen ── -->
    <div v-if="!isStarted" class="flex justify-center">
      <UCard class="w-full max-w-md">
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-puzzle-piece" class="text-primary text-2xl" />
            <h2 class="font-semibold text-lg">Configurar Partida</h2>
          </div>
        </template>

        <div class="space-y-6 py-2">
          <UFormField
            label="Número de discos"
            description="Quanto maior, mais difícil. O mínimo ideal é 3."
          >
            <UInput
              v-model.number="diskCount"
              type="number"
              :min="3"
              :max="9"
              placeholder="Ex: 5"
              class="w-full"
            />
          </UFormField>

          <div class="rounded-lg bg-primary/8 border border-primary/20 p-4 text-sm space-y-1">
            <p>
              <span class="font-medium">Discos:</span> {{ diskCount }}
            </p>
            <p>
              <span class="font-medium">Movimentos mínimos:</span>
              {{ Math.pow(2, diskCount) - 1 }}
            </p>
          </div>
        </div>

        <template #footer>
          <UButton
            icon="i-heroicons-play"
            color="primary"
            size="lg"
            block
            @click="initGame"
          >
            Iniciar Partida
          </UButton>
        </template>
      </UCard>
    </div>

    <!-- ── Game screen ── -->
    <div v-else class="space-y-6">
      <!-- Stats bar -->
      <div class="grid grid-cols-3 gap-3">
        <UCard class="text-center py-3">
          <p class="text-xs text-muted uppercase tracking-wide mb-1">Movimentos</p>
          <p class="text-2xl font-bold text-primary">{{ moveCount }}</p>
          <p class="text-xs text-muted">mínimo: {{ optimalMoves }}</p>
        </UCard>
        <UCard class="text-center py-3">
          <p class="text-xs text-muted uppercase tracking-wide mb-1">Tempo</p>
          <p class="text-2xl font-bold font-mono">{{ formattedTime }}</p>
        </UCard>
        <UCard class="text-center py-3">
          <p class="text-xs text-muted uppercase tracking-wide mb-1">Erros</p>
          <p class="text-2xl font-bold text-red-500">{{ errorCount }}</p>
        </UCard>
      </div>

      <!-- Instruction -->
      <div class="text-center text-sm text-muted">
        <span v-if="selectedPeg !== null">
          Pino <strong class="text-primary">{{ PEG_LABELS[selectedPeg] }}</strong> selecionado —
          clique no pino de destino
        </span>
        <span v-else>Clique em um pino para selecionar o disco do topo</span>
      </div>

      <!-- Pegs board -->
      <div class="flex justify-center">
        <div
          class="flex gap-4 sm:gap-8 items-end justify-center w-full max-w-2xl p-6 rounded-2xl board-bg border border-white/10"
        >
          <!-- Each peg -->
          <div
            v-for="(peg, pegIdx) in pegs"
            :key="pegIdx"
            class="flex flex-col items-center gap-1 flex-1 min-w-0"
            :class="[
              'peg-wrapper',
              selectedPeg === pegIdx ? 'peg-selected' : '',
              errorPeg === pegIdx ? 'peg-error' : '',
            ]"
            @click="selectPeg(pegIdx as PegIndex)"
          >
            <!-- Disks stacked bottom-up, rendered top-down -->
            <div class="flex flex-col-reverse items-center gap-[3px] w-full min-h-[180px] sm:min-h-[220px] relative justify-start">
              <!-- Vertical pole -->
              <div class="pole absolute bottom-0 left-1/2 -translate-x-1/2" />

              <!-- Disks -->
              <TransitionGroup name="disk">
                <div
                  v-for="disk in peg"
                  :key="disk.id"
                  class="disk z-10 relative"
                  :style="{
                    width: diskWidth(disk.size, diskCount),
                    backgroundColor: diskColor(disk.size),
                    boxShadow: diskShadow(disk.size),
                  }"
                >
                  <span class="disk-label">{{ disk.size }}</span>
                </div>
              </TransitionGroup>
            </div>

            <!-- Base bar -->
            <div class="base-bar w-full rounded-full" />

            <!-- Peg label -->
            <p
              class="text-xs font-semibold mt-1 transition-colors"
              :class="selectedPeg === pegIdx ? 'text-primary' : 'text-muted'"
            >
              Pino {{ PEG_LABELS[pegIdx] }}
            </p>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex gap-3 justify-center flex-wrap">
        <UButton
          icon="i-heroicons-arrow-path"
          variant="soft"
          color="neutral"
          @click="resetGame"
        >
          Nova Configuração
        </UButton>
        <UButton
          icon="i-heroicons-arrow-uturn-left"
          variant="soft"
          color="primary"
          @click="initGame"
        >
          Reiniciar
        </UButton>
        <UButton
          icon="i-heroicons-clock"
          variant="soft"
          @click="showHistory = true"
        >
          Histórico
        </UButton>
      </div>
    </div>

    <!-- ── Completed modal ── -->
    <UModal v-model:open="isCompleted" :dismissible="false">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-trophy" class="text-yellow-500 text-3xl" />
              <h3 class="font-bold text-xl">Parabéns!</h3>
            </div>
          </template>

          <div class="space-y-4 py-2">
            <p class="text-muted text-sm">Você completou a Torre de Hanói!</p>

            <div class="grid grid-cols-2 gap-3">
              <div class="stat-card">
                <p class="stat-label">Movimentos</p>
                <p class="stat-value text-primary">{{ moveCount }}</p>
              </div>
              <div class="stat-card">
                <p class="stat-label">Mínimo possível</p>
                <p class="stat-value">{{ optimalMoves }}</p>
              </div>
              <div class="stat-card">
                <p class="stat-label">Erros</p>
                <p class="stat-value text-red-500">{{ errorCount }}</p>
              </div>
              <div class="stat-card">
                <p class="stat-label">Tempo</p>
                <p class="stat-value font-mono">{{ formattedTime }}</p>
              </div>
            </div>

            <div
              v-if="moveCount === optimalMoves && errorCount === 0"
              class="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3 text-sm text-center text-yellow-600 dark:text-yellow-400 font-medium"
            >
              🏆 Solução ótima! Você foi perfeito!
            </div>
          </div>

          <template #footer>
            <div class="flex gap-3 flex-wrap">
              <UButton color="primary" icon="i-heroicons-arrow-uturn-left" @click="initGame">
                Jogar de novo
              </UButton>
              <UButton variant="soft" icon="i-heroicons-adjustments-horizontal" @click="resetGame">
                Mudar configuração
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- ── History modal ── -->
    <UModal v-model:open="showHistory">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-clock" class="text-primary" />
                <h3 class="font-semibold">Histórico de Partidas</h3>
              </div>
              <UButton
                v-if="history.length > 0"
                variant="ghost"
                color="red"
                size="xs"
                icon="i-heroicons-trash"
                @click="clearHistory"
              >
                Limpar
              </UButton>
            </div>
          </template>

          <div v-if="history.length === 0" class="text-center text-muted py-8 text-sm">
            Nenhuma partida concluída ainda.
          </div>

          <div v-else class="space-y-3 max-h-96 overflow-y-auto pr-1">
            <div
              v-for="record in history"
              :key="record.id"
              class="rounded-lg border border-white/10 bg-white/5 p-3 text-sm space-y-1"
            >
              <div class="flex items-center justify-between">
                <span class="font-medium">{{ record.diskCount }} discos</span>
                <span class="text-muted text-xs">{{ formatDate(record.completedAt) }}</span>
              </div>
              <div class="flex gap-4 text-xs text-muted">
                <span>Movimentos: <strong class="text-primary">{{ record.moves }}</strong></span>
                <span>Mínimo: {{ record.optimal }}</span>
                <span>Erros: <strong class="text-red-400">{{ record.errors }}</strong></span>
                <span>Tempo: {{ formatDuration(record.durationSeconds) }}</span>
              </div>
            </div>
          </div>

          <template #footer>
            <UButton variant="soft" block @click="showHistory = false">Fechar</UButton>
          </template>
        </UCard>
      </template>
    </UModal>
  </UContainer>
</template>

<style scoped>
/* Board background */
.board-bg {
  background: linear-gradient(160deg, hsl(220 20% 12%) 0%, hsl(240 20% 8%) 100%);
}

/* Pole */
.pole {
  width: 6px;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(to bottom, hsl(220 15% 55%), hsl(220 15% 35%));
}

/* Base */
.base-bar {
  height: 10px;
  background: linear-gradient(to right, hsl(220 15% 40%), hsl(220 15% 55%), hsl(220 15% 40%));
}

/* Disk */
.disk {
  height: 22px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: filter 0.15s ease;
}

.disk:hover {
  filter: brightness(1.15);
}

.disk-label {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  pointer-events: none;
}

/* Peg interaction */
.peg-wrapper {
  cursor: pointer;
  border-radius: 16px;
  padding: 8px;
  transition: background 0.2s ease;
}

.peg-wrapper:hover {
  background: rgba(255, 255, 255, 0.04);
}

.peg-selected {
  background: rgba(var(--color-primary-500), 0.12) !important;
  outline: 2px solid rgba(var(--color-primary-500), 0.4);
}

/* Error shake animation */
.peg-error {
  animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  0%,
  100% { transform: translateX(0); }
  10%  { transform: translateX(-6px) rotate(-2deg); }
  30%  { transform: translateX(6px)  rotate(2deg); }
  50%  { transform: translateX(-5px) rotate(-1deg); }
  70%  { transform: translateX(5px)  rotate(1deg); }
  90%  { transform: translateX(-3px); }
}

/* Disk transition */
.disk-enter-active,
.disk-leave-active {
  transition: all 0.25s ease;
}
.disk-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}
.disk-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

/* Stat cards in modal */
.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px;
  text-align: center;
}
.stat-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ui-text-muted);
  margin-bottom: 4px;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}
</style>
