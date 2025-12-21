<script setup lang="ts">
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'

const rawText = ref('')
const data = ref<number[]>([])
const file = ref<File | null>(null)

/* =========
   PARSE TEXTO COLADO
   ========= */
function parseText() {
  const values = rawText.value
    .trim()
    .split(/[\s,;]+/)
    .map(v => Number(v.replace(',', '.')))
    .filter(v => !isNaN(v))

  data.value = values
}

/* =========
   UPLOAD XLSX
   ========= */
function handleFile(file: File) {
  const reader = new FileReader()

  reader.onload = e => {
    const wb = XLSX.read(e.target?.result, { type: 'binary' })
    const sheetName = wb.SheetNames[0]
    if (!sheetName) return
    const sheet = wb.Sheets[sheetName]
    if (!sheet) return
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

    const values = rows
      .flat()
      .map(v => Number(String(v).replace(',', '.')))
      .filter(v => !isNaN(v))

    data.value = values
    rawText.value = values.toString()
  }

  reader.readAsBinaryString(file)
}

watch(file, newFile => {
  if (newFile) {
    handleFile(newFile)
  }
})

/* =========
   FUNÇÕES ESTATÍSTICAS
   ========= */
const n = computed(() => data.value.length)

const mean = computed(() =>
  n.value ? data.value.reduce((a, b) => a + b, 0) / n.value : null
)

const sorted = computed(() => [...data.value].sort((a, b) => a - b))

const median = computed(() => {
  if (n.value === 0) return null

  const mid = Math.floor(n.value / 2)

  if (n.value % 2 === 1) {
    return sorted.value[mid] ?? null
  }

  const a = sorted.value[mid - 1]
  const b = sorted.value[mid]

  if (a === undefined || b === undefined) return null

  return (a + b) / 2
})

const min = computed(() => (n.value ? Math.min(...data.value) : null))
const max = computed(() => (n.value ? Math.max(...data.value) : null))

const sd = computed(() => {
  if (!mean.value || n.value < 2) return null
  const variance =
    data.value.reduce((sum, v) => sum + (v - mean.value!) ** 2, 0) /
    (n.value - 1)
  return Math.sqrt(variance)
})
</script>

<template>
  <UContainer class="py-10 flex justify-center">
    <UCard class="w-full max-w-4xl space-y-6">

      <!-- Header -->
      <template #header>
        <h2 class="text-lg font-semibold text-center">
          Análise Descritiva
        </h2>
      </template>

      <!-- Entrada por texto -->
      <UFormField
        label="Cole os dados (copiados da planilha)"
        help="Valores separados por espaço, vírgula, ponto-e-vírgula ou quebra de linha"
      >
        <UTextarea
          v-model="rawText"
          class="w-full"
          placeholder="10 12 14 15 18..."
        />
      </UFormField>



      <!-- Upload -->
      <USeparator label="ou" class="my-5"/>

      <UFormField 
        label="Enviar arquivo XLSX"
        help="Ferramenta simples: irá concatenar todos os dados da primeira aba e excluir textos"
      >
        <UFileUpload
          label="Arraste o seu arquivo aqui"
          v-model="file"
          accept=".xlsx"
        />
      </UFormField>


      <!-- Resultados -->
      <div v-if="n" class="grid gap-4 md:grid-cols-3 pt-4">

        <UCard variant="soft">
          <p class="text-sm text-muted">N</p>
          <p class="text-lg font-semibold">{{ n }}</p>
        </UCard>

        <UCard variant="soft">
          <p class="text-sm text-muted">Média</p>
          <p class="text-lg font-semibold">{{ mean?.toFixed(2) }}</p>
        </UCard>

        <UCard variant="soft">
          <p class="text-sm text-muted">Mediana</p>
          <p class="text-lg font-semibold">{{ median?.toFixed(2) }}</p>
        </UCard>

        <UCard variant="soft">
          <p class="text-sm text-muted">Mínimo</p>
          <p class="text-lg font-semibold">{{ min }}</p>
        </UCard>

        <UCard variant="soft">
          <p class="text-sm text-muted">Máximo</p>
          <p class="text-lg font-semibold">{{ max }}</p>
        </UCard>

        <UCard variant="soft">
          <p class="text-sm text-muted">Desvio-padrão</p>
          <p class="text-lg font-semibold">{{ sd?.toFixed(2) }}</p>
        </UCard>

      </div>

      <!-- Footer -->
      <template #footer>
      <UButton
        label="Processar dados colados"
        icon="i-heroicons-arrow-path"
        @click="parseText"
      />
      </template>

    </UCard>
  </UContainer>
</template>

