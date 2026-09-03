import { readdirSync, existsSync } from 'node:fs'
import sharp from 'sharp'

function listDir(dir: string): string[] | string {
  try {
    if (!existsSync(dir)) return 'MISSING'
    return readdirSync(dir, { recursive: true } as never).slice(0, 60) as string[]
  }
  catch (e) {
    return `ERR ${(e as Error).message}`
  }
}

async function renderProbe(fontFamily: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="80"><rect width="100%" height="100%" fill="#fff"/><text x="10" y="50" font-family="${fontFamily}" font-size="40" fill="#000">Hamburg 123</text></svg>`
  try {
    const buf = await sharp(Buffer.from(svg)).png().toBuffer()
    const stats = await sharp(buf).stats()
    // Um PNG só com fundo branco tem desvio padrão ~0 no canal.
    return { bytes: buf.length, stdev: Number(stats.channels[0]?.stdev.toFixed(2)) }
  }
  catch (e) {
    return { error: (e as Error).message }
  }
}

export default defineEventHandler(async () => {
  const families = ['Helvetica, Arial, sans-serif', 'sans-serif', 'DejaVu Sans', 'Liberation Sans', 'Arial']
  const probes: Record<string, unknown> = {}
  for (const f of families) probes[f] = await renderProbe(f)

  return {
    platform: `${process.platform} ${process.arch}`,
    versions: sharp.versions,
    env: {
      FONTCONFIG_PATH: process.env.FONTCONFIG_PATH ?? null,
      FONTCONFIG_FILE: process.env.FONTCONFIG_FILE ?? null,
      LAMBDA_TASK_ROOT: process.env.LAMBDA_TASK_ROOT ?? null,
      cwd: process.cwd(),
    },
    fontDirs: {
      '/usr/share/fonts': listDir('/usr/share/fonts'),
      '/usr/local/share/fonts': listDir('/usr/local/share/fonts'),
      '/opt/fonts': listDir('/opt/fonts'),
      '/tmp/fonts': listDir('/tmp/fonts'),
    },
    probes,
  }
})
