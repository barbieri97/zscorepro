import sharp from 'sharp'
import { BRODMANN_FADED_COLOR } from '#shared/utils/brodmann'
import type { BrodmannView } from '#shared/utils/brodmann'

const LEGEND_FONT = 'Helvetica, Arial, sans-serif'
const LEGEND_TITLE_FONT = 'Georgia, "Times New Roman", serif'

export interface BrodmannApiGroup {
  label: string
  color: string
  areas: string[]
}

export interface BrodmannRenderOptions {
  groups: BrodmannApiGroup[]
  fadeUnselected: boolean
  legend: boolean
  title?: string
  note?: string
}

/**
 * Carrega a prancha SVG original (mesma usada pela UI) a partir dos server
 * assets — funciona tanto em dev quanto no bundle de produção do Nitro.
 */
export async function loadBrodmannSvgSource(view: BrodmannView): Promise<string> {
  // Em dev o asset volta como string (driver de fs); no bundle de produção,
  // como Uint8Array — daí a normalização para texto nos dois casos.
  const content = await useStorage('assets:server').getItem(`brodmann:${view}.svg`)
  if (typeof content === 'string') return content
  if (content instanceof Uint8Array) return new TextDecoder().decode(content)
  throw createError({ statusCode: 500, statusMessage: `Ativo SVG não encontrado para a vista "${view}".` })
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Pinta as áreas do SVG de acordo com os grupos recebidos, replicando colorFor() da UI. */
function paintSvg(source: string, colorByArea: Map<string, string>, fade: boolean): string {
  if (colorByArea.size === 0 && !fade) return source
  return source.replace(/<path\b([^>]*)>/g, (full, attrs: string) => {
    const baMatch = attrs.match(/data-ba="([^"]+)"/)
    if (!baMatch) return full
    const ba = baMatch[1]!

    // 'X' (região sem numeração) não pode ser selecionada, mas ainda é
    // esmaecida junto com o resto — mesmo comportamento de colorFor() na UI.
    const color = ba === 'X'
      ? (fade ? BRODMANN_FADED_COLOR : undefined)
      : (colorByArea.get(ba) ?? (fade ? BRODMANN_FADED_COLOR : undefined))
    if (!color) return full

    const newAttrs = /\bfill="[^"]*"/.test(attrs)
      ? attrs.replace(/\bfill="[^"]*"/, `fill="${color}"`)
      : `${attrs} fill="${color}"`
    return `<path${newAttrs}>`
  })
}

interface LegendMetrics {
  pad: number
  fs: number
  titleFs: number
  noteFs: number
  swatch: number
  gap: number
  lineH: number
  rowGap: number
  maxChars: number
}

function metricsFor(width: number): LegendMetrics {
  const pad = Math.round(width * 0.03)
  const fs = Math.max(16, Math.round(width / 46))
  const swatch = Math.round(fs * 1.1)
  const gap = Math.round(fs * 0.6)
  return {
    pad,
    fs,
    titleFs: Math.round(fs * 1.3),
    noteFs: Math.round(fs * 0.85),
    swatch,
    gap,
    lineH: Math.round(fs * 1.45),
    rowGap: Math.round(fs * 0.7),
    maxChars: Math.max(24, Math.floor((width - pad * 2 - swatch - gap) / (fs * 0.5))),
  }
}

function wrap(text: string, maxChars: number): string[] {
  if (!text) return []
  const lines: string[] = []
  let current = ''
  for (const word of text.split(' ')) {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxChars && current) {
      lines.push(current)
      current = word
    }
    else {
      current = next
    }
  }
  if (current) lines.push(current)
  return lines
}

function textEl(content: string, x: number, y: number, options: {
  size: number
  fill?: string
  font?: string
  weight?: string
  tail?: { fill: string, dx: number, content: string }
}): string {
  const attrs = [
    `x="${x}"`,
    `y="${y}"`,
    // Escapado porque a pilha do título traz aspas em 'Times New Roman'.
    `font-family="${escapeXml(options.font ?? LEGEND_FONT)}"`,
    `font-size="${options.size}"`,
    `fill="${options.fill ?? '#111827'}"`,
    options.weight ? `font-weight="${options.weight}"` : '',
  ].filter(Boolean).join(' ')
  const tail = options.tail
    ? `<tspan fill="${options.tail.fill}" dx="${options.tail.dx}">${escapeXml(options.tail.content)}</tspan>`
    : ''
  return `<text ${attrs}>${escapeXml(content)}${tail}</text>`
}

interface LegendChip {
  color: string
  label: string
  list: string
}

/** Desenha a legenda abaixo da prancha; devolve o markup e a altura ocupada. */
function drawLegend(title: string | undefined, note: string | undefined, chips: LegendChip[], x0: number, y0: number, width: number): { markup: string, height: number } {
  const m = metricsFor(width)
  const textX = x0 + m.pad + m.swatch + m.gap
  let y = y0 + m.pad
  const parts: string[] = []

  parts.push(`<line x1="${x0 + m.pad}" x2="${x0 + width - m.pad}" y1="${y}" y2="${y}" stroke="#D4D4D8" stroke-width="2"/>`)
  y += m.pad

  if (title) {
    y += m.titleFs
    parts.push(textEl(title, x0 + m.pad, y, { size: m.titleFs, font: LEGEND_TITLE_FONT }))
    y += Math.round(m.fs * 0.4)
  }

  if (note) {
    const noteChars = Math.floor((width - m.pad * 2) / (m.noteFs * 0.5))
    for (const line of wrap(note, noteChars)) {
      y += m.noteFs + Math.round(m.noteFs * 0.35)
      parts.push(textEl(line, x0 + m.pad, y, { size: m.noteFs, fill: '#6B7280' }))
    }
    y += Math.round(m.fs * 0.5)
  }

  for (const chip of chips) {
    const inline = chip.list && `${chip.label} — ${chip.list}`.length <= m.maxChars
    y += m.fs

    parts.push(`<rect x="${x0 + m.pad}" y="${Math.round(y - m.fs * 0.85)}" width="${m.swatch}" height="${m.swatch}" rx="${Math.round(m.swatch * 0.18)}" fill="${chip.color}" stroke="rgba(0,0,0,0.15)"/>`)

    if (inline) {
      parts.push(textEl(chip.label, textX, y, { size: m.fs, weight: '600', tail: { fill: '#6B7280', dx: Math.round(m.fs * 0.45), content: chip.list } }))
    }
    else {
      parts.push(textEl(chip.label, textX, y, { size: m.fs, weight: '600' }))
      for (const line of wrap(chip.list, m.maxChars)) {
        y += m.lineH
        parts.push(textEl(line, textX, y, { size: m.fs, fill: '#6B7280' }))
      }
    }
    y += m.rowGap
  }

  return { markup: `<g>${parts.join('')}</g>`, height: y - y0 + m.pad }
}

function sortAreas(areas: string[]): string[] {
  return [...areas].sort((a, b) => Number(a) - Number(b))
}

/**
 * Monta a prancha final: pinta as áreas conforme os grupos, injeta a legenda
 * (se solicitada) e devolve o SVG completo — equivalente ao que useBrodmannExport
 * gera a partir do DOM no navegador.
 */
export function renderBrodmannSvg(source: string, options: BrodmannRenderOptions): string {
  const colorByArea = new Map<string, string>()
  for (const group of options.groups) {
    for (const ba of group.areas) colorByArea.set(ba, group.color)
  }

  // Sem nenhuma área selecionada não há o que apagar — mesmo comportamento de
  // colorFor() na UI, que só esmaece quando há seleção, preset ou rascunho ativo.
  const fade = options.fadeUnselected && colorByArea.size > 0
  const painted = paintSvg(source, colorByArea, fade)

  const viewBoxMatch = painted.match(/viewBox="([^"]+)"/)
  const [minX, minY, width, height] = (viewBoxMatch?.[1] ?? '0 0 0 0').split(/\s+/).map(Number) as [number, number, number, number]

  const chips: LegendChip[] = options.groups
    .filter(group => group.areas.length > 0)
    .map(group => ({ color: group.color, label: group.label, list: sortAreas(group.areas).join(' · ') }))

  let svg = painted
  let totalHeight = height

  if (options.legend && chips.length > 0) {
    const { markup, height: legendHeight } = drawLegend(options.title, options.note, chips, minX, minY + height, width)
    totalHeight = height + legendHeight
    svg = svg.replace('</svg>', `${markup}</svg>`)
    svg = svg.replace(/viewBox="[^"]+"/, `viewBox="${minX} ${minY} ${width} ${totalHeight}"`)
  }

  svg = svg.replace(/<svg\b/, `<svg width="${width}" height="${totalHeight}"`)

  const background = `<rect width="100%" height="100%" fill="#FFFFFF"/>`
  svg = svg.replace(/(<svg\b[^>]*>)/, `$1${background}`)

  return svg
}

export async function renderBrodmannPng(svg: string, scale: number): Promise<Buffer> {
  await ensureBrodmannFonts()

  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/)
  const [, , width, height] = (viewBoxMatch?.[1] ?? '0 0 1000 1000').split(/\s+/).map(Number)
  const targetWidth = Math.max(1, Math.round((width ?? 1000) * scale))
  const targetHeight = Math.max(1, Math.round((height ?? 1000) * scale))

  return sharp(Buffer.from(svg), { density: 96 * scale })
    .resize(targetWidth, targetHeight, { fit: 'fill' })
    .png()
    .toBuffer()
}
