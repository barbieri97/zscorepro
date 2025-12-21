<template>
  <UContainer class="min-h-[70vh] flex items-center justify-center">
    <UCard class="max-w-md text-center">
      <template #header>
        <div class="flex justify-center">
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="text-4xl text-warning"
          />
        </div>
      </template>

      <h1 class="text-2xl font-bold mb-2">
        Página não encontrada
      </h1>

      <p class="text-sm text-muted mb-6">
        A página que você tentou acessar não existe ou foi movida.
      </p>

      <UButton to="/" icon="i-heroicons-home">
        Voltar para o início
      </UButton>
    </UCard>
  </UContainer>
</template>
