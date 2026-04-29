export interface GameRecord {
  id: string;
  diskCount: number;
  moves: number;
  errors: number;
  durationSeconds: number;
  completedAt: string;
  optimal: number;
}

export interface Disk {
  id: number;
  size: number; // 1 = smallest, diskCount = largest
}

export type PegIndex = 0 | 1 | 2;

export const useTorreHanoi = () => {
  // ── Game state ──────────────────────────────────────────────────────────────
  const diskCount = ref<number>(5);
  const pegs = ref<Disk[][]>([[], [], []]);
  const moveCount = ref(0);
  const errorCount = ref(0);
  const isStarted = ref(false);
  const isCompleted = ref(false);
  const selectedPeg = ref<PegIndex | null>(null);

  // Animation state
  const errorPeg = ref<PegIndex | null>(null); // which peg shows error shake
  const isAnimatingError = ref(false);

  // Timer
  const elapsedSeconds = ref(0);
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  // History
  const STORAGE_KEY = 'torre-hanoi-history';
  const history = ref<GameRecord[]>([]);

  // ── Computed ────────────────────────────────────────────────────────────────
  const optimalMoves = computed(() => Math.pow(2, diskCount.value) - 1);

  const formattedTime = computed(() => {
    const m = Math.floor(elapsedSeconds.value / 60).toString().padStart(2, '0');
    const s = (elapsedSeconds.value % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  });

  // ── History persistence ─────────────────────────────────────────────────────
  const loadHistory = () => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      history.value = stored ? JSON.parse(stored) : [];
    } catch {
      history.value = [];
    }
  };

  const saveHistory = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value));
  };

  const clearHistory = () => {
    history.value = [];
    saveHistory();
  };

  // ── Timer ───────────────────────────────────────────────────────────────────
  const startTimer = () => {
    timerInterval = setInterval(() => {
      elapsedSeconds.value++;
    }, 1000);
  };

  const stopTimer = () => {
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  // ── Game init ────────────────────────────────────────────────────────────────
  const initGame = () => {
    stopTimer();
    pegs.value = [
      Array.from({ length: diskCount.value }, (_, i) => ({
        id: diskCount.value - i,
        size: diskCount.value - i,
      })),
      [],
      [],
    ];
    moveCount.value = 0;
    errorCount.value = 0;
    elapsedSeconds.value = 0;
    isCompleted.value = false;
    selectedPeg.value = null;
    errorPeg.value = null;
    isAnimatingError.value = false;
    isStarted.value = true;
    startTimer();
  };

  // ── Check win ────────────────────────────────────────────────────────────────
  const checkWin = () => {
    // Win when all disks are on peg 1 or 2 (not 0), fully stacked
    const peg1 = pegs.value[1] ?? [];
    const peg2 = pegs.value[2] ?? [];
    const disksInPeg1 = peg1.length === diskCount.value;
    const disksInPeg2 = peg2.length === diskCount.value;
    if (disksInPeg1 || disksInPeg2) {
      stopTimer();
      isCompleted.value = true;
      const record: GameRecord = {
        id: crypto.randomUUID(),
        diskCount: diskCount.value,
        moves: moveCount.value,
        errors: errorCount.value,
        durationSeconds: elapsedSeconds.value,
        completedAt: new Date().toISOString(),
        optimal: optimalMoves.value,
      };
      history.value.unshift(record);
      saveHistory();
    }
  };

  // ── Error animation ──────────────────────────────────────────────────────────
  const triggerError = (pegIdx: PegIndex) => {
    isAnimatingError.value = true;
    errorPeg.value = pegIdx;
    setTimeout(() => {
      isAnimatingError.value = false;
      errorPeg.value = null;
    }, 700);
  };

  // ── Move logic ───────────────────────────────────────────────────────────────
  const selectPeg = (pegIdx: PegIndex) => {
    if (!isStarted.value || isCompleted.value || isAnimatingError.value) return;

    if (selectedPeg.value === null) {
      // Select source peg — must have disks
      if ((pegs.value[pegIdx] ?? []).length === 0) return;
      selectedPeg.value = pegIdx;
      return;
    }

    // Same peg clicked — deselect
    if (selectedPeg.value === pegIdx) {
      selectedPeg.value = null;
      return;
    }

    const fromPeg = pegs.value[selectedPeg.value] ?? [];
    const toPeg = pegs.value[pegIdx] ?? [];
    const diskToMove = fromPeg[fromPeg.length - 1];

    if (!diskToMove) {
      selectedPeg.value = null;
      return;
    }

    // Validate: can't place larger disk on smaller
    const topOfTarget = toPeg[toPeg.length - 1];
    if (toPeg.length > 0 && topOfTarget !== undefined && topOfTarget.size < diskToMove.size) {
      // Error move
      errorCount.value++;
      moveCount.value++;
      triggerError(pegIdx);
      selectedPeg.value = null;
      return;
    }

    // Valid move
    const sourcePegIdx = selectedPeg.value;
    const newPegs = pegs.value.map((p) => [...p]);
    const sourcePeg = newPegs[sourcePegIdx];
    const destPeg = newPegs[pegIdx];
    if (!sourcePeg || !destPeg) {
      selectedPeg.value = null;
      return;
    }
    const moved = sourcePeg.pop();
    if (moved !== undefined) destPeg.push(moved);
    pegs.value = newPegs;
    moveCount.value++;
    selectedPeg.value = null;
    checkWin();
  };

  // ── Reset ─────────────────────────────────────────────────────────────────────
  const resetGame = () => {
    stopTimer();
    isStarted.value = false;
    isCompleted.value = false;
    selectedPeg.value = null;
    moveCount.value = 0;
    errorCount.value = 0;
    elapsedSeconds.value = 0;
    pegs.value = [[], [], []];
  };

  // ── Lifecycle ─────────────────────────────────────────────────────────────────
  onMounted(() => {
    loadHistory();
  });

  onUnmounted(() => {
    stopTimer();
  });

  return {
    diskCount,
    pegs,
    moveCount,
    errorCount,
    isStarted,
    isCompleted,
    selectedPeg,
    errorPeg,
    isAnimatingError,
    elapsedSeconds,
    formattedTime,
    optimalMoves,
    history,
    initGame,
    resetGame,
    selectPeg,
    clearHistory,
  };
};
