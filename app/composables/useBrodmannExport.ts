const SVG_NS = 'http://www.w3.org/2000/svg'

function cleanClone(svgEl: SVGSVGElement): SVGSVGElement {
  const clone = svgEl.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', SVG_NS)
  const viewBox = svgEl.getAttribute('viewBox')?.split(/[ ,]+/) ?? []
  if (viewBox[2] && viewBox[3]) {
    clone.setAttribute('width', viewBox[2])
    clone.setAttribute('height', viewBox[3])
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

export function exportBrodmannSvg(svgEl: SVGSVGElement, filename: string) {
  const texto = new XMLSerializer().serializeToString(cleanClone(svgEl))
  download(filename, URL.createObjectURL(new Blob([texto], { type: 'image/svg+xml' })))
}

export function exportBrodmannPng(svgEl: SVGSVGElement, filename: string, scale = 2) {
  const texto = new XMLSerializer().serializeToString(cleanClone(svgEl))
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
