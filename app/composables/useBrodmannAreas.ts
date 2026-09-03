import { computed, reactive, ref } from 'vue'
import {
  BRODMANN_AREA_NAMES,
  BRODMANN_AREA_VIEWS,
  BRODMANN_CUSTOM_NOTE,
  BRODMANN_CUSTOM_TITLE,
  BRODMANN_FADED_COLOR,
  BRODMANN_LOBES,
  BRODMANN_PALETTE,
  BRODMANN_PRESETS,
} from '#shared/utils/brodmann'
import type { BrodmannLegendChip, BrodmannPreset, BrodmannPresetGroup, BrodmannView } from '#shared/utils/brodmann'

// Reexportados para não quebrar os componentes que hoje importam esses
// símbolos a partir deste composable; a fonte de verdade vive em shared/.
export {
  BRODMANN_AREA_NAMES,
  BRODMANN_AREA_VIEWS,
  BRODMANN_CUSTOM_NOTE,
  BRODMANN_CUSTOM_TITLE,
  BRODMANN_FADED_COLOR,
  BRODMANN_LOBES,
  BRODMANN_PALETTE,
  BRODMANN_PRESETS,
}
export type { BrodmannLegendChip, BrodmannPreset, BrodmannPresetGroup, BrodmannView }

export interface BrodmannTooltipState {
  visible: boolean
  ba: string
  nome: string
  x: number
  y: number
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
