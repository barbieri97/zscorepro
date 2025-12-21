<script setup lang="ts">
import { ref, watch, onMounted } from "vue"
import {
  Chart,
  BarController,
  LineController,
  PieController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js"

Chart.register(
  BarController,
  LineController,
  PieController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
)

const xValues = ref("ICV,IOP,IMO,IVP")
const yValues = ref("100,121,85,100")
const chartColors = ref<string[]>([
  "#3b82f6",
  "#22c55e",
  "#f59e0b"
])
const newColor = ref("#000000")
const chartType = ref<"bar" | "line" | "pie">("bar")

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

function parseValues(text: string) {
  return text.split(",").map(v => v.trim())
}

function addColor() {
  if (!chartColors.value.includes(newColor.value)) {
    chartColors.value.push(newColor.value)
  }
}

function removeColor(index: number) {
  chartColors.value.splice(index, 1)
}

function downloadChart() {
  if (
    !chartInstance ||
    !chartInstance.data ||
    !chartInstance.data.labels ||
    chartInstance.data.labels.length === 0
  ) {
    return
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")

  const filename = `grafico-${chartType.value}-${timestamp}.png`

  const link = document.createElement("a")
  link.href = chartInstance.toBase64Image("image/png", 1)
  link.download = filename
  link.click()
}


function createChart() {
  if (!canvasRef.value) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  const labels = parseValues(xValues.value)
  const data = parseValues(yValues.value).map(Number)
  const backgroundColors =
  chartType.value === "line"
    ? chartColors.value[0]
    : labels.map((_, i) =>
        chartColors.value[i % chartColors.value.length]
      )
  const minValue = Math.min(...data)

  chartInstance = new Chart(canvasRef.value, {
    type: chartType.value,
    data: {
      labels,
      datasets: [
        {
          label: "Valores",
          data,
          backgroundColor: backgroundColors,
          ...(chartType.value === "line"
            ? {
                borderColor: chartColors.value[0],
                borderWidth: 2
              }
            : {})
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
           min: minValue >= 0 ? 0 : undefined
        }
      },
      devicePixelRatio: 2,
      plugins: {
        legend: {
          display: chartType.value === "pie"
        }
      }
    }
  })
}

watch([xValues, yValues, chartType, chartColors], createChart, {deep: true})

onMounted(createChart)
</script>

<template>
  <UContainer class="py-10 flex justify-center">
    <!-- Centraliza o Card -->
      <UCard class="w-full">
        <template #header>
          <h2 class="text-lg font-semibold text-center">
            Gerador de Gráficos
          </h2>
        </template>

        <!-- Inputs alinhados -->
        <div class="grid gap-4 md:grid-cols-3 my-10">
          <UFormField
            label="Valores de X"
            description="Categorias ou rótulos (ex: A,B,C)"
            class="items-center"
          >
            <UInput
              v-model="xValues"
              placeholder="A,B,C"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Valores de Y"
            description="Valores numéricos (ex: 10,20,30)"
            >
            <UInput
            v-model="yValues"
            placeholder="10,20,30"
            class="w-full"
            />
        </UFormField>
        
        <UFormField label="Tipo de gráfico" description="Tipos de gráficos (barra, linha, pizza)">
            <USelect
            v-model="chartType"
            class="w-full"
              :items="[
                { label: 'Barras', value: 'bar' },
                { label: 'Linha', value: 'line' },
                { label: 'Pizza', value: 'pie' }
              ]"
            />
          </UFormField>
          <UFormField label="Cores" description="Selecione as cores que deseja no gráfico">
            <div class="flex gap-2 items-center w-full flex-col items-start">
              <UColorPicker
                v-model="newColor"
              />
              <UButton
                icon="i-heroicons-plus"
                variant="outline"
                @click="addColor"
              >
                Adicionar
              </UButton>
            </div>
            <USeparator class="my-5" />
            <div class="flex gap-2 flex-wrap mt-2">
                <div
                  v-for="(color, index) in chartColors"
                  :key="color"
                  class="flex items-center gap-1"
                >
                  <div
                    class="w-6 h-6 rounded"
                    :style="{ backgroundColor: color }"
                  />
                  <UButton
                    icon="i-heroicons-x-mark"
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    @click="removeColor(index)"
                  />
                </div>
            </div>
          </UFormField>
        </div>

        <!-- Gráfico abaixo, ocupando tudo -->
        <canvas ref="canvasRef" class="w-full h-full justify-around"></canvas>
        <template #footer>
        <UButton
                icon="i-heroicons-arrow-down-tray"
                color="primary"
                variant="solid"
                @click="downloadChart"
        >
            Baixar gráfico
        </UButton>
        </template>
      </UCard>
  </UContainer>
</template>
