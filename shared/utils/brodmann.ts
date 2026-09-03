// Dados puros do atlas de Brodmann, compartilhados entre o composable da UI
// (app/composables/useBrodmannAreas.ts) e a API pública de exportação
// (server/api/brodmann/export.post.ts). Sem dependências de Vue ou do DOM.

export type BrodmannView = 'lateral' | 'medial'

export interface BrodmannPresetGroup {
  rotulo: string
  cor: string
  areas: number[]
}

export interface BrodmannPreset {
  nome: string
  nota: string
  grupos: BrodmannPresetGroup[]
}

export interface BrodmannLegendChip {
  color: string
  label: string
  list: string
}

export const BRODMANN_PALETTE = ['#D92B2B', '#1B57A6', '#E08A00', '#157F5E', '#7B2D8E', '#0F7A8F']
export const BRODMANN_FADED_COLOR = '#E4E7EA'

// Divisão macroscópica por lobo, usada para agrupar a lista lateral de áreas.
export const BRODMANN_LOBES: Array<[string, number[]]> = [
  ['Frontal', [4, 6, 8, 9, 10, 11, 12, 44, 45, 46, 47]],
  ['Parietal', [1, 2, 3, 5, 7, 39, 40, 43]],
  ['Temporal', [20, 21, 22, 37, 38, 41, 42]],
  ['Occipital', [17, 18, 19]],
  ['Límbico e temporal medial', [23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]],
]

// Conjuntos prontos (presets) — cada um recolore um grupo de áreas com uma cor própria.
export const BRODMANN_PRESETS: BrodmannPreset[] = [
  {
    nome: 'Lobos corticais',
    nota: 'Divisão macroscópica de referência para situar as demais seleções.',
    grupos: [
      { rotulo: 'Frontal', cor: '#1B57A6', areas: [4, 6, 8, 9, 10, 11, 12, 44, 45, 46, 47] },
      { rotulo: 'Parietal', cor: '#157F5E', areas: [1, 2, 3, 5, 7, 39, 40, 43] },
      { rotulo: 'Temporal', cor: '#E08A00', areas: [20, 21, 22, 37, 38, 41, 42] },
      { rotulo: 'Occipital', cor: '#7B2D8E', areas: [17, 18, 19] },
      { rotulo: 'Límbico', cor: '#D92B2B', areas: [23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36] },
    ],
  },
  {
    nome: 'Linguagem',
    nota: 'Rede perissilviana esquerda. A correspondência entre área citoarquitetônica e função é aproximada.',
    grupos: [
      { rotulo: 'Broca', cor: '#D92B2B', areas: [44, 45] },
      { rotulo: 'Wernicke', cor: '#1B57A6', areas: [22] },
      { rotulo: 'Giro angular e supramarginal', cor: '#157F5E', areas: [39, 40] },
      { rotulo: 'Córtex auditivo', cor: '#E08A00', areas: [41, 42] },
    ],
  },
  {
    nome: 'Motor',
    nota: 'Do planejamento à execução, no sentido rostro-caudal.',
    grupos: [
      { rotulo: 'Motor primário (M1)', cor: '#D92B2B', areas: [4] },
      { rotulo: 'Pré-motor e motora suplementar', cor: '#E08A00', areas: [6] },
      { rotulo: 'Campos oculares frontais', cor: '#1B57A6', areas: [8] },
    ],
  },
  {
    nome: 'Somatossensorial',
    nota: 'Área 3 ocupa a parede do sulco central; 1 e 2, a crista e a face posterior do giro pós-central.',
    grupos: [
      { rotulo: 'Somatossensorial primário (S1)', cor: '#D92B2B', areas: [1, 2, 3] },
      { rotulo: 'Associativo parietal', cor: '#1B57A6', areas: [5, 7] },
      { rotulo: 'Gustativo (área subcentral)', cor: '#E08A00', areas: [43] },
    ],
  },
  {
    nome: 'Visual',
    nota: 'V1 concentra-se nas margens do sulco calcarino, visível sobretudo na vista medial.',
    grupos: [
      { rotulo: 'Visual primário (V1)', cor: '#D92B2B', areas: [17] },
      { rotulo: 'Visual secundário (V2)', cor: '#1B57A6', areas: [18] },
      { rotulo: 'Associativo (V3/V4/V5)', cor: '#157F5E', areas: [19] },
      { rotulo: 'Via ventral (fusiforme)', cor: '#E08A00', areas: [37] },
    ],
  },
  {
    nome: 'Auditivo',
    nota: 'Área 41 corresponde ao giro de Heschl, no plano supratemporal.',
    grupos: [
      { rotulo: 'Auditivo primário', cor: '#D92B2B', areas: [41] },
      { rotulo: 'Auditivo secundário', cor: '#E08A00', areas: [42] },
      { rotulo: 'Associativo auditivo', cor: '#1B57A6', areas: [22] },
    ],
  },
  {
    nome: 'Pré-frontal',
    nota: 'Subdivisões dorsolateral, polar, orbital e medial do córtex pré-frontal.',
    grupos: [
      { rotulo: 'Dorsolateral', cor: '#1B57A6', areas: [9, 46] },
      { rotulo: 'Frontopolar', cor: '#7B2D8E', areas: [10] },
      { rotulo: 'Orbitofrontal', cor: '#E08A00', areas: [11, 12, 47] },
      { rotulo: 'Cingulado anterior', cor: '#D92B2B', areas: [24, 32, 25] },
    ],
  },
  {
    nome: 'Funções executivas',
    nota: 'Circuito fronto-parietal de controle. Delimitação funcional aproximada, não citoarquitetônica.',
    grupos: [
      { rotulo: 'Pré-frontal dorsolateral', cor: '#1B57A6', areas: [9, 46] },
      { rotulo: 'Cingulado anterior dorsal', cor: '#D92B2B', areas: [24, 32] },
      { rotulo: 'Parietal posterior', cor: '#157F5E', areas: [7, 40] },
      { rotulo: 'Campos oculares frontais', cor: '#E08A00', areas: [8] },
    ],
  },
  {
    nome: 'Memória e lobo temporal medial',
    nota: 'Córtices peri-hipocampais, visíveis na vista medial.',
    grupos: [
      { rotulo: 'Entorrinal', cor: '#D92B2B', areas: [28, 34] },
      { rotulo: 'Perirrinal', cor: '#E08A00', areas: [35] },
      { rotulo: 'Para-hipocampal', cor: '#1B57A6', areas: [36, 27] },
      { rotulo: 'Temporal inferior', cor: '#157F5E', areas: [20] },
    ],
  },
  {
    nome: 'Cíngulo e retroesplenial',
    nota: 'Faixa límbica que circunda o corpo caloso.',
    grupos: [
      { rotulo: 'Cingulado anterior', cor: '#D92B2B', areas: [24, 32, 33] },
      { rotulo: 'Subgenual', cor: '#7B2D8E', areas: [25] },
      { rotulo: 'Cingulado posterior', cor: '#1B57A6', areas: [23, 31] },
      { rotulo: 'Retroesplenial', cor: '#157F5E', areas: [26, 29, 30] },
    ],
  },
  {
    nome: 'Rede de modo padrão',
    nota: 'Correspondência aproximada entre a rede descrita por neuroimagem funcional e as áreas de Brodmann.',
    grupos: [
      { rotulo: 'Pré-frontal medial', cor: '#D92B2B', areas: [10, 32, 24] },
      { rotulo: 'Cíngulo posterior e pré-cúneo', cor: '#1B57A6', areas: [23, 31, 7] },
      { rotulo: 'Parietal inferior', cor: '#157F5E', areas: [39] },
      { rotulo: 'Temporal lateral', cor: '#E08A00', areas: [21] },
    ],
  },
  {
    nome: 'Hierarquia cortical',
    nota: 'Gradiente de primário a paralímbico, na organização proposta por Mesulam.',
    grupos: [
      { rotulo: 'Primário', cor: '#D92B2B', areas: [4, 3, 1, 2, 17, 41] },
      { rotulo: 'Unimodal', cor: '#E08A00', areas: [6, 5, 18, 19, 42, 22, 37] },
      { rotulo: 'Heteromodal', cor: '#1B57A6', areas: [9, 10, 46, 45, 44, 39, 40, 7, 21] },
      { rotulo: 'Paralímbico', cor: '#7B2D8E', areas: [11, 12, 24, 25, 28, 32, 33, 34, 35, 36, 38] },
    ],
  },
]

// Nome e vistas (lateral/medial) disponíveis para cada área, extraídos do atlas original.
export const BRODMANN_AREA_NAMES: Record<string, string> = {
  '1': 'Córtex somatossensorial primário (S1)',
  '2': 'Córtex somatossensorial primário (S1)',
  '3': 'Córtex somatossensorial primário (S1)',
  '4': 'Córtex motor primário (M1)',
  '5': 'Córtex somatossensorial associativo (lóbulo parietal superior)',
  '6': 'Córtex pré-motor e área motora suplementar',
  '7': 'Córtex parietal associativo (pré-cúneo)',
  '8': 'Campos oculares frontais / pré-frontal dorsal',
  '9': 'Córtex pré-frontal dorsolateral',
  '10': 'Córtex frontopolar (pré-frontal anterior)',
  '11': 'Córtex orbitofrontal',
  '12': 'Córtex orbitofrontal medial',
  '17': 'Córtex visual primário (V1)',
  '18': 'Córtex visual secundário (V2)',
  '19': 'Córtex visual associativo (V3/V4/V5)',
  '20': 'Giro temporal inferior',
  '21': 'Giro temporal médio',
  '22': 'Giro temporal superior (área de Wernicke posterior)',
  '23': 'Córtex cingulado posterior ventral',
  '24': 'Córtex cingulado anterior ventral',
  '25': 'Área subgenual (cingulado subcaloso)',
  '26': 'Área ectoesplenial',
  '27': 'Área piriforme / pré-subículo',
  '28': 'Córtex entorrinal posterior',
  '29': 'Córtex retroesplenial granular',
  '30': 'Córtex retroesplenial agranular',
  '31': 'Córtex cingulado posterior dorsal',
  '32': 'Córtex cingulado anterior dorsal',
  '33': 'Área cingulada pregenual',
  '34': 'Córtex entorrinal anterior (uncus)',
  '35': 'Córtex perirrinal',
  '36': 'Córtex para-hipocampal (ectorrinal)',
  '37': 'Giro fusiforme / região temporo-occipital',
  '38': 'Polo temporal',
  '39': 'Giro angular',
  '40': 'Giro supramarginal',
  '41': 'Córtex auditivo primário (giro de Heschl)',
  '42': 'Córtex auditivo secundário',
  '43': 'Área subcentral (córtex gustativo primário)',
  '44': 'Pars opercularis (área de Broca)',
  '45': 'Pars triangularis (área de Broca)',
  '46': 'Córtex pré-frontal dorsolateral',
  '47': 'Pars orbitalis',
}

export const BRODMANN_AREA_VIEWS: Record<string, BrodmannView[]> = {
  '1': ['lateral', 'medial'],
  '2': ['lateral', 'medial'],
  '3': ['lateral', 'medial'],
  '4': ['lateral', 'medial'],
  '5': ['lateral', 'medial'],
  '6': ['lateral', 'medial'],
  '7': ['lateral', 'medial'],
  '8': ['lateral', 'medial'],
  '9': ['lateral', 'medial'],
  '10': ['lateral', 'medial'],
  '11': ['lateral', 'medial'],
  '12': ['medial'],
  '17': ['lateral', 'medial'],
  '18': ['lateral', 'medial'],
  '19': ['lateral', 'medial'],
  '20': ['lateral', 'medial'],
  '21': ['lateral'],
  '22': ['lateral'],
  '23': ['medial'],
  '24': ['medial'],
  '25': ['medial'],
  '26': ['medial'],
  '27': ['medial'],
  '28': ['medial'],
  '29': ['medial'],
  '30': ['medial'],
  '31': ['medial'],
  '32': ['medial'],
  '33': ['medial'],
  '34': ['medial'],
  '35': ['medial'],
  '36': ['medial'],
  '37': ['lateral', 'medial'],
  '38': ['lateral', 'medial'],
  '39': ['lateral'],
  '40': ['lateral'],
  '41': ['lateral'],
  '42': ['lateral'],
  '43': ['lateral'],
  '44': ['lateral'],
  '45': ['lateral'],
  '46': ['lateral'],
  '47': ['lateral'],
}

export const BRODMANN_CUSTOM_TITLE = 'Conjunto personalizado'
export const BRODMANN_CUSTOM_NOTE = 'Grupos definidos por você: cada cor reúne as áreas escolhidas manualmente.'

/** Lista de todos os números de área válidos (BA), ordenados. */
export const BRODMANN_VALID_AREAS: number[] = Object.keys(BRODMANN_AREA_NAMES)
  .map(Number)
  .sort((a, b) => a - b)
