import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * O runtime serverless não traz nenhuma fonte instalada: sem isso o sharp
 * rasteriza as pranchas sem o texto da legenda. As faces Liberation viajam
 * junto com o bundle (server assets), são gravadas no diretório temporário
 * e apresentadas ao fontconfig antes da primeira rasterização.
 *
 * Liberation Sans e Serif são metricamente compatíveis com Arial e Times New
 * Roman, então os mesmos font-family do SVG resolvem para as faces corretas.
 */
const FONT_FILES = [
  'LiberationSans-Regular.ttf',
  'LiberationSans-Bold.ttf',
  'LiberationSerif-Regular.ttf',
]

function fontsConf(dir: string, cacheDir: string): string {
  const alias = (from: string, to: string) =>
    `<alias><family>${from}</family><prefer><family>${to}</family></prefer></alias>`

  return `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig>
  <dir>${dir}</dir>
  <cachedir>${cacheDir}</cachedir>
  ${alias('Helvetica', 'Liberation Sans')}
  ${alias('Arial', 'Liberation Sans')}
  ${alias('sans-serif', 'Liberation Sans')}
  ${alias('Georgia', 'Liberation Serif')}
  ${alias('Times New Roman', 'Liberation Serif')}
  ${alias('serif', 'Liberation Serif')}
</fontconfig>
`
}

let ready: Promise<void> | undefined

async function setupFonts(): Promise<void> {
  const dir = join(tmpdir(), 'zscorepro-brodmann-fonts')
  const cacheDir = join(dir, 'cache')
  mkdirSync(cacheDir, { recursive: true })

  const storage = useStorage('assets:server')
  for (const file of FONT_FILES) {
    const target = join(dir, file)
    if (existsSync(target)) continue
    // getItemRaw: em dev o driver de fs devolveria texto e corromperia o TTF.
    const data = await storage.getItemRaw(`fonts:${file}`)
    if (!data) {
      throw createError({ statusCode: 500, statusMessage: `Fonte "${file}" não encontrada nos server assets.` })
    }
    writeFileSync(target, Buffer.from(data as Uint8Array))
  }

  const confPath = join(dir, 'fonts.conf')
  writeFileSync(confPath, fontsConf(dir, cacheDir))

  // Precisa valer antes de o fontconfig inicializar, o que só acontece na
  // primeira vez que o libvips desenha texto.
  process.env.FONTCONFIG_FILE = confPath
  process.env.FONTCONFIG_PATH = dir
}

export function ensureBrodmannFonts(): Promise<void> {
  ready ??= setupFonts().catch((error) => {
    ready = undefined
    throw error
  })
  return ready
}
