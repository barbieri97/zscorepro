import { BRODMANN_AREA_NAMES } from '#shared/utils/brodmann'
import type { BrodmannView } from '#shared/utils/brodmann'

const VALID_VIEWS = ['lateral', 'medial', 'both'] as const
const VALID_FORMATS = ['svg', 'png'] as const
const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

type ExportView = typeof VALID_VIEWS[number]
type ExportFormat = typeof VALID_FORMATS[number]

interface ParsedGroup {
  label: string
  color: string
  areas: string[]
}

interface ParsedBody {
  view: ExportView
  format: ExportFormat
  scale: number
  groups: ParsedGroup[]
  legend: boolean
  fadeUnselected: boolean
  title?: string
  note?: string
}

function badRequest(message: string): never {
  throw createError({ statusCode: 400, statusMessage: message })
}

function parseBody(body: unknown): ParsedBody {
  if (!body || typeof body !== 'object') badRequest('O corpo da requisição deve ser um objeto JSON.')
  const b = body as Record<string, unknown>

  const view = b.view ?? 'both'
  if (typeof view !== 'string' || !(VALID_VIEWS as readonly string[]).includes(view)) {
    badRequest(`"view" deve ser um de: ${VALID_VIEWS.join(', ')}.`)
  }

  const format = b.format ?? 'svg'
  if (typeof format !== 'string' || !(VALID_FORMATS as readonly string[]).includes(format)) {
    badRequest(`"format" deve ser um de: ${VALID_FORMATS.join(', ')}.`)
  }

  let scale = 2
  if (b.scale !== undefined) {
    scale = Number(b.scale)
    if (!Number.isFinite(scale) || scale < 1 || scale > 4) badRequest('"scale" deve ser um número entre 1 e 4.')
  }

  const rawGroups = b.groups
  if (rawGroups !== undefined && !Array.isArray(rawGroups)) badRequest('"groups" deve ser uma lista de grupos.')
  const groupsInput = (rawGroups ?? []) as unknown[]
  if (groupsInput.length > 12) badRequest('No máximo 12 grupos por requisição.')

  const seenAreas = new Set<string>()
  const groups: ParsedGroup[] = groupsInput.map((raw, index) => {
    if (!raw || typeof raw !== 'object') badRequest(`Grupo ${index}: deve ser um objeto com "label", "color" e "areas".`)
    const g = raw as Record<string, unknown>

    const label = typeof g.label === 'string' ? g.label.trim() : ''
    if (!label || label.length > 80) badRequest(`Grupo ${index}: "label" é obrigatório (texto de até 80 caracteres).`)

    const color = typeof g.color === 'string' ? g.color.trim() : ''
    if (!HEX_COLOR_RE.test(color)) badRequest(`Grupo ${index}: "color" deve ser um hexadecimal válido, ex.: "#D92B2B".`)

    if (!Array.isArray(g.areas) || g.areas.length === 0) {
      badRequest(`Grupo ${index}: "areas" deve ser uma lista não vazia com números de áreas de Brodmann (ex.: [44, 45]).`)
    }

    const areas = (g.areas as unknown[]).map((value) => {
      const num = Number(value)
      const ba = String(num)
      if (!Number.isInteger(num) || !BRODMANN_AREA_NAMES[ba]) {
        badRequest(`Grupo ${index}: "${value}" não é uma área de Brodmann válida.`)
      }
      if (seenAreas.has(ba)) {
        badRequest(`A área ${ba} aparece em mais de um grupo; cada área pertence a um único grupo, como na interface.`)
      }
      seenAreas.add(ba)
      return ba
    })

    return { label, color, areas }
  })

  const legend = b.legend === undefined ? groups.length > 0 : Boolean(b.legend)
  const fadeUnselected = b.fadeUnselected === undefined ? true : Boolean(b.fadeUnselected)
  const title = typeof b.title === 'string' ? b.title.trim().slice(0, 120) || undefined : undefined
  const note = typeof b.note === 'string' ? b.note.trim().slice(0, 400) || undefined : undefined

  return {
    view: view as ExportView,
    format: format as ExportFormat,
    scale,
    groups,
    legend,
    fadeUnselected,
    title,
    note,
  }
}

/**
 * API pública do atlas de Brodmann: recebe os mesmos dados que a interface
 * usa (grupos de áreas com rótulo e cor) e devolve as pranchas em SVG ou PNG,
 * com ou sem legenda — equivalente aos botões "SVG"/"PNG" da UI.
 */
export default defineEventHandler(async (event) => {
  applyPublicCors(event)

  const method = getMethod(event)
  if (method === 'OPTIONS') {
    setResponseStatus(event, 204)
    return null
  }
  if (method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Use POST com um corpo JSON para exportar as pranchas.' })
  }

  const body = await readBody(event)
  const parsed = parseBody(body)

  const views: BrodmannView[] = parsed.view === 'both' ? ['lateral', 'medial'] : [parsed.view as BrodmannView]

  const renderOptions = {
    groups: parsed.groups,
    fadeUnselected: parsed.fadeUnselected,
    legend: parsed.legend,
    title: parsed.title,
    note: parsed.note,
  }

  const svgByView: Partial<Record<BrodmannView, string>> = {}
  for (const view of views) {
    const source = await loadBrodmannSvgSource(view)
    svgByView[view] = renderBrodmannSvg(source, renderOptions)
  }

  if (parsed.format === 'svg') {
    if (views.length === 1) {
      const view = views[0]!
      setResponseHeader(event, 'content-type', 'image/svg+xml; charset=utf-8')
      setResponseHeader(event, 'content-disposition', `inline; filename="brodmann-${view}.svg"`)
      return svgByView[view]
    }
    setResponseHeader(event, 'content-type', 'application/json; charset=utf-8')
    return { lateral: svgByView.lateral, medial: svgByView.medial }
  }

  const pngByView: Partial<Record<BrodmannView, Buffer>> = {}
  for (const view of views) {
    pngByView[view] = await renderBrodmannPng(svgByView[view]!, parsed.scale)
  }

  if (views.length === 1) {
    const view = views[0]!
    setResponseHeader(event, 'content-type', 'image/png')
    setResponseHeader(event, 'content-disposition', `inline; filename="brodmann-${view}.png"`)
    return pngByView[view]
  }

  setResponseHeader(event, 'content-type', 'application/json; charset=utf-8')
  return {
    lateral: `data:image/png;base64,${pngByView.lateral!.toString('base64')}`,
    medial: `data:image/png;base64,${pngByView.medial!.toString('base64')}`,
  }
})
