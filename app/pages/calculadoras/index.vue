<script setup lang="ts">
const { groupedTools } = useNavigation()

const calculatorTools = computed(() => {
  return groupedTools.value.find((group) => group.label === 'Calculadoras')?.tools || []
})
</script>

<template>
  <UContainer class="py-16 flex flex-col items-center space-y-12">
    <!-- Header -->
    <div class="text-center space-y-4 max-w-2xl">
      <h1 class="text-4xl font-bold text-primary">ZSCOREPRO</h1>
      <h3 class="text-primary text-2xl font-semibold">Calculadoras</h3>
      <p class="text-lg text-muted">
        Psicologia, neurociência e pesquisa em um só lugar.
      </p>
    </div>

    <!-- Cards das ferramentas -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
      <UCard
        v-for="tool in calculatorTools"
        :key="tool.label"
        class="flex flex-col justify-between p-6 transition-shadow"
        :class="[tool.disabled ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg cursor-pointer']"
        variant="soft"
      >
        <div class="flex items-center space-x-4">
          <UIcon v-if="tool.icon" :name="tool.icon" class="text-primary text-3xl" />
          <h3 class="font-semibold text-lg">{{ tool.label }}</h3>
        </div>
        <p class="mt-4 text-sm text-muted">{{ tool.description }}</p>
        <UButton
          class="mt-6 self-start"
          icon="i-heroicons-arrow-top-right-on-square"
          variant="outline"
          :to="tool.disabled ? undefined : tool.to"
          :disabled="tool.disabled"
        >
          {{ tool.disabled ? 'Em breve' : 'Acessar' }}
        </UButton>
      </UCard>
    </div>
  </UContainer>
</template>
