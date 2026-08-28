import type { BrodmannExportLegend } from './useBrodmannAreas'

const SVG_NS = 'http://www.w3.org/2000/svg'
const LEGEND_FONT = 'Helvetica, Arial, sans-serif'
const LEGEND_TITLE_FONT = 'Georgia, "Times New Roman", serif'

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
    // Largura de caractere estimada em ~0.5em; suficiente para quebrar as linhas
    // sem depender de medição de texto, que não existe fora do DOM renderizado.
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

function addText(parent: SVGGElement, content: string, x: number, y: number, options: {
  size: number
  fill?: string
  font?: string
  weight?: string
  italic?: boolean
}) {
  const el = document.createElementNS(SVG_NS, 'text')
  el.setAttribute('x', String(x))
  el.setAttribute('y', String(y))
  el.setAttribute('font-family', options.font ?? LEGEND_FONT)
  el.setAttribute('font-size', String(options.size))
  el.setAttribute('fill', options.fill ?? '#111827')
  if (options.weight) el.setAttribute('font-weight', options.weight)
  if (options.italic) el.setAttribute('font-style', 'italic')
  el.textContent = content
  parent.appendChild(el)
  return el
}

/**
 * Desenha a legenda logo abaixo da prancha e devolve a altura ocupada, para
 * que a viewBox do clone possa crescer o suficiente para acomodá-la.
 */
function drawLegend(clone: SVGSVGElement, legend: BrodmannExportLegend, x0: number, y0: number, width: number): number {
  const m = metricsFor(width)
  const g = document.createElementNS(SVG_NS, 'g')
  const textX = x0 + m.pad + m.swatch + m.gap
  let y = y0 + m.pad

  const rule = document.createElementNS(SVG_NS, 'line')
  rule.setAttribute('x1', String(x0 + m.pad))
  rule.setAttribute('x2', String(x0 + width - m.pad))
  rule.setAttribute('y1', String(y))
  rule.setAttribute('y2', String(y))
  rule.setAttribute('stroke', '#D4D4D8')
  rule.setAttribute('stroke-width', '2')
  g.appendChild(rule)
  y += m.pad

  if (legend.title) {
    y += m.titleFs
    addText(g, legend.title, x0 + m.pad, y, { size: m.titleFs, font: LEGEND_TITLE_FONT })
    y += Math.round(m.fs * 0.4)
  }

  if (legend.note) {
    const noteChars = Math.floor((width - m.pad * 2) / (m.noteFs * 0.5))
    for (const line of wrap(legend.note, noteChars)) {
      y += m.noteFs + Math.round(m.noteFs * 0.35)
      addText(g, line, x0 + m.pad, y, { size: m.noteFs, fill: '#6B7280' })
    }
    y += Math.round(m.fs * 0.5)
  }

  for (const chip of legend.chips) {
    const inline = chip.list && `${chip.label} — ${chip.list}`.length <= m.maxChars
    y += m.fs

    const rect = document.createElementNS(SVG_NS, 'rect')
    rect.setAttribute('x', String(x0 + m.pad))
    rect.setAttribute('y', String(Math.round(y - m.fs * 0.85)))
    rect.setAttribute('width', String(m.swatch))
    rect.setAttribute('height', String(m.swatch))
    rect.setAttribute('rx', String(Math.round(m.swatch * 0.18)))
    rect.setAttribute('fill', chip.color)
    rect.setAttribute('stroke', 'rgba(0,0,0,0.15)')
    g.appendChild(rect)

    const label = addText(g, chip.label, textX, y, { size: m.fs, weight: '600' })
    if (inline) {
      const tail = document.createElementNS(SVG_NS, 'tspan')
      tail.setAttribute('fill', '#6B7280')
      tail.setAttribute('dx', String(Math.round(m.fs * 0.45)))
      tail.textContent = chip.list
      label.appendChild(tail)
    }
    else {
      for (const line of wrap(chip.list, m.maxChars)) {
        y += m.lineH
        addText(g, line, textX, y, { size: m.fs, fill: '#6B7280' })
      }
    }
    y += m.rowGap
  }

  clone.appendChild(g)
  return y - y0 + m.pad
}

function cleanClone(svgEl: SVGSVGElement, legend?: BrodmannExportLegend | null): SVGSVGElement {
  const clone = svgEl.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', SVG_NS)

  const viewBox = svgEl.getAttribute('viewBox')?.split(/[ ,]+/).map(Number) ?? []
  const minX = viewBox[0] ?? 0
  const minY = viewBox[1] ?? 0
  const width = viewBox[2] ?? svgEl.clientWidth
  const height = viewBox[3] ?? svgEl.clientHeight

  let total = height
  if (legend && legend.chips.length > 0 && width && height) {
    total += drawLegend(clone, legend, minX, minY + height, width)
    clone.setAttribute('viewBox', `${minX} ${minY} ${width} ${total}`)
  }

  if (width && total) {
    clone.setAttribute('width', String(width))
    clone.setAttribute('height', String(total))
  }

  const background = document.createElementNS(SVG_NS, 'rect')
  background.setAttribute('width', '100%')
  background.setAttribute('height', '100%')
  background.setAttribute('fill', '#FFFFFF')
  clone.insertBefore(background, clone.firstChild)
  return clone
}

function download(filename: string, url: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export function exportBrodmannSvg(svgEl: SVGSVGElement, filename: string, legend?: BrodmannExportLegend | null) {
  const texto = new XMLSerializer().serializeToString(cleanClone(svgEl, legend))
  download(filename, URL.createObjectURL(new Blob([texto], { type: 'image/svg+xml' })))
}

export function exportBrodmannPng(svgEl: SVGSVGElement, filename: string, legend?: BrodmannExportLegend | null, scale = 2) {
  const texto = new XMLSerializer().serializeToString(cleanClone(svgEl, legend))
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width * scale
    canvas.height = img.height * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (blob) download(filename, URL.createObjectURL(blob))
    })
  }
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(texto)}`
}
