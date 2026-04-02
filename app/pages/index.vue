<script setup lang="ts">
const { groupedTools } = useNavigation();
</script>

<template>
  <UContainer class="py-16 flex flex-col items-center space-y-12">
    <!-- Header -->
    <div class="text-center space-y-4 max-w-2xl">
      <h1 class="text-4xl font-bold text-primary">ZSCOREPRO</h1>
      <p class="text-lg text-muted">
        Ferramentas online para psicometristas e pesquisadores.
      </p>
    </div>

    <!-- Grupos de Ferramentas -->
    <div class="w-full max-w-6xl space-y-16">
      <section v-for="group in groupedTools" :key="group.label" class="space-y-6">
        <div class="flex items-center space-x-3 border-b border-gray-200 dark:border-gray-800 pb-2">
          <UIcon v-if="group.icon" :name="group.icon" class="text-primary text-2xl" />
          <h2 class="text-2xl font-semibold">{{ group.label }}</h2>
        </div>
        
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <UCard
            v-for="tool in group.tools"
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
      </section>
    </div>
  </UContainer>
</template>
