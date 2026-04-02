<script setup lang="ts">
const route = useRoute()

// Removendo chamadas excessivas em chain que podem causar Throw silencioso no dev server
const { data: page, error } = await useAsyncData(route.path, async () => {
  try {
    const res = await queryCollection('blog').path(route.path).first()
    return res
  } catch (e: any) {
    console.error("Nuxt Content Fetch Error:", e)
    throw e
  }
})

// Debug logger
onMounted(() => {
  console.log("Roteamento concluído para:", route.path)
  console.log("Página carregada:", page.value)
  console.log("Erros na rota:", error.value)
})
</script>

<template>
  <UContainer class="py-16 flex justify-center">
    <div class="w-full max-w-4xl space-y-8">
      
      <!-- Voltar -->
      <div>
        <UButton to="/blog" icon="i-heroicons-arrow-left" variant="ghost" color="gray">
          Voltar para os Artigos
        </UButton>
      </div>

      <UCard variant="soft" class="pt-6 sm:p-10" v-if="page">
        <article class="prose prose-gray dark:prose-invert prose-headings:text-primary max-w-none">
          <header class="mb-10 text-center border-b border-gray-200 dark:border-gray-800 pb-8">
            <img v-if="page.meta?.image" :src="page.meta.image" class="w-full h-64 md:h-96 object-cover rounded-xl mb-8 shadow-md" />
            <h1 class="mb-4 text-4xl sm:text-5xl font-extrabold">{{ page.title }}</h1>
            <div class="flex items-center justify-center space-x-4">
              <p v-if="page.meta?.date" class="text-gray-500 dark:text-gray-400 text-sm font-mono uppercase tracking-wider">{{ page.meta.date }}</p>
            </div>
            <div v-if="page.meta?.tags" class="flex justify-center gap-2 mt-4">
              <UBadge v-for="tag in page.meta.tags" :key="tag" variant="soft" color="primary">{{ tag }}</UBadge>
            </div>
          </header>
          
          <ContentRenderer :value="page" />
        </article>
      </UCard>
      
      <div v-else class="text-center py-20 text-gray-500">
        <UIcon name="i-heroicons-document-magnifying-glass" class="text-4xl mb-4" />
        <h2 class="text-2xl font-semibold">Artigo não encontrado</h2>
      </div>

    </div>
  </UContainer>
</template>

<style scoped>
:deep(article h1) { font-size: 1.875rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; }
:deep(article h2) { font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: var(--ui-primary); }
:deep(article h3) { font-size: 1.25rem; font-weight: 500; margin-top: 1.5rem; margin-bottom: 0.75rem; }
:deep(article p) { line-height: 1.625; margin-bottom: 1.5rem; }
:deep(article strong) { font-weight: 600; }
:deep(article ul), :deep(article ol) { margin-top: 1.5rem; margin-bottom: 1.5rem; margin-left: 1.5rem; list-style-type: disc; }
:deep(article li) { margin-bottom: 0.5rem; }
</style>
