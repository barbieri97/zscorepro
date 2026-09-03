import {
  BRODMANN_AREA_NAMES,
  BRODMANN_AREA_VIEWS,
  BRODMANN_PALETTE,
  BRODMANN_PRESETS,
} from '#shared/utils/brodmann'

/**
 * Metadados do atlas para quem for montar o JSON de /api/brodmann/export:
 * números de área válidos, em quais vistas cada um aparece, a paleta padrão
 * e os conjuntos prontos (presets) oferecidos na interface.
 */
export default defineEventHandler((event) => {
  applyPublicCors(event)

  const areas = Object.entries(BRODMANN_AREA_NAMES)
    .map(([ba, nome]) => ({ ba: Number(ba), nome, views: BRODMANN_AREA_VIEWS[ba] ?? [] }))
    .sort((a, b) => a.ba - b.ba)

  return {
    areas,
    palette: BRODMANN_PALETTE,
    presets: BRODMANN_PRESETS,
  }
})
