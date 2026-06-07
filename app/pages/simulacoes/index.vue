<script setup lang="ts">
const tools = [
  {
    label: "Tabuleiro de Galton",
    description: "Demonstração visual de como a variabilidade aleatória dos escores gera a distribuição normal.",
    link: "/simulacoes/galton-board",
    icon: "i-heroicons-chart-bar"
  },
  {
    label: "Torre de Hanói",
    description: "Simulação do clássico teste neuropsicológico de planejamento. Mova todos os discos para outro pino com o menor número de movimentos possível.",
    link: "/simulacoes/torre-hanoi",
    icon: "i-heroicons-puzzle-piece"
  },
  {
    label: "Tarefa de Simon",
    description: "Simulação do Spatial Stroop Task: responda à direção da seta ignorando sua posição na tela. Mede controle inibitório e tempo de reação em condições congruentes, incongruentes e neutras.",
    link: "/simulacoes/simon-task",
    icon: "i-heroicons-bolt"
  }
]
</script>

<template>
  <UContainer class="py-16 flex flex-col items-center space-y-12">
    <!-- Header -->
    <div class="text-center space-y-4 max-w-2xl">
      <h1 class="text-4xl font-bold text-primary">ZSCOREPRO</h1>
      <h3 class="text-primary">Ferramentas</h3>
      <p class="text-lg text-muted">
        Psicologia, neurociência e pesquisa em um só lugar.
      </p>
    </div>

    <!-- Cards das ferramentas -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
      <UCard
        v-for="tool in tools"
        :key="tool.label"
        class="flex flex-col justify-between p-6 hover:shadow-lg transition-shadow cursor-pointer"
        variant="soft"
      >
        <div class="flex items-center space-x-4">
          <UIcon :name="tool.icon" class="text-primary text-3xl" />
          <h3 class="font-semibold text-lg">{{ tool.label }}</h3>
        </div>
        <p class="mt-4 text-sm text-muted">{{ tool.description }}</p>
        <UButton
          class="mt-6 self-start"
          icon="i-heroicons-arrow-top-right-on-square"
          variant="outline"
          :to="tool.link"
        >
          Acessar
        </UButton>
      </UCard>
    </div>
  </UContainer>
</template>
