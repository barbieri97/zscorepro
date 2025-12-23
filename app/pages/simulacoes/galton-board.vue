<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from "vue"

const canvasRef = ref<HTMLCanvasElement | null>(null)
const chartCanvas = ref<HTMLCanvasElement | null>(null)
const toast = useToast()

// Configurações da simulação
const ballCount = ref(100)
const isRunning = ref(false)
const isPaused = ref(false)
const bins = ref<number[]>([])
const totalBalls = ref(0)

// Matter.js instances
let engine: any = null
let render: any = null
let world: any = null
let Matter: any = null

// Chart.js instance
let chart: any = null
let Chart: any = null

// Configurações do tabuleiro
const config = {
  width: 700,
  height: 850,
  rows: 10,
  pegRadius: 5,
  ballRadius: 7,
  binCount: 18, // Bins um pouco maiores
  pegSpacing: 32,
  startY: 80,
  binHeight: 320,
  funnelWidth: 40, // largura do funil no topo
}

async function initMatterJS() {
  // Importar Matter.js dinamicamente (client-side only)
  Matter = await import("matter-js")
  
  const { Engine, Render, World, Bodies, Runner, Events } = Matter

  // Criar engine com configurações otimizadas
  engine = Engine.create({
    gravity: { x: 0, y: 1.2 },
    enableSleeping: false,
  })
  world = engine.world
  
  // Aumentar iterações para física mais precisa
  engine.positionIterations = 10
  engine.velocityIterations = 8

  // Criar render
  if (canvasRef.value) {
    render = Render.create({
      canvas: canvasRef.value,
      engine: engine,
      options: {
        width: config.width,
        height: config.height,
        wireframes: false,
        background: "transparent",
      },
    })

    Render.run(render)
    const runner = Runner.create()
    Runner.run(runner, engine)
  }

  // Criar pinos (pegs)
  createPegs()

  // Criar paredes
  createWalls()

  // Criar divisórias dos bins
  createBins()

  // Detectar quando bolas chegam ao fundo
  Events.on(engine, "collisionStart", handleCollision)
}

async function initChart() {
  // Importar Chart.js dinamicamente
  const ChartModule = await import("chart.js/auto")
  Chart = ChartModule
  
  // Aguardar próximo tick para garantir que o canvas está montado
  await nextTick()
  
  if (chartCanvas.value) {
    chart = new ChartModule.default(chartCanvas.value, {
      type: 'bar',
      data: {
        labels: Array.from({ length: config.binCount }, (_, i) => `${i}`),
        datasets: [{
          label: 'Número de bolas',
          data: bins.value,
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.5,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            },
            title: {
              display: true,
              text: 'Quantidade'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Bin'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const count = context.parsed.y
                const percentage = totalBalls.value > 0 
                  ? ((count / totalBalls.value) * 100).toFixed(1) 
                  : '0.0'
                return `${count} bolas (${percentage}%)`
              }
            }
          }
        }
      }
    })
  }
}

function updateChart() {
  if (chart && Chart) {
    chart.data.datasets[0].data = bins.value
    chart.update('none') // 'none' para atualização sem animação (mais rápido)
  }
}

// Watch para atualizar o gráfico quando bins mudar
watch(bins, () => {
  if (chart) {
    updateChart()
  }
}, { deep: true })

function createPegs() {
  const { Bodies, World } = Matter
  const pegOptions = {
    isStatic: true,
    restitution: 0.45,
    friction: 0,
    render: {
      fillStyle: "#6366f1",
    },
  }

  for (let row = 0; row < config.rows; row++) {
    const pegsInRow = row + 3
    const rowY = config.startY + row * config.pegSpacing
    const offsetX = (config.width - (pegsInRow - 1) * config.pegSpacing) / 2

    for (let col = 0; col < pegsInRow; col++) {
      const x = offsetX + col * config.pegSpacing
      const peg = Bodies.circle(x, rowY, config.pegRadius, pegOptions)
      World.add(world, peg)
    }
  }
}

function createWalls() {
  const { Bodies, World } = Matter
  
  // Calcular dimensões do triângulo de pinos
  const firstRowPegs = 3
  const lastRowPegs = config.rows + 2
  const firstRowWidth = (firstRowPegs - 1) * config.pegSpacing
  const lastRowWidth = (lastRowPegs - 1) * config.pegSpacing
  
  const topOffsetX = (config.width - firstRowWidth) / 2
  const bottomOffsetX = (config.width - lastRowWidth) / 2
  
  // Usar mesma margem constante no topo e embaixo para paredes paralelas
  const wallMargin = 12
  
  // Estender paredes para cima para evitar que bolas escapem
  const topY = config.startY - 40
  const bottomY = config.startY + (config.rows - 1) * config.pegSpacing
  
  // Coordenadas dos vértices do triângulo com margem IGUAL em cima e embaixo
  const leftTop = { x: topOffsetX - wallMargin, y: topY }
  const leftBottom = { x: bottomOffsetX - wallMargin, y: bottomY }
  const rightTop = { x: config.width - topOffsetX + wallMargin, y: topY }
  const rightBottom = { x: config.width - bottomOffsetX + wallMargin, y: bottomY }
  
  // Calcular ângulo e comprimento das paredes diagonais
  const leftWallAngle = Math.atan2(leftBottom.y - leftTop.y, leftBottom.x - leftTop.x)
  const rightWallAngle = Math.atan2(rightBottom.y - rightTop.y, rightBottom.x - rightTop.x)
  
  const leftWallLength = Math.sqrt(
    Math.pow(leftBottom.x - leftTop.x, 2) + Math.pow(leftBottom.y - leftTop.y, 2)
  )
  const rightWallLength = Math.sqrt(
    Math.pow(rightBottom.x - rightTop.x, 2) + Math.pow(rightBottom.y - rightTop.y, 2)
  )
  
  const wallOptions = {
    isStatic: true,
    friction: 0,
    restitution: 0.45,
    render: {
      fillStyle: "#374151",
      opacity: 0.8,
    },
  }
  
  // Criar paredes diagonais (laterais do triângulo)
  const leftDiagonalWall = Bodies.rectangle(
    (leftTop.x + leftBottom.x) / 2,
    (leftTop.y + leftBottom.y) / 2,
    leftWallLength,
    8,
    {
      ...wallOptions,
      angle: leftWallAngle,
    }
  )
  
  const rightDiagonalWall = Bodies.rectangle(
    (rightTop.x + rightBottom.x) / 2,
    (rightTop.y + rightBottom.y) / 2,
    rightWallLength,
    8,
    {
      ...wallOptions,
      angle: rightWallAngle,
    }
  )
  
  // Paredes laterais verticais (após os pinos até o fundo)
  const wallHeight = config.height - bottomY
  const wallThickness = 10
  
  const leftWall = Bodies.rectangle(
    -wallThickness / 2, 
    bottomY + wallHeight / 2, 
    wallThickness, 
    wallHeight, 
    wallOptions
  )
  const rightWall = Bodies.rectangle(
    config.width + wallThickness / 2, 
    bottomY + wallHeight / 2, 
    wallThickness, 
    wallHeight, 
    wallOptions
  )
  
  World.add(world, [leftDiagonalWall, rightDiagonalWall, leftWall, rightWall])
}

function createBins() {
  const { Bodies, World } = Matter
  bins.value = new Array(config.binCount).fill(0)
  
  const binWidth = config.width / config.binCount
  
  // Calcular onde termina a última linha de pinos
  const lastPegRowY = config.startY + (config.rows - 1) * config.pegSpacing
  
  // Bins começam 10px abaixo dos pinos
  const binStartY = lastPegRowY + config.pegRadius + 10
  const binY = binStartY
  
  const dividerOptions = {
    isStatic: true,
    render: {
      fillStyle: "#9ca3af",
    },
  }

  // Criar divisórias - começando de binWidth (não de 0) para não bloquear o primeiro bin
  // e terminando em width - binWidth (não em width) para não bloquear o último bin
  for (let i = 1; i < config.binCount; i++) {
    const x = i * binWidth
    const divider = Bodies.rectangle(x, binY + config.binHeight / 2, 1.5, config.binHeight, dividerOptions)
    World.add(world, divider)
  }

  // Criar fundo
  const bottom = Bodies.rectangle(
    config.width / 2,
    binY + config.binHeight,
    config.width,
    20,
    { isStatic: true, render: { fillStyle: "#374151" } }
  )
  World.add(world, bottom)
}

function dropBall() {
  if (!Matter) return

  const { Bodies, World } = Matter
  
  // Pequena variação aleatória dentro de um funil estreito no topo
  // Isso é ESSENCIAL para criar a distribuição normal
  const startX = config.width / 2 + (Math.random() - 0.5) * config.funnelWidth
  const startY = 20

  const ball = Bodies.circle(startX, startY, config.ballRadius, {
    restitution: 0.45,
    friction: 0,
    frictionAir: 0.01,
    density: 0.002,
    label: "ball",
    render: {
      fillStyle: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`,
    },
  })

  World.add(world, ball)
  totalBalls.value++
}

function handleCollision(event: any) {
  const pairs = event.pairs
  
  // Calcular Y onde os bins começam
  const lastPegRowY = config.startY + (config.rows - 1) * config.pegSpacing
  const binY = lastPegRowY + config.pegRadius + 10

  pairs.forEach((pair: any) => {
    const { bodyA, bodyB } = pair
    
    // Verificar se uma bola chegou ao fundo
    if (bodyA.label === "ball" && bodyA.position.y > binY) {
      const binIndex = Math.floor((bodyA.position.x / config.width) * config.binCount)
      if (binIndex >= 0 && binIndex < config.binCount) {
         bins.value[binIndex] = (bins.value[binIndex] ?? 0) + 1
      }
    }
    
    if (bodyB.label === "ball" && bodyB.position.y > binY) {
      const binIndex = Math.floor((bodyB.position.x / config.width) * config.binCount)
      if (binIndex >= 0 && binIndex < config.binCount) {
         bins.value[binIndex] = (bins.value[binIndex] ?? 0) + 1
      }
    }
  })
}

let dropInterval: any = null

function startSimulation() {
  if (!Matter) {
    toast.add({
      title: "Erro",
      description: "Aguarde o carregamento da simulação",
      icon: "i-heroicons-exclamation-circle",
      color: "error"
    })
    return
  }

  isRunning.value = true
  isPaused.value = false
  
  let dropped = 0
  dropInterval = setInterval(() => {
    if (!isPaused.value) {
      dropBall()
      dropped++
      
      if (dropped >= ballCount.value) {
        clearInterval(dropInterval)
        setTimeout(() => {
          isRunning.value = false
        }, 5000)
      }
    }
  }, 120)
}

function pauseSimulation() {
  isPaused.value = !isPaused.value
  
  toast.add({
    title: isPaused.value ? "Pausado" : "Retomado",
    icon: isPaused.value ? "i-heroicons-pause" : "i-heroicons-play",
    color: "primary"
  })
}

function resetSimulation() {
  if (dropInterval) {
    clearInterval(dropInterval)
  }
  
  if (Matter && world) {
    const { World, Composite } = Matter
    
    // Remover todas as bolas
    const bodies = Composite.allBodies(world)
    bodies.forEach((body: any) => {
      if (body.label === "ball") {
        World.remove(world, body)
      }
    })
  }
  
  bins.value = new Array(config.binCount).fill(0)
  totalBalls.value = 0
  isRunning.value = false
  isPaused.value = false
  
  toast.add({
    title: "Simulação reiniciada",
    icon: "i-heroicons-arrow-path",
    color: "success"
  })
}

// Estatísticas calculadas
const maxBinCount = computed(() => Math.max(...bins.value, 1))

const binPercentages = computed(() => 
  bins.value.map(count => totalBalls.value > 0 ? (count / totalBalls.value) * 100 : 0)
)

onMounted(async () => {
  // Inicializar array de bins
  bins.value = new Array(config.binCount).fill(0)
  
  await initMatterJS()
  await initChart()
})

onBeforeUnmount(() => {
  if (dropInterval) {
    clearInterval(dropInterval)
  }
  
  if (Matter && render) {
    const { Render, Runner } = Matter
    Render.stop(render)
    Runner.stop(render.runner)
  }
  
  if (chart) {
    chart.destroy()
  }
})
</script>

<template>
  <UContainer class="py-10 flex justify-center">
    <UCard class="w-full max-w-4xl">
      <!-- Header -->
      <template #header>
        <div class="text-center space-y-2">
          <h2 class="text-lg font-semibold">
            Tabuleiro de Galton
          </h2>
          <p class="text-sm text-muted">
            Simulação física da distribuição normal
          </p>
        </div>
      </template>

      <!-- Controles -->
      <div class="space-y-4 mb-6">
        <UFormField label="Número de bolas">
          <UInput 
            v-model.number="ballCount" 
            type="number" 
            :min="10"
            :max="500"
            :disabled="isRunning"
            placeholder="Ex: 100" 
          />
        </UFormField>

        <div class="flex gap-2 flex-wrap">
          <UButton
            :disabled="isRunning"
            @click="startSimulation"
            icon="i-heroicons-play"
            color="primary"
          >
            Iniciar
          </UButton>

          <UButton
            v-if="isRunning"
            @click="pauseSimulation"
            :icon="isPaused ? 'i-heroicons-play' : 'i-heroicons-pause'"
            variant="soft"
          >
            {{ isPaused ? 'Retomar' : 'Pausar' }}
          </UButton>

          <UButton
            @click="resetSimulation"
            icon="i-heroicons-arrow-path"
            variant="soft"
            color="neutral"
          >
            Reiniciar
          </UButton>
        </div>
      </div>

      <!-- Canvas da simulação -->
      <div class="flex justify-center mb-6 bg-gray-900 dark:bg-gray-950 rounded-lg overflow-hidden">
        <canvas ref="canvasRef" class="max-w-full" />
      </div>

      <!-- Histograma -->
      <div class="space-y-4">
        <h3 class="font-semibold text-center">
          {{ totalBalls > 0 ? `Distribuição (${totalBalls} bolas)` : 'Distribuição' }}
        </h3>
        
        <!-- Chart.js canvas -->
        <div class="flex justify-center p-4">
          <canvas ref="chartCanvas" style="max-height: 400px; width: 100%;"></canvas>
        </div>
      </div>

      <!-- Footer -->
      <template #footer>
        <div class="space-y-3">
          <UBadge 
            label="Essa simulação apresenta alguns bugs, se quiser contribuir acesse nossa page do github"
            variant="soft"
            color="warning"
            icon="i-heroicons-information-circle"
            class="w-full justify-center"
          />
        </div>
      </template>
    </UCard>
  </UContainer>
</template>

<style scoped>
canvas {
  display: block;
}
</style>