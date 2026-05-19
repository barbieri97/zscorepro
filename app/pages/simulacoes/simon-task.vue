<script setup lang="ts">
import type { ArrowDirection } from '~/composables/useSimonTask'

const {
  phase,
  currentTrial,
  sessionResult,
  history,
  progress,
  elapsed,
  formattedElapsed,
  formattedTotal,
  startSession,
  respond,
  reset,
  clearHistory,
} = useSimonTask()

// ── hide site header/footer during gameplay via body class ───────────────────
// (setPageLayout was remounting the page and wiping results state, so we use
//  a CSS class on <body> instead – zero layout teardown, zero state loss)
watch(phase, (p) => {
  if (typeof document === 'undefined') return
  if (p === 'running' || p === 'iti') {
    document.body.classList.add('simon-playing')
  } else {
    document.body.classList.remove('simon-playing')
  }
})
onUnmounted(() => {
  if (typeof document !== 'undefined')
    document.body.classList.remove('simon-playing')
})

// ── fullscreen (truly optional – one click, no await needed) ─────────────────
const gameEl = ref<HTMLElement | null>(null)

function handleStart() {
  // request fullscreen silently; game starts instantly regardless
  document.documentElement.requestFullscreen().catch(() => {})
  startSession()
}

// ── keyboard handling ─────────────────────────────────────────────────────────
function onKey(e: KeyboardEvent) {
  if (phase.value !== 'running') return
  if (e.key === 'ArrowLeft')  respond('left')
  if (e.key === 'ArrowRight') respond('right')
}
onMounted(()  => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

// ── result helpers ────────────────────────────────────────────────────────────
const fmt = (ms: number) => ms > 0 ? `${Math.round(ms)} ms` : '—'
const fmtPct = (v: number) => `${Math.round(v * 100)}%`
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

const simonEffectLabel = computed(() => {
  const se = sessionResult.value?.simonEffect ?? 0
  if (se > 0) return `+${Math.round(se)} ms (mais lento no incongruente)`
  if (se < 0) return `${Math.round(se)} ms`
  return '0 ms'
})

const showHistory = ref(false)

useHead({
  title: 'Tarefa Simon – Simulação Neuropsicológica | ZscorePro',
  meta: [
    {
      name: 'description',
      content:
        'Realize a Tarefa de Simon online. Simulação neuropsicológica de controle inibitório: setas congruentes, incongruentes e neutras com medição do tempo de reação.',
    },
  ],
})
</script>

<template>
  <!-- ── INTRO SCREEN ──────────────────────────────────────────────────────── -->
  <UContainer v-if="phase === 'idle'" class="py-10">
    <div class="text-center space-y-2 mb-8">
      <h1 class="text-3xl font-bold text-primary">Tarefa de Simon</h1>
      <p class="text-muted text-sm max-w-xl mx-auto">
        Uma simulação clássica de controle cognitivo baseada no Spatial Stroop Task.
      </p>
    </div>

    <div class="flex justify-center">
      <UCard class="w-full max-w-lg">
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-bolt" class="text-primary text-2xl" />
            <h2 class="font-semibold text-lg">Como jogar</h2>
          </div>
        </template>

        <div class="space-y-5 py-2">
          <p class="text-sm text-muted leading-relaxed">
            Uma seta aparecerá na tela. Pressione a tecla <kbd class="kbd">←</kbd> se a seta aponta
            para a <strong>esquerda</strong>, ou <kbd class="kbd">→</kbd> se aponta para a
            <strong>direita</strong> — independente de onde ela aparece na tela.
          </p>

          <div class="grid grid-cols-3 gap-3 text-center text-sm">
            <div class="rounded-xl p-3 border border-emerald-500/30 bg-emerald-500/8">
              <div class="text-xl mb-1">⬅️</div>
              <p class="font-medium text-emerald-400">Congruente</p>
              <p class="text-xs text-muted mt-1">Seta e posição<br>no mesmo lado</p>
            </div>
            <div class="rounded-xl p-3 border border-slate-500/30 bg-slate-500/8">
              <div class="text-xl mb-1">↔️</div>
              <p class="font-medium text-slate-400">Neutro</p>
              <p class="text-xs text-muted mt-1">Seta no<br>centro</p>
            </div>
            <div class="rounded-xl p-3 border border-rose-500/30 bg-rose-500/8">
              <div class="text-xl mb-1">➡️</div>
              <p class="font-medium text-rose-400">Incongruente</p>
              <p class="text-xs text-muted mt-1">Seta e posição<br>em lados opostos</p>
            </div>
          </div>

          <div class="rounded-lg bg-primary/8 border border-primary/20 p-4 text-sm space-y-1">
            <p><span class="font-medium">Duração:</span> 4 minutos (~120 tentativas)</p>
            <p><span class="font-medium">Controles:</span> Teclas ← → (ou botões na tela em mobile)</p>
            <p><span class="font-medium">Objetivo:</span> Responda o mais rápido e corretamente possível</p>
          </div>
        </div>

        <template #footer>
          <div class="flex gap-3 flex-wrap">
            <UButton
              icon="i-heroicons-play"
              color="primary"
              size="lg"
              class="flex-1"
              @click="handleStart"
            >
              Iniciar (tela cheia)
            </UButton>
            <UButton
              v-if="history.length > 0"
              icon="i-heroicons-clock"
              variant="soft"
              size="lg"
              @click="showHistory = true"
            >
              Histórico
            </UButton>
          </div>
        </template>
      </UCard>
    </div>
  </UContainer>

  <!-- ── GAME SCREEN (fullscreen target) ──────────────────────────────────── -->
  <div
    v-else-if="phase === 'running' || phase === 'iti'"
    ref="gameEl"
    class="game-screen"
    @click.self="() => {}"
  >
    <!-- Top bar -->
    <div class="game-topbar">
      <div class="topbar-item">
        <span class="topbar-label">Tempo</span>
        <span class="topbar-value font-mono">{{ formattedElapsed }} / {{ formattedTotal }}</span>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill" :style="{ width: `${progress * 100}%` }" />
      </div>
      <div class="topbar-item text-right">
        <span class="topbar-label">Teclas</span>
        <span class="topbar-value">← →</span>
      </div>
    </div>

    <!-- Arena -->
    <div class="game-arena">
      <!-- Left zone (mobile only) -->
      <button
        id="simon-left-btn"
        class="side-btn left-btn md:hidden"
        @click="respond('left')"
      >
        <span class="side-btn-icon">←</span>
        <span class="side-btn-key">← Esq</span>
      </button>

      <!-- Centre stimulus -->
      <div class="stimulus-area">
        <!-- ITI: fixation cross -->
        <Transition name="fade">
          <div v-if="phase === 'iti'" class="fixation">+</div>
        </Transition>

        <!-- Stimulus: arrow at position -->
        <Transition name="arrow-pop">
          <div
            v-if="phase === 'running' && currentTrial"
            class="arrow-wrapper"
            :class="`pos-${currentTrial.position}`"
          >
            <div class="arrow-glyph">
              {{ currentTrial.direction === 'left' ? '←' : '→' }}
            </div>
          </div>
        </Transition>
      </div>

      <!-- Right zone (mobile only) -->
      <button
        id="simon-right-btn"
        class="side-btn right-btn md:hidden"
        @click="respond('right')"
      >
        <span class="side-btn-icon">→</span>
        <span class="side-btn-key">Dir →</span>
      </button>
    </div>
  </div>

  <!-- ── RESULTS SCREEN ────────────────────────────────────────────────────── -->
  <div v-else-if="phase === 'finished' && sessionResult" class="results-screen">
    <UContainer class="py-10 max-w-3xl">
      <div class="text-center space-y-2 mb-8">
        <div class="text-5xl mb-3">🧠</div>
        <h1 class="text-3xl font-bold text-primary">Resultados</h1>
        <p class="text-muted text-sm">Tarefa de Simon concluída</p>
      </div>

      <!-- Accuracy + simon effect banner -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <UCard class="text-center py-4">
          <p class="text-xs text-muted uppercase tracking-wide mb-1">Acurácia</p>
          <p class="text-3xl font-bold text-primary">{{ fmtPct(sessionResult.accuracy) }}</p>
          <p class="text-xs text-muted mt-1">{{ sessionResult.correctTrials }} / {{ sessionResult.totalTrials }} tentativas</p>
        </UCard>
        <UCard class="text-center py-4">
          <p class="text-xs text-muted uppercase tracking-wide mb-1">Efeito Simon</p>
          <p class="text-2xl font-bold" :class="sessionResult.simonEffect > 0 ? 'text-rose-400' : 'text-emerald-400'">
            {{ simonEffectLabel }}
          </p>
          <p class="text-xs text-muted mt-1">incongruente − congruente</p>
        </UCard>
      </div>

      <!-- RT table -->
      <UCard class="mb-6">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-clock" class="text-primary" />
            <h2 class="font-semibold">Tempo de Reação Médio por Condição</h2>
          </div>
        </template>

        <div class="overflow-x-auto">
          <table class="rt-table w-full text-sm">
            <thead>
              <tr>
                <th class="text-left">Condição</th>
                <th>Média (ms)</th>
                <th>Mediana (ms)</th>
                <th>Acertos</th>
                <th class="text-rose-500">Erros</th>
                <th class="text-amber-500">Omissões</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="dot dot-green" />Congruente</td>
                <td>{{ fmt(sessionResult.meanRT.congruent) }}</td>
                <td>{{ fmt(sessionResult.medianRT.congruent) }}</td>
                <td>{{ sessionResult.trials.filter(t => t.type === 'congruent' && t.correct).length }}</td>
                <td class="text-rose-500 font-medium">{{ sessionResult.errors.congruent }}</td>
                <td class="text-amber-500 font-medium">{{ sessionResult.misses.congruent }}</td>
              </tr>
              <tr>
                <td><span class="dot dot-slate" />Neutro</td>
                <td>{{ fmt(sessionResult.meanRT.neutral) }}</td>
                <td>{{ fmt(sessionResult.medianRT.neutral) }}</td>
                <td>{{ sessionResult.trials.filter(t => t.type === 'neutral' && t.correct).length }}</td>
                <td class="text-rose-500 font-medium">{{ sessionResult.errors.neutral }}</td>
                <td class="text-amber-500 font-medium">{{ sessionResult.misses.neutral }}</td>
              </tr>
              <tr>
                <td><span class="dot dot-red" />Incongruente</td>
                <td>{{ fmt(sessionResult.meanRT.incongruent) }}</td>
                <td>{{ fmt(sessionResult.medianRT.incongruent) }}</td>
                <td>{{ sessionResult.trials.filter(t => t.type === 'incongruent' && t.correct).length }}</td>
                <td class="text-rose-500 font-medium">{{ sessionResult.errors.incongruent }}</td>
                <td class="text-amber-500 font-medium">{{ sessionResult.misses.incongruent }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>

      <!-- Visual RT bar chart -->
      <UCard class="mb-6">
        <template #header>
          <h2 class="font-semibold">Comparação Visual</h2>
        </template>
        <div class="space-y-4 py-2">
          <div v-for="(cond, key) in { congruente: 'congruent', neutro: 'neutral', incongruente: 'incongruent' } as const" :key="key">
            <div class="flex items-center gap-3 mb-1">
              <span class="text-xs capitalize w-24 text-muted">{{ key }}</span>
              <div class="flex-1 h-5 rounded-full overflow-hidden bar-track">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :class="{
                    'bg-emerald-500': cond === 'congruent',
                    'bg-slate-400':   cond === 'neutral',
                    'bg-rose-500':    cond === 'incongruent',
                  }"
                  :style="{
                    width: sessionResult.meanRT[cond] > 0
                      ? `${Math.min((sessionResult.meanRT[cond] / 1200) * 100, 100)}%`
                      : '0%'
                  }"
                />
              </div>
              <span class="text-xs font-mono w-16 text-right">{{ fmt(sessionResult.meanRT[cond]) }}</span>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Actions -->
      <div class="flex gap-3 flex-wrap justify-center">
        <UButton icon="i-heroicons-arrow-path" color="primary" @click="handleStart">
          Jogar novamente
        </UButton>
        <UButton icon="i-heroicons-home" variant="soft" @click="reset">
          Voltar ao início
        </UButton>
        <UButton
          v-if="history.length > 1"
          icon="i-heroicons-clock"
          variant="soft"
          @click="showHistory = true"
        >
          Histórico
        </UButton>
      </div>
    </UContainer>
  </div>

  <!-- ── HISTORY MODAL ─────────────────────────────────────────────────────── -->
  <UModal v-model:open="showHistory">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-clock" class="text-primary" />
              <h3 class="font-semibold">Histórico de Sessões</h3>
            </div>
            <UButton
              v-if="history.length > 0"
              variant="ghost"
              color="red"
              size="xs"
              icon="i-heroicons-trash"
              @click="clearHistory"
            >Limpar</UButton>
          </div>
        </template>

        <div v-if="history.length === 0" class="text-center text-muted py-8 text-sm">
          Nenhuma sessão concluída ainda.
        </div>
        <div v-else class="space-y-3 max-h-96 overflow-y-auto pr-1">
          <div
            v-for="(rec, i) in history"
            :key="i"
            class="history-card rounded-lg p-3 text-sm space-y-1"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium">Sessão {{ fmtDate(rec.completedAt) }}</span>
              <span class="text-xs text-muted">{{ fmtPct(rec.accuracy) }} acurácia</span>
            </div>
            <div class="flex gap-4 text-xs text-muted flex-wrap">
              <span>Congruente: <strong class="text-emerald-400">{{ fmt(rec.meanRT.congruent) }}</strong></span>
              <span>Neutro: <strong class="text-slate-300">{{ fmt(rec.meanRT.neutral) }}</strong></span>
              <span>Incongruente: <strong class="text-rose-400">{{ fmt(rec.meanRT.incongruent) }}</strong></span>
              <span>Efeito Simon: <strong>{{ Math.round(rec.simonEffect) }} ms</strong></span>
            </div>
          </div>
        </div>

        <template #footer>
          <UButton variant="soft" block @click="showHistory = false">Fechar</UButton>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<style scoped>
/*
  Theme-aware design: uses CSS vars so both light and dark modes work.
  --simon-bg-*         : game/results background
  --simon-border       : subtle separator colour
  --simon-topbar-bg    : semi-transparent topbar
  --simon-fg-label     : muted label text
  --simon-fg-value     : strong value text
  --simon-side-bg      : side button background
  --simon-side-border  : side button separator
  --simon-side-fg      : side button icon colour
  --simon-fixation     : fixation cross colour
  --simon-bar-track    : RT bar track
*/

/* ── Hide site chrome during gameplay ────────────────────────── */
/* body class is toggled by the phase watcher – no layout remount */
:global(body.simon-playing header),
:global(body.simon-playing footer),
:global(body.simon-playing nav) {
  display: none !important;
}

/* ── Dark defaults ───────────────────────────────────────────── */
:root {
  --simon-bg-start:    hsl(230 25% 10%);
  --simon-bg-end:      hsl(230 30% 5%);
  --simon-res-start:   hsl(230 25% 12%);
  --simon-res-end:     hsl(230 30% 6%);
  --simon-topbar-bg:   rgba(0,0,0,0.15);
  --simon-border:      rgba(0,0,0,0.15);
  --simon-fg-label:    rgba(255,255,255,0.4);
  --simon-fg-value:    rgba(255,255,255,0.9);
  --simon-side-bg:     rgba(255,255,255,0.03);
  --simon-side-hover:  rgba(255,255,255,0.07);
  --simon-side-active: rgba(255,255,255,0.12);
  --simon-side-border: rgba(255,255,255,0.07);
  --simon-side-fg:     rgba(255,255,255,0.3);
  --simon-side-fg-hov: rgba(255,255,255,0.6);
  --simon-fixation:    rgba(255,255,255,0.3);
  --simon-bar-track:   rgba(255,255,255,0.08);
  --simon-table-th:    rgba(255,255,255,0.45);
  --simon-table-line:  rgba(255,255,255,0.07);
  --simon-kbd-border:  rgba(255,255,255,0.25);
  --simon-kbd-bg:      rgba(255,255,255,0.08);
  --simon-history-bg:  rgba(255,255,255,0.04);
  --simon-history-bdr: rgba(255,255,255,0.1);
}

/* ── Light overrides ─────────────────────────────────────────── */
.light {
  --simon-bg-start:    hsl(220 30% 96%);
  --simon-bg-end:      hsl(220 25% 92%);
  --simon-res-start:   hsl(220 30% 95%);
  --simon-res-end:     hsl(220 25% 90%);
  --simon-topbar-bg:   rgba(255,255,255,0.6);
  --simon-border:      rgba(0,0,0,0.08);
  --simon-fg-label:    rgba(0,0,0,0.45);
  --simon-fg-value:    rgba(0,0,0,0.85);
  --simon-side-bg:     rgba(0,0,0,0.02);
  --simon-side-hover:  rgba(0,0,0,0.05);
  --simon-side-active: rgba(0,0,0,0.1);
  --simon-side-border: rgba(0,0,0,0.07);
  --simon-side-fg:     rgba(0,0,0,0.25);
  --simon-side-fg-hov: rgba(0,0,0,0.55);
  --simon-fixation:    rgba(0,0,0,0.3);
  --simon-bar-track:   rgba(0,0,0,0.06);
  --simon-table-th:    rgba(0,0,0,0.45);
  --simon-table-line:  rgba(0,0,0,0.07);
  --simon-kbd-border:  rgba(0,0,0,0.2);
  --simon-kbd-bg:      rgba(0,0,0,0.05);
  --simon-history-bg:  rgba(0,0,0,0.03);
  --simon-history-bdr: rgba(0,0,0,0.1);
}

/* ── Game screen ─────────────────────────────────────────────── */
.game-screen {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: radial-gradient(ellipse at center, var(--simon-bg-start) 0%, var(--simon-bg-end) 100%);
  user-select: none;
  z-index: 100000;
}

.game-topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: var(--simon-topbar-bg);
  border-bottom: 1px solid var(--simon-border);
}

.topbar-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--simon-fg-label);
  display: block;
}
.topbar-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--simon-fg-value);
}
.topbar-item { min-width: 80px; }

.progress-bar-wrap {
  flex: 1;
  height: 6px;
  background: var(--simon-bar-track);
  border-radius: 3px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, hsl(213 97% 62%), hsl(280 80% 65%));
  border-radius: 3px;
  transition: width 1s linear;
}

/* ── Arena ───────────────────────────────────────────────────── */
.game-arena {
  flex: 1;
  display: flex;
  align-items: stretch;
  position: relative;
  overflow: hidden;
}

/* Side buttons – shown only on mobile (md:hidden via Tailwind) */
.side-btn {
  flex: 0 0 22%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--simon-side-bg);
  border: none;
  border-top: none;
  cursor: pointer;
  transition: background 0.15s;
  color: var(--simon-side-fg);
}
.side-btn:hover  { background: var(--simon-side-hover);  }
.side-btn:active { background: var(--simon-side-active); }
.left-btn  { border-right: 1px solid var(--simon-side-border); }
.right-btn { border-left:  1px solid var(--simon-side-border); }

.side-btn-icon {
  font-size: 3rem;
  line-height: 1;
  color: var(--simon-side-fg);
  transition: color 0.15s;
}
.side-btn-key {
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.side-btn:hover .side-btn-icon { color: var(--simon-side-fg-hov); }

/* ── Stimulus area ───────────────────────────────────────────── */
.stimulus-area {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fixation {
  position: absolute;
  font-size: 3rem;
  font-weight: 300;
  color: var(--simon-fixation);
  line-height: 1;
}

/* Arrow positioning within stimulus area */
.arrow-wrapper {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.pos-left   { justify-content: flex-start; padding-left: 12%; }
.pos-center { justify-content: center; }
.pos-right  { justify-content: flex-end; padding-right: 12%; }

.arrow-glyph {
  font-size: clamp(5rem, 14vw, 10rem);
  line-height: 1;
  font-weight: 900;
  filter: drop-shadow(0 0 40px currentColor);
  /* Single uniform colour – position/direction are the only cues */
  color: hsl(213 80% 62%);
}

/* ── Arrow transitions ────────────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

.arrow-pop-enter-active { transition: opacity 0.08s, transform 0.08s; }
.arrow-pop-leave-active { transition: opacity 0.12s, transform 0.12s; }
.arrow-pop-enter-from   { opacity: 0; transform: scale(0.7); }
.arrow-pop-leave-to     { opacity: 0; transform: scale(1.1); }

/* ── Results screen ──────────────────────────────────────────── */
.results-screen {
  min-height: 100vh;
  background: radial-gradient(ellipse at top, var(--simon-res-start) 0%, var(--simon-res-end) 100%);
}

/* RT bar track */
.bar-track { background: var(--simon-bar-track); }

/* RT table */
.rt-table th, .rt-table td {
  padding: 10px 12px;
  text-align: center;
}
.rt-table th {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--simon-table-th);
  border-bottom: 1px solid var(--simon-table-line);
}
.rt-table td:first-child { text-align: left; }
.rt-table tbody tr { border-bottom: 1px solid var(--simon-table-line); }
.rt-table tbody tr:last-child { border-bottom: none; }

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}
.dot-green { background: hsl(152 70% 50%); }
.dot-slate { background: hsl(220 20% 55%); }
.dot-red   { background: hsl(350 80% 58%); }

/* History card */
.history-card {
  background: var(--simon-history-bg);
  border: 1px solid var(--simon-history-bdr);
}

/* kbd style */
:global(kbd.kbd) {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid var(--simon-kbd-border);
  background: var(--simon-kbd-bg);
  font-family: monospace;
  font-size: 0.85em;
}
</style>
