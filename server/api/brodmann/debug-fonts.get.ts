import sharp from 'sharp'

const F = 'Helvetica, Arial, sans-serif'
const TITLE_F = 'Georgia, "Times New Roman", serif'

/** stdev 0 => nada foi desenhado além do fundo branco. */
async function probe(inner: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="90"><rect width="100%" height="100%" fill="#fff"/>${inner}</svg>`
  try {
    const buf = await sharp(Buffer.from(svg)).png().toBuffer()
    const stats = await sharp(buf).stats()
    return Number(stats.channels[0]!.stdev.toFixed(2))
  }
  catch (e) {
    return `ERR ${(e as Error).message}`
  }
}

export default defineEventHandler(async () => {
  const cases: Record<string, string> = {
    'plain': `<text x="10" y="50" font-family="${F}" font-size="26" fill="#111827">Broca</text>`,
    'weight-600': `<text x="10" y="50" font-family="${F}" font-size="26" fill="#111827" font-weight="600">Broca</text>`,
    'weight-700': `<text x="10" y="50" font-family="${F}" font-size="26" fill="#111827" font-weight="700">Broca</text>`,
    'weight-bold': `<text x="10" y="50" font-family="${F}" font-size="26" fill="#111827" font-weight="bold">Broca</text>`,
    'with-tspan': `<text x="10" y="50" font-family="${F}" font-size="26" fill="#111827">Broca<tspan fill="#6B7280" dx="12">44 · 45</tspan></text>`,
    'title-font-as-emitted': `<text x="10" y="50" font-family="${TITLE_F}" font-size="34" fill="#111827">Linguagem</text>`,
    'title-font-escaped': `<text x="10" y="50" font-family="Georgia, &quot;Times New Roman&quot;, serif" font-size="34" fill="#111827">Linguagem</text>`,
    'serif-only': `<text x="10" y="50" font-family="serif" font-size="34" fill="#111827">Linguagem</text>`,
    'georgia-only': `<text x="10" y="50" font-family="Georgia" font-size="34" fill="#111827">Linguagem</text>`,
    'no-font-family': `<text x="10" y="50" font-size="26" fill="#111827">Broca</text>`,
  }

  const results: Record<string, unknown> = {}
  for (const [name, inner] of Object.entries(cases)) results[name] = await probe(inner)

  // Fim a fim: a legenda real, como renderBrodmannSvg a produz.
  const svg = renderBrodmannSvg(await loadBrodmannSvgSource('medial'), {
    groups: [{ label: 'V1', color: '#D92B2B', areas: ['17'] }],
    fadeUnselected: true,
    legend: true,
    title: 'Visual',
    note: 'Teste fim a fim.',
  })
  results['__legend_markup'] = svg.slice(svg.indexOf('<g><line'), svg.indexOf('<g><line') + 900)

  return results
})
