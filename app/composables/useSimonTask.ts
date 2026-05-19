/**
 * useSimonTask – composable for the Spatial Stroop / Simon task simulation.
 *
 * Trial types
 *  - congruent   : arrow points left and appears on the LEFT  side, OR
 *                  arrow points right and appears on the RIGHT side.
 *  - incongruent : arrow points left and appears on the RIGHT side, OR
 *                  arrow points right and appears on the LEFT  side.
 *  - neutral     : arrow appears in the CENTRE (direction still matters).
 *
 * Measurement: reaction time (ms) from stimulus onset to key/click response.
 */

export type ArrowDirection = 'left' | 'right'
export type Position       = 'left' | 'center' | 'right'
export type TrialType      = 'congruent' | 'incongruent' | 'neutral'
export type Phase          = 'idle' | 'practice' | 'running' | 'iti' | 'finished'

export interface Trial {
  id: number
  direction: ArrowDirection
  position:  Position
  type:      TrialType
  /** timestamp when the stimulus was shown (performance.now()) */
  stimulusOnset: number
  /** reaction time in ms; null if not yet responded */
  reactionTime: number | null
  /** whether the response was correct */
  correct: boolean | null
}

export interface SessionResult {
  completedAt: string
  totalTrials: number
  correctTrials: number
  accuracy: number
  errors:  { congruent: number; incongruent: number; neutral: number }
  misses:  { congruent: number; incongruent: number; neutral: number }
  meanRT:  { congruent: number; incongruent: number; neutral: number }
  medianRT:{ congruent: number; incongruent: number; neutral: number }
  simonEffect: number
  trials: Trial[]
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function median(arr: number[]): number {
  if (arr.length === 0) return 0
  const s = [...arr].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 === 0 ? (s[m - 1]! + s[m]!) / 2 : s[m]!
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

/** Deterministic pseudo-random – Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

/**
 * Build a balanced block of trials.
 * Each block = 6 × [congruent-L, congruent-R, incongruent-L, incongruent-R, neutral-L, neutral-R]
 * (12 congruent, 12 incongruent, 12 neutral per block of 36 = balanced 1:1:1 ratio)
 * Total duration target ≈ 4 min
 * ISI 400 ms fixed + stimulus 1 000 ms = 1.4 s per trial → 4 min ≈ 171 trials → ~5 blocks of 36 = 180 trials
 */
function buildTrialList(count: number): Omit<Trial, 'id' | 'stimulusOnset' | 'reactionTime' | 'correct'>[] {
  const template: Omit<Trial, 'id' | 'stimulusOnset' | 'reactionTime' | 'correct'>[] = [
    { direction: 'left',  position: 'left',   type: 'congruent'   },
    { direction: 'right', position: 'right',  type: 'congruent'   },
    { direction: 'left',  position: 'right',  type: 'incongruent' },
    { direction: 'right', position: 'left',   type: 'incongruent' },
    { direction: 'left',  position: 'center', type: 'neutral'     },
    { direction: 'right', position: 'center', type: 'neutral'     },
  ]
  const blocks: typeof template = []
  const blocksNeeded = Math.ceil(count / template.length)
  for (let b = 0; b < blocksNeeded; b++) {
    blocks.push(...shuffle(template))
  }
  return blocks.slice(0, count)
}

// ─── composable ──────────────────────────────────────────────────────────────

export const useSimonTask = () => {
  // ── config ────────────────────────────────────────────────────────────────
  /** Total session duration in milliseconds (4 minutes) */
  const SESSION_DURATION_MS = 4 * 60 * 1000
  /** How long the fixation cross / blank inter-trial interval is shown (ms) */
  const ITI_DURATION_MS = 600
  /** How long the arrow stimulus is shown before auto-advancing (ms) */
  const STIMULUS_DURATION_MS = 1200
  /** Total trials (≈ 4 min with ~1.8 s per trial) */
  const TOTAL_TRIALS = 120

  // ── state ─────────────────────────────────────────────────────────────────
  const phase            = ref<Phase>('idle')
  const currentTrial     = ref<Trial | null>(null)
  const trials           = ref<Trial[]>([])
  const trialIndex       = ref(0)
  const sessionResult    = ref<SessionResult | null>(null)
  const history          = ref<SessionResult[]>([])

  const STORAGE_KEY = 'simon-task-history'

  const loadHistory = () => {
    if (typeof window === 'undefined') return
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      history.value = stored ? JSON.parse(stored) : []
    } catch {
      history.value = []
    }
  }

  const saveHistory = () => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
  }

  /** Elapsed seconds for the progress bar */
  const elapsed          = ref(0)
  const progress         = computed(() => Math.min(elapsed.value / (SESSION_DURATION_MS / 1000), 1))

  // ── timers ────────────────────────────────────────────────────────────────
  let sessionTimer: ReturnType<typeof setTimeout> | null = null
  let elapsedTimer: ReturnType<typeof setInterval> | null = null
  let phaseTimer:   ReturnType<typeof setTimeout> | null = null
  let trialList:    ReturnType<typeof buildTrialList> = []

  function clearTimers() {
    if (sessionTimer) clearTimeout(sessionTimer)
    if (elapsedTimer) clearInterval(elapsedTimer)
    if (phaseTimer)   clearTimeout(phaseTimer)
    sessionTimer = elapsedTimer = phaseTimer = null
  }

  // ── trial flow ────────────────────────────────────────────────────────────

  function startITI() {
    phase.value = 'iti'
    phaseTimer = setTimeout(showStimulus, ITI_DURATION_MS)
  }

  function showStimulus() {
    if (trialIndex.value >= trialList.length) {
      endSession()
      return
    }

    const template = trialList[trialIndex.value]!
    const trial: Trial = {
      ...template,
      id: trialIndex.value,
      stimulusOnset: performance.now(),
      reactionTime: null,
      correct: null,
    }
    currentTrial.value = trial
    trials.value.push(trial)
    phase.value = 'running'

    // Auto-advance if no response after stimulus duration
    phaseTimer = setTimeout(() => {
      if (trial.reactionTime === null) {
        trial.correct = false
      }
      trialIndex.value++
      startITI()
    }, STIMULUS_DURATION_MS)
  }

  function respond(direction: ArrowDirection) {
    if (phase.value !== 'running' || !currentTrial.value) return

    const trial = currentTrial.value
    if (trial.reactionTime !== null) return   // already responded

    const rt = performance.now() - trial.stimulusOnset
    trial.reactionTime = rt
    trial.correct = direction === trial.direction

    if (phaseTimer) clearTimeout(phaseTimer)
    phaseTimer = null

    trialIndex.value++
    startITI()
  }

  // ── session controls ──────────────────────────────────────────────────────

  function startSession() {
    clearTimers()
    trialList     = buildTrialList(TOTAL_TRIALS)
    trials.value  = []
    trialIndex.value = 0
    elapsed.value = 0
    sessionResult.value = null
    phase.value = 'running'

    // Session-level timer (ends at SESSION_DURATION_MS regardless of trial count)
    sessionTimer = setTimeout(endSession, SESSION_DURATION_MS)

    // Elapsed counter
    elapsedTimer = setInterval(() => { elapsed.value++ }, 1000)

    startITI()
  }

  function endSession() {
    clearTimers()
    currentTrial.value = null
    phase.value = 'finished'

    // Compute results only from answered, correct trials (exclude misses)
    const answered = trials.value.filter(t => t.reactionTime !== null && t.correct)

    const rtByType = (type: TrialType) =>
      answered.filter(t => t.type === type).map(t => t.reactionTime as number)

    const congruentRTs   = rtByType('congruent')
    const incongruentRTs = rtByType('incongruent')
    const neutralRTs     = rtByType('neutral')

    // errors = responded but wrong; misses = no response within window
    const errsByType = (type: TrialType) =>
      trials.value.filter(t => t.type === type && t.reactionTime !== null && t.correct === false).length
    const missByType = (type: TrialType) =>
      trials.value.filter(t => t.type === type && t.reactionTime === null).length

    const result: SessionResult = {
      completedAt: new Date().toISOString(),
      totalTrials: trials.value.length,
      correctTrials: answered.length,
      accuracy: trials.value.length > 0
        ? answered.length / trials.value.length
        : 0,
      errors: {
        congruent:   errsByType('congruent'),
        incongruent: errsByType('incongruent'),
        neutral:     errsByType('neutral'),
      },
      misses: {
        congruent:   missByType('congruent'),
        incongruent: missByType('incongruent'),
        neutral:     missByType('neutral'),
      },
      meanRT: {
        congruent:   mean(congruentRTs),
        incongruent: mean(incongruentRTs),
        neutral:     mean(neutralRTs),
      },
      medianRT: {
        congruent:   median(congruentRTs),
        incongruent: median(incongruentRTs),
        neutral:     median(neutralRTs),
      },
      simonEffect: mean(incongruentRTs) - mean(congruentRTs),
      trials: [...trials.value],
    }

    sessionResult.value = result
    history.value = [result, ...history.value].slice(0, 10)
    saveHistory()
  }

  function reset() {
    clearTimers()
    phase.value = 'idle'
    currentTrial.value = null
    trials.value = []
    trialIndex.value = 0
    elapsed.value = 0
    sessionResult.value = null
  }

  function clearHistory() {
    history.value = []
    saveHistory()
  }

  onMounted(loadHistory)
  onUnmounted(clearTimers)

  // ── derived display helpers ───────────────────────────────────────────────

  const formattedElapsed = computed(() => {
    const m = Math.floor(elapsed.value / 60).toString().padStart(2, '0')
    const s = (elapsed.value % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  })

  const formattedTotal = computed(() => {
    const totalSecs = SESSION_DURATION_MS / 1000
    const m = Math.floor(totalSecs / 60).toString().padStart(2, '0')
    const s = (totalSecs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  })

  return {
    // state
    phase,
    currentTrial,
    trials,
    sessionResult,
    history,
    progress,
    elapsed,
    formattedElapsed,
    formattedTotal,
    // actions
    startSession,
    endSession,
    respond,
    reset,
    clearHistory,
  }
}
