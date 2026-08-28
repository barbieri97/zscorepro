import { onBeforeUnmount, onMounted, watchEffect, type Ref } from 'vue'
import type { BrodmannStore } from '~/composables/useBrodmannAreas'

/**
 * Liga uma prancha SVG (lateral ou medial) do atlas de Brodmann ao estado
 * compartilhado: pinta as áreas conforme a seleção/preview e delega clique,
 * hover e saída do mouse para o store.
 */
export function useBrodmannSvgInteractions(svgEl: Ref<SVGSVGElement | null>, store: BrodmannStore) {
  function paint() {
    const root = svgEl.value
    if (!root) return
    root.querySelectorAll<SVGPathElement>('path.area').forEach((el) => {
      const ba = el.dataset.ba ?? ''
      el.style.fill = store.colorFor(ba) ?? ''
    })
  }

  function findArea(target: EventTarget | null): SVGPathElement | null {
    if (!(target instanceof Element)) return null
    return target.closest('path.area')
  }

  function handleClick(event: MouseEvent) {
    const area = findArea(event.target)
    const ba = area?.dataset.ba
    if (!ba || ba === 'X') return
    store.toggleArea(ba)
  }

  function handleMouseMove(event: MouseEvent) {
    const area = findArea(event.target)
    if (!area) return
    store.showTooltip(area.dataset.ba ?? '', area.dataset.nome ?? '', event.clientX, event.clientY)
  }

  function handleMouseLeave() {
    store.hideTooltip()
  }

  onMounted(() => {
    const root = svgEl.value
    root?.addEventListener('click', handleClick)
    root?.addEventListener('mousemove', handleMouseMove)
    root?.addEventListener('mouseleave', handleMouseLeave)
  })

  onBeforeUnmount(() => {
    const root = svgEl.value
    root?.removeEventListener('click', handleClick)
    root?.removeEventListener('mousemove', handleMouseMove)
    root?.removeEventListener('mouseleave', handleMouseLeave)
  })

  watchEffect(paint, { flush: 'post' })
}
