import { computed, reactive, ref } from 'vue'

export type BrodmannView = 'lateral' | 'medial'

export interface BrodmannPresetGroup {
  rotulo: string
  cor: string
  areas: number[]
}

export interface BrodmannPreset {
  nome: string
  nota: string
  grupos: BrodmannPresetGroup[]
}

export interface BrodmannTooltipState {
  visible: boolean
  ba: string
  nome: string
  x: number
  y: number
}

export const BRODMANN_PALETTE = ['#D92B2B', '#1B57A6', '#E08A00', '#157F5E', '#7B2D8E', '#0F7A8F']
export const BRODMANN_FADED_COLOR = '#E4E7EA'

// Divisão macroscópica por lobo, usada para agrupar a lista lateral de áreas.
export const BRODMANN_LOBES: Array<[string, number[]]> = [
  ['Frontal', [4, 6, 8, 9, 10, 11, 12, 44, 45, 46, 47]],
  ['Parietal', [1, 2, 3, 5, 7, 39, 40, 43]],
  ['Temporal', [20, 21, 22, 37, 38, 41, 42]],
  ['Occipital', [17, 18, 19]],
  ['Límbico e temporal medial', [23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]],
]

// Conjuntos prontos (presets) — cada um recolore um grupo de áreas com uma cor própria.
export const BRODMANN_PRESETS: BrodmannPreset[] = [
  {
    nome: 'Lobos corticais',
    nota: 'Divisão macroscópica de referência para situar as demais seleções.',
    grupos: [
      { rotulo: 'Frontal', cor: '#1B57A6', areas: [4, 6, 8, 9, 10, 11, 12, 44, 45, 46, 47] },
      { rotulo: 'Parietal', cor: '#157F5E', areas: [1, 2, 3, 5, 7, 39, 40, 43] },
      { rotulo: 'Temporal', cor: '#E08A00', areas: [20, 21, 22, 37, 38, 41, 42] },
      { rotulo: 'Occipital', cor: '#7B2D8E', areas: [17, 18, 19] },
      { rotulo: 'Límbico', cor: '#D92B2B', areas: [23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36] },
    ],
  },
  {
    nome: 'Linguagem',
    nota: 'Rede perissilviana esquerda. A correspondência entre área citoarquitetônica e função é aproximada.',
    grupos: [
      { rotulo: 'Broca', cor: '#D92B2B', areas: [44, 45] },
      { rotulo: 'Wernicke', cor: '#1B57A6', areas: [22] },
      { rotulo: 'Giro angular e supramarginal', cor: '#157F5E', areas: [39, 40] },
      { rotulo: 'Córtex auditivo', cor: '#E08A00', areas: [41, 42] },
    ],
  },
  {
    nome: 'Motor',
    nota: 'Do planejamento à execução, no sentido rostro-caudal.',
    grupos: [
      { rotulo: 'Motor primário (M1)', cor: '#D92B2B', areas: [4] },
      { rotulo: 'Pré-motor e motora suplementar', cor: '#E08A00', areas: [6] },
      { rotulo: 'Campos oculares frontais', cor: '#1B57A6', areas: [8] },
    ],
  },
  {
    nome: 'Somatossensorial',
    nota: 'Área 3 ocupa a parede do sulco central; 1 e 2, a crista e a face posterior do giro pós-central.',
    grupos: [
      { rotulo: 'Somatossensorial primário (S1)', cor: '#D92B2B', areas: [1, 2, 3] },
      { rotulo: 'Associativo parietal', cor: '#1B57A6', areas: [5, 7] },
      { rotulo: 'Gustativo (área subcentral)', cor: '#E08A00', areas: [43] },
    ],
  },
  {
    nome: 'Visual',
    nota: 'V1 concentra-se nas margens do sulco calcarino, visível sobretudo na vista medial.',
    grupos: [
      { rotulo: 'Visual primário (V1)', cor: '#D92B2B', areas: [17] },
      { rotulo: 'Visual secundário (V2)', cor: '#1B57A6', areas: [18] },
      { rotulo: 'Associativo (V3/V4/V5)', cor: '#157F5E', areas: [19] },
      { rotulo: 'Via ventral (fusiforme)', cor: '#E08A00', areas: [37] },
    ],
  },
  {
    nome: 'Auditivo',
    nota: 'Área 41 corresponde ao giro de Heschl, no plano supratemporal.',
    grupos: [
      { rotulo: 'Auditivo primário', cor: '#D92B2B', areas: [41] },
      { rotulo: 'Auditivo secundário', cor: '#E08A00', areas: [42] },
      { rotulo: 'Associativo auditivo', cor: '#1B57A6', areas: [22] },
    ],
  },
  {
    nome: 'Pré-frontal',
    nota: 'Subdivisões dorsolateral, polar, orbital e medial do córtex pré-frontal.',
    grupos: [
      { rotulo: 'Dorsolateral', cor: '#1B57A6', areas: [9, 46] },
      { rotulo: 'Frontopolar', cor: '#7B2D8E', areas: [10] },
      { rotulo: 'Orbitofrontal', cor: '#E08A00', areas: [11, 12, 47] },
      { rotulo: 'Cingulado anterior', cor: '#D92B2B', areas: [24, 32, 25] },
    ],
  },
  {
    nome: 'Funções executivas',
    nota: 'Circuito fronto-parietal de controle. Delimitação funcional aproximada, não citoarquitetônica.',
    grupos: [
      { rotulo: 'Pré-frontal dorsolateral', cor: '#1B57A6', areas: [9, 46] },
      { rotulo: 'Cingulado anterior dorsal', cor: '#D92B2B', areas: [24, 32] },
      { rotulo: 'Parietal posterior', cor: '#157F5E', areas: [7, 40] },
      { rotulo: 'Campos oculares frontais', cor: '#E08A00', areas: [8] },
    ],
  },
  {
    nome: 'Memória e lobo temporal medial',
    nota: 'Córtices peri-hipocampais, visíveis na vista medial.',
    grupos: [
      { rotulo: 'Entorrinal', cor: '#D92B2B', areas: [28, 34] },
      { rotulo: 'Perirrinal', cor: '#E08A00', areas: [35] },
      { rotulo: 'Para-hipocampal', cor: '#1B57A6', areas: [36, 27] },
      { rotulo: 'Temporal inferior', cor: '#157F5E', areas: [20] },
    ],
  },
  {
    nome: 'Cíngulo e retroesplenial',
    nota: 'Faixa límbica que circunda o corpo caloso.',
    grupos: [
      { rotulo: 'Cingulado anterior', cor: '#D92B2B', areas: [24, 32, 33] },
      { rotulo: 'Subgenual', cor: '#7B2D8E', areas: [25] },
      { rotulo: 'Cingulado posterior', cor: '#1B57A6', areas: [23, 31] },
      { rotulo: 'Retroesplenial', cor: '#157F5E', areas: [26, 29, 30] },
    ],
  },
  {
    nome: 'Rede de modo padrão',
    nota: 'Correspondência aproximada entre a rede descrita por neuroimagem funcional e as áreas de Brodmann.',
    grupos: [
      { rotulo: 'Pré-frontal medial', cor: '#D92B2B', areas: [10, 32, 24] },
      { rotulo: 'Cíngulo posterior e pré-cúneo', cor: '#1B57A6', areas: [23, 31, 7] },
      { rotulo: 'Parietal inferior', cor: '#157F5E', areas: [39] },
      { rotulo: 'Temporal lateral', cor: '#E08A00', areas: [21] },
    ],
  },
  {
    nome: 'Hierarquia cortical',
    nota: 'Gradiente de primário a paralímbico, na organização proposta por Mesulam.',
    grupos: [
      { rotulo: 'Primário', cor: '#D92B2B', areas: [4, 3, 1, 2, 17, 41] },
      { rotulo: 'Unimodal', cor: '#E08A00', areas: [6, 5, 18, 19, 42, 22, 37] },
      { rotulo: 'Heteromodal', cor: '#1B57A6', areas: [9, 10, 46, 45, 44, 39, 40, 7, 21] },
      { rotulo: 'Paralímbico', cor: '#7B2D8E', areas: [11, 12, 24, 25, 28, 32, 33, 34, 35, 36, 38] },
    ],
  },
]

// Nome e vistas (lateral/medial) disponíveis para cada área, extraídos do atlas original.
export const BRODMANN_AREA_NAMES: Record<string, string> = {
  '1': 'Córtex somatossensorial primário (S1)',
  '2': 'Córtex somatossensorial primário (S1)',
  '3': 'Córtex somatossensorial primário (S1)',
  '4': 'Córtex motor primário (M1)',
  '5': 'Córtex somatossensorial associativo (lóbulo parietal superior)',
  '6': 'Córtex pré-motor e área motora suplementar',
  '7': 'Córtex parietal associativo (pré-cúneo)',
  '8': 'Campos oculares frontais / pré-frontal dorsal',
  '9': 'Córtex pré-frontal dorsolateral',
  '10': 'Córtex frontopolar (pré-frontal anterior)',
  '11': 'Córtex orbitofrontal',
  '12': 'Córtex orbitofrontal medial',
  '17': 'Córtex visual primário (V1)',
  '18': 'Córtex visual secundário (V2)',
  '19': 'Córtex visual associativo (V3/V4/V5)',
  '20': 'Giro temporal inferior',
  '21': 'Giro temporal médio',
  '22': 'Giro temporal superior (área de Wernicke posterior)',
  '23': 'Córtex cingulado posterior ventral',
  '24': 'Córtex cingulado anterior ventral',
  '25': 'Área subgenual (cingulado subcaloso)',
  '26': 'Área ectoesplenial',
  '27': 'Área piriforme / pré-subículo',
  '28': 'Córtex entorrinal posterior',
  '29': 'Córtex retroesplenial granular',
  '30': 'Córtex retroesplenial agranular',
  '31': 'Córtex cingulado posterior dorsal',
  '32': 'Córtex cingulado anterior dorsal',
  '33': 'Área cingulada pregenual',
  '34': 'Córtex entorrinal anterior (uncus)',
  '35': 'Córtex perirrinal',
  '36': 'Córtex para-hipocampal (ectorrinal)',
  '37': 'Giro fusiforme / região temporo-occipital',
  '38': 'Polo temporal',
  '39': 'Giro angular',
  '40': 'Giro supramarginal',
  '41': 'Córtex auditivo primário (giro de Heschl)',
  '42': 'Córtex auditivo secundário',
  '43': 'Área subcentral (córtex gustativo primário)',
  '44': 'Pars opercularis (área de Broca)',
  '45': 'Pars triangularis (área de Broca)',
  '46': 'Córtex pré-frontal dorsolateral',
  '47': 'Pars orbitalis',
}

export const BRODMANN_AREA_VIEWS: Record<string, BrodmannView[]> = {
  '1': ['lateral', 'medial'],
  '2': ['lateral', 'medial'],
  '3': ['lateral', 'medial'],
  '4': ['lateral', 'medial'],
  '5': ['lateral', 'medial'],
  '6': ['lateral', 'medial'],
  '7': ['lateral', 'medial'],
  '8': ['lateral', 'medial'],
  '9': ['lateral', 'medial'],
  '10': ['lateral', 'medial'],
  '11': ['lateral', 'medial'],
  '12': ['medial'],
  '17': ['lateral', 'medial'],
  '18': ['lateral', 'medial'],
  '19': ['lateral', 'medial'],
  '20': ['lateral', 'medial'],
  '21': ['lateral'],
  '22': ['lateral'],
  '23': ['medial'],
  '24': ['medial'],
  '25': ['medial'],
  '26': ['medial'],
  '27': ['medial'],
  '28': ['medial'],
  '29': ['medial'],
  '30': ['medial'],
  '31': ['medial'],
  '32': ['medial'],
  '33': ['medial'],
  '34': ['medial'],
  '35': ['medial'],
  '36': ['medial'],
  '37': ['lateral', 'medial'],
  '38': ['lateral', 'medial'],
  '39': ['lateral'],
  '40': ['lateral'],
  '41': ['lateral'],
  '42': ['lateral'],
  '43': ['lateral'],
  '44': ['lateral'],
  '45': ['lateral'],
  '46': ['lateral'],
  '47': ['lateral'],
}

export interface BrodmannLegendChip {
  color: string
  label: string
  list: string
}

export type BrodmannLegendData =
  | { mode: 'empty' }
  | { mode: 'preset', title: string, note: string, chips: BrodmannLegendChip[] }
  | { mode: 'custom', title: string, note: string, chips: BrodmannLegendChip[] }
  | { mode: 'selection', chips: BrodmannLegendChip[] }

/** Grupo criado pelo usuário: mesmo formato de um grupo de preset, com id para edição. */
export interface BrodmannCustomGroup {
  id: number
  rotulo: string
  cor: string
  areas: string[]
}

export const BRODMANN_CUSTOM_TITLE = 'Conjunto personalizado'
export const BRODMANN_CUSTOM_NOTE = 'Grupos definidos por você: cada cor reúne as áreas escolhidas manualmente.'

/** Etapas do fluxo novo -> nome -> cor -> regiões -> finaliza. */
export type BrodmannBuilderStep = 'idle' | 'nome' | 'cor' | 'regioes'

/** Legenda no formato consumido por useBrodmannExport ao desenhar na imagem. */
export interface BrodmannExportLegend {
  title?: string
  note?: string
  chips: BrodmannLegendChip[]
}

function sortAreas(areas: string[]): string[] {
  return [...areas].sort((a, b) => Number(a) - Number(b))
}

export function useBrodmannAreas() {
  const selection = reactive(new Map<string, string>())
  const activeColor = ref(BRODMANN_PALETTE[0]!)
  const activePreset = ref(-1)
  const activeLegendPreset = ref<number | null>(null)
  const preview = ref<string | null>(null)
  const fadeUnselected = ref(true)
  const showLateral = ref(true)
  const showMedial = ref(true)
  const search = ref('')
  const lectureMode = ref(false)
  const includeLegend = ref(false)
  const tooltip = reactive<BrodmannTooltipState>({ visible: false, ba: '', nome: '', x: 0, y: 0 })

  // Conjunto montado pelo usuário — vive apenas em memória, nada é persistido.
  const customGroups = ref<BrodmannCustomGroup[]>([])
  const customTitle = ref(BRODMANN_CUSTOM_TITLE)
  const customNote = ref(BRODMANN_CUSTOM_NOTE)
  const builderStep = ref<BrodmannBuilderStep>('idle')
  const draftLabel = ref('')
  const draftColor = ref(BRODMANN_PALETTE[0]!)
  const draftAreas = reactive(new Set<string>())
  let nextCustomId = 1

  const selectionCount = computed(() => selection.size)

  const groupedAreas = computed(() => {
    const query = search.value.trim().toLowerCase()
    return BRODMANN_LOBES.map(([lobo, nums]) => {
      const items = nums
        .map(String)
        .filter(ba => BRODMANN_AREA_NAMES[ba])
        .map(ba => ({ ba, nome: BRODMANN_AREA_NAMES[ba]!, views: BRODMANN_AREA_VIEWS[ba] ?? [] }))
        .filter(item => !query || `${item.ba} ${item.nome}`.toLowerCase().includes(query))
      return { lobo, items }
    }).filter(group => group.items.length > 0)
  })

  const legendData = computed<BrodmannLegendData>(() => {
    if (customGroups.value.length > 0 || builderStep.value === 'regioes') {
      const chips: BrodmannLegendChip[] = customGroups.value.map(grupo => ({
        color: grupo.cor,
        label: grupo.rotulo,
        list: sortAreas(grupo.areas).join(' · '),
      }))
      if (builderStep.value === 'regioes') {
        chips.push({
          color: draftColor.value,
          label: draftLabel.value.trim() || 'Novo grupo',
          list: sortAreas([...draftAreas]).join(' · '),
        })
      }
      return {
        mode: 'custom',
        title: customTitle.value.trim(),
        note: customNote.value.trim(),
        chips,
      }
    }
    if (activeLegendPreset.value !== null) {
      const preset = BRODMANN_PRESETS[activeLegendPreset.value]!
      return {
        mode: 'preset',
        title: preset.nome,
        note: preset.nota,
        chips: preset.grupos.map(grupo => ({
          color: grupo.cor,
          label: grupo.rotulo,
          list: grupo.areas.map(String).filter(ba => BRODMANN_AREA_NAMES[ba]).join(' · '),
        })),
      }
    }
    if (selection.size > 0) {
      const nums = [...selection.keys()].map(Number).sort((a, b) => a - b)
      return {
        mode: 'selection',
        chips: nums.map(n => ({
          color: selection.get(String(n))!,
          label: String(n),
          list: BRODMANN_AREA_NAMES[String(n)] ?? '',
        })),
      }
    }
    return { mode: 'empty' }
  })

  function colorFor(ba: string): string | undefined {
    if (draftAreas.has(ba)) return draftColor.value
    if (preview.value === ba) return activeColor.value
    if (selection.has(ba)) return selection.get(ba)
    if (fadeUnselected.value && (selection.size > 0 || draftAreas.size > 0 || preview.value)) return BRODMANN_FADED_COLOR
    return undefined
  }

  function applyPreset(index: number) {
    customGroups.value = []
    resetBuilder()
    selection.clear()
    activePreset.value = index
    activeLegendPreset.value = index >= 0 ? index : null
    if (index >= 0) {
      BRODMANN_PRESETS[index]!.grupos.forEach((grupo) => {
        grupo.areas.forEach((n) => {
          const ba = String(n)
          if (BRODMANN_AREA_NAMES[ba]) selection.set(ba, grupo.cor)
        })
      })
    }
  }

  function togglePreset(index: number) {
    applyPreset(index === activePreset.value ? -1 : index)
  }

  function cyclePreset(direction: 1 | -1) {
    const total = BRODMANN_PRESETS.length
    applyPreset(((activePreset.value + direction) % total + total) % total)
  }

  function clearSelection() {
    applyPreset(-1)
  }

  function toggleArea(ba: string) {
    if (builderStep.value === 'regioes') {
      toggleDraftArea(ba)
      return
    }
    if (selection.has(ba)) selection.delete(ba)
    else selection.set(ba, activeColor.value)
    activePreset.value = -1
    activeLegendPreset.value = null
  }

  function setActiveColor(color: string) {
    activeColor.value = color
    if (activeLegendPreset.value === null && customGroups.value.length === 0 && selection.size) {
      for (const key of selection.keys()) selection.set(key, color)
    }
  }

  /** Reconstrói a seleção pintada a partir dos grupos do conjunto personalizado. */
  function syncCustomSelection() {
    activePreset.value = -1
    activeLegendPreset.value = null
    selection.clear()
    customGroups.value.forEach((grupo) => {
      grupo.areas.forEach(ba => selection.set(ba, grupo.cor))
    })
  }

  function resetBuilder() {
    builderStep.value = 'idle'
    draftLabel.value = ''
    draftAreas.clear()
  }

  /** Primeira cor da paleta ainda não usada por um grupo do conjunto. */
  function nextCustomColor(): string {
    const usadas = new Set(customGroups.value.map(grupo => grupo.cor))
    return BRODMANN_PALETTE.find(cor => !usadas.has(cor))
      ?? BRODMANN_PALETTE[customGroups.value.length % BRODMANN_PALETTE.length]!
  }

  function startCustomGroup() {
    // Uma seleção avulsa vira o ponto de partida do grupo (nada se perde);
    // um preset é descartado, já que preset e conjunto próprio se excluem.
    const herdadas = activeLegendPreset.value === null && customGroups.value.length === 0
      ? [...selection.keys()]
      : []
    syncCustomSelection()
    draftLabel.value = ''
    draftColor.value = nextCustomColor()
    draftAreas.clear()
    herdadas.forEach(ba => draftAreas.add(ba))
    builderStep.value = 'nome'
  }

  function confirmDraftLabel() {
    if (builderStep.value !== 'nome' || !draftLabel.value.trim()) return
    builderStep.value = 'cor'
  }

  function setDraftColor(color: string) {
    draftColor.value = color
  }

  function confirmDraftColor() {
    if (builderStep.value !== 'cor') return
    builderStep.value = 'regioes'
  }

  function goToBuilderStep(step: BrodmannBuilderStep) {
    if (builderStep.value === 'idle' || step === 'idle') return
    builderStep.value = step
  }

  function toggleDraftArea(ba: string) {
    if (draftAreas.has(ba)) draftAreas.delete(ba)
    else draftAreas.add(ba)
  }

  function finishCustomGroup() {
    if (builderStep.value !== 'regioes' || draftAreas.size === 0) return
    const areas = sortAreas([...draftAreas])
    // Uma área pertence a um grupo só: ao entrar no novo, sai do anterior.
    customGroups.value = customGroups.value
      .map(grupo => ({ ...grupo, areas: grupo.areas.filter(ba => !draftAreas.has(ba)) }))
      .filter(grupo => grupo.areas.length > 0)
    customGroups.value.push({
      id: nextCustomId++,
      rotulo: draftLabel.value.trim(),
      cor: draftColor.value,
      areas,
    })
    resetBuilder()
    syncCustomSelection()
  }

  function cancelCustomGroup() {
    resetBuilder()
  }

  function removeCustomGroup(id: number) {
    customGroups.value = customGroups.value.filter(grupo => grupo.id !== id)
    syncCustomSelection()
  }

  function clearCustomSet() {
    customGroups.value = []
    customTitle.value = BRODMANN_CUSTOM_TITLE
    customNote.value = BRODMANN_CUSTOM_NOTE
    resetBuilder()
    syncCustomSelection()
  }

  /** Marca da lista lateral: durante a construção reflete o rascunho. */
  function isAreaChecked(ba: string): boolean {
    return builderStep.value === 'regioes' ? draftAreas.has(ba) : selection.has(ba)
  }

  /** Legenda no formato do export; null quando não há nada destacado. */
  function exportLegend(): BrodmannExportLegend | null {
    const data = legendData.value
    if (data.mode === 'empty') return null
    if (data.mode === 'selection') return { chips: data.chips }
    return { title: data.title, note: data.note, chips: data.chips }
  }

  function setPreview(ba: string | null) {
    preview.value = ba
  }

  function showTooltip(ba: string, nome: string, x: number, y: number) {
    tooltip.visible = true
    tooltip.ba = ba
    tooltip.nome = nome
    tooltip.x = x
    tooltip.y = y
  }

  function hideTooltip() {
    tooltip.visible = false
  }

  function toggleLectureMode(force?: boolean) {
    lectureMode.value = force ?? !lectureMode.value
  }

  return {
    selection,
    activeColor,
    activePreset,
    activeLegendPreset,
    preview,
    fadeUnselected,
    showLateral,
    showMedial,
    search,
    lectureMode,
    includeLegend,
    tooltip,
    customGroups,
    customTitle,
    customNote,
    builderStep,
    draftLabel,
    draftColor,
    draftAreas,
    selectionCount,
    groupedAreas,
    legendData,
    colorFor,
    applyPreset,
    togglePreset,
    cyclePreset,
    clearSelection,
    toggleArea,
    isAreaChecked,
    startCustomGroup,
    confirmDraftLabel,
    setDraftColor,
    confirmDraftColor,
    goToBuilderStep,
    finishCustomGroup,
    cancelCustomGroup,
    removeCustomGroup,
    clearCustomSet,
    exportLegend,
    setActiveColor,
    setPreview,
    showTooltip,
    hideTooltip,
    toggleLectureMode,
  }
}

export type BrodmannStore = ReturnType<typeof useBrodmannAreas>
