<script setup lang="ts">
const tools = [
  {
    label: "Calculadora de Z-score",
    description: "Converta escores para Z, T, percentil ou ponto ponderado.",
    icon: "i-heroicons-chart-bar",
    link: "/calculadoras/zscore"
  },
  {
    label: "Gerador de Gráficos",
    description: "Crie gráficos de barra, linha ou pizza a partir de seus dados.",
    icon: "i-heroicons-chart-pie",
    link: "/ferramentas/graficos"
  },
  {
    label: "QR Code",
    description: "Gere QR Codes para URLs, textos ou dados de forma rápida.",
    icon: "i-heroicons-qr-code",
    link: "/ferramentas/qrcode"
  },
  {
    label: "Calculadora de Idade",
    description: "Calcule a idade exata a partir da data de nascimento.",
    icon: "i-heroicons-calendar",
    link: "/calculadoras/idade"
  },
  {
    label: "RCI - Índice de Mudança Confiável",
    description: "Avalie se a mudança entre duas medições é significativa.",
    icon: "i-heroicons-arrows-right-left",
    link: "/calculadoras/rci"
  }
]
</script>

<template>
  <UContainer class="py-16 flex flex-col items-center space-y-12">
    <!-- Header -->
    <div class="text-center space-y-4 max-w-2xl">
      <h1 class="text-4xl font-bold text-primary">ZSCOREPRO</h1>
      <p class="text-lg text-muted">
        Ferramentas online para psicólogos e pesquisadores em psicometria e avaliação psicológica.
      </p>
    </div>

    <!-- Cards das ferramentas -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
      <UCard
        v-for="tool in tools"
        :key="tool.label"
        class="flex flex-col justify-between p-6 hover:shadow-lg transition-shadow cursor-pointer"
        variant="soft"
        :to="tool.link"
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
