import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from "vue"

export function useGaltonBoard() {
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const chartCanvas = ref<HTMLCanvasElement | null>(null)
  const toast = useToast()

  // Configurações da simulação
  const ballCount = ref(300)
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
    binCount: 18,
    pegSpacing: 32,
    startY: 80,
    binHeight: 320,
    funnelWidth: 40,
  }

  async function initMatterJS() {
    Matter = await import("matter-js")
    
    const { Engine, Render, World, Bodies, Runner, Events } = Matter

    engine = Engine.create({
      gravity: { x: 0, y: 1.2 },
      enableSleeping: false,
    })
    world = engine.world
    
    engine.positionIterations = 10
    engine.velocityIterations = 8

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

    createPegs()
    createWalls()
    createBins()

    Events.on(engine, "collisionStart", handleCollision)
  }

  async function initChart() {
    const ChartModule = await import("chart.js/auto")
    Chart = ChartModule
    
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
              ticks: { precision: 0 },
              title: { display: true, text: 'Quantidade' }
            },
            x: {
              title: { display: true, text: 'Bin' }
            }
          },
          plugins: {
            legend: { display: false },
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
      chart.update('none')
    }
  }

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
      render: { fillStyle: "#6366f1" },
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
    
    const firstRowPegs = 3
    const lastRowPegs = config.rows + 2
    const firstRowWidth = (firstRowPegs - 1) * config.pegSpacing
    const lastRowWidth = (lastRowPegs - 1) * config.pegSpacing
    
    const topOffsetX = (config.width - firstRowWidth) / 2
    const bottomOffsetX = (config.width - lastRowWidth) / 2
    
    const wallMargin = 12
    
    const topY = config.startY - 40
    const bottomY = config.startY + (config.rows - 1) * config.pegSpacing
    
    const leftTop = { x: topOffsetX - wallMargin, y: topY }
    const leftBottom = { x: bottomOffsetX - wallMargin, y: bottomY }
    const rightTop = { x: config.width - topOffsetX + wallMargin, y: topY }
    const rightBottom = { x: config.width - bottomOffsetX + wallMargin, y: bottomY }
    
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
    
    const leftDiagonalWall = Bodies.rectangle(
      (leftTop.x + leftBottom.x) / 2,
      (leftTop.y + leftBottom.y) / 2,
      leftWallLength,
      8,
      { ...wallOptions, angle: leftWallAngle }
    )
    
    const rightDiagonalWall = Bodies.rectangle(
      (rightTop.x + rightBottom.x) / 2,
      (rightTop.y + rightBottom.y) / 2,
      rightWallLength,
      8,
      { ...wallOptions, angle: rightWallAngle }
    )
    
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
    const lastPegRowY = config.startY + (config.rows - 1) * config.pegSpacing
    const binStartY = lastPegRowY + config.pegRadius + 10
    const binY = binStartY
    
    const dividerOptions = {
      isStatic: true,
      render: { fillStyle: "#9ca3af" },
    }

    for (let i = 1; i < config.binCount; i++) {
        const x = i * binWidth
        const divider = Bodies.rectangle(x, binY + config.binHeight / 2, 1.5, config.binHeight, dividerOptions)
        World.add(world, divider)
      }

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
    
    const startX = config.width / 2 + (Math.random() - 0.5) * config.funnelWidth
    const startY = 20

    const ball = Bodies.circle(startX, startY, config.ballRadius, {
      restitution: 0.45,
      friction: 0,
      frictionAir: 0.01,
      density: 0.002,
      label: "ball",
      isCounted: false,
      render: { fillStyle: `hsl(${Math.random() * 60 + 200}, 70%, 60%)` },
    })

    World.add(world, ball)
    totalBalls.value++
  }

  function handleCollision(event: any) {
    const pairs = event.pairs
    
    const lastPegRowY = config.startY + (config.rows - 1) * config.pegSpacing
    const binY = lastPegRowY + config.pegRadius + 10

    pairs.forEach((pair: any) => {
      const { bodyA, bodyB } = pair
      
      // Verification Fix: Check isCounted so ball hits the bin only exactly once.
      if (bodyA.label === "ball" && !bodyA.isCounted && bodyA.position.y > binY) {
        bodyA.isCounted = true
        const binIndex = Math.floor((bodyA.position.x / config.width) * config.binCount)
        if (binIndex >= 0 && binIndex < config.binCount) {
           bins.value[binIndex] = (bins.value[binIndex] ?? 0) + 1
        }
      }
      
      if (bodyB.label === "ball" && !bodyB.isCounted && bodyB.position.y > binY) {
        bodyB.isCounted = true
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

  onMounted(async () => {
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

  return {
    canvasRef,
    chartCanvas,
    ballCount,
    isRunning,
    isPaused,
    totalBalls,
    startSimulation,
    pauseSimulation,
    resetSimulation
  }
}
