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
            <NuxtImg v-if="page.meta?.image" :src="page.meta.image" class="w-full h-64 md:h-96 object-cover rounded-xl mb-8 shadow-md" />
            <h1 class="mb-4 text-4xl sm:text-5xl font-extrabold">{{ page.title }}</h1>
            <div class="flex items-center justify-center space-x-4">
              <p v-if="page.meta?.date" class="text-gray-500 dark:text-gray-400 text-sm font-mono uppercase tracking-wider">{{ page.meta.date }}</p>
            </div>
            <div v-if="page.meta?.tags" class="flex justify-center gap-2 mt-4">
              <UBadge v-for="tag in page.meta.tags" :key="tag" variant="soft" color="primary">{{ tag }}</UBadge>
            </div>
            
            <div v-if="page.meta?.authorName" class="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-center">
              <a :href="page.meta.authorInstagram || '#'" target="_blank" rel="noopener noreferrer" class="flex flex-col items-center gap-3 group hover:opacity-80 transition-all duration-200 hover:-translate-y-1">
                <UAvatar v-if="page.meta.authorImage" :src="page.meta.authorImage" :alt="page.meta.authorName" size="xl" class="ring-4 ring-primary-500/10 group-hover:ring-primary-500/30 transition-all" />
                <div class="text-center flex flex-col gap-1.5 mt-1">
                  <div class="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors flex items-center justify-center gap-1 leading-none">
                    {{ page.meta.authorName }}
                  </div>
                  <div v-if="page.meta.authorInstagram" class="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5 leading-none">
                    <UIcon name="i-ph-instagram-logo" class="w-4 h-4" />
                    @{{ page.meta.authorInstagram.split('/').pop() }}
                  </div>
                </div>
              </a>
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
