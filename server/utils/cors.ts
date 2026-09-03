import type { H3Event } from 'h3'

/** API pública e somente leitura: liberada para qualquer origem. */
export function applyPublicCors(event: H3Event) {
  setResponseHeaders(event, {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'Content-Type',
    'access-control-max-age': '86400',
  })
}
