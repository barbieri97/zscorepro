<script setup lang="ts">
import { computed, ref } from 'vue'

const { data: posts } = await useAsyncData('blog-posts', () => queryCollection('blog').all())

const allTags = computed(() => {
  if (!posts.value) return []
  const tags = new Set<string>()
  posts.value.forEach(post => {
    if (post.meta?.tags && Array.isArray(post.meta.tags)) {
      post.meta.tags.forEach(tag => tags.add(tag))
    }
  })
  return Array.from(tags)
})

const tabItems = computed(() => {
  return [
    { label: 'Todos', key: 'all' },
    ...allTags.value.map(tag => ({ label: tag, key: tag }))
  ]
})

const selectedTabIndex = ref(0)

const filteredPosts = computed(() => {
  if (!posts.value) return []
  const selected = tabItems.value[selectedTabIndex.value]
  if (!selected || selected.key === 'all') return posts.value

  return posts.value.filter(post => {
    return post.meta?.tags && Array.isArray(post.meta.tags) && post.meta.tags.includes(selected.label)
  })
})
</script>

<template>
  <UContainer class="py-16 space-y-12 flex flex-col items-center">
    <!-- Componente de Header -->
    <div class="text-center space-y-4 max-w-2xl">
      <h1 class="text-4xl font-bold text-primary">Blog ZSCOREPRO</h1>
      <p class="text-lg text-muted">
        Artigos educacionais explorando conceitos de psicometria, estatística e teoria dos testes.
      </p>
    </div>

    <!-- Filtro de Tabs Dinâmicas -->
    <div class="w-full max-w-5xl flex justify-center mb-4">
      <UTabs :items="tabItems" v-model="selectedTabIndex" class="w-full max-w-2xl" />
    </div>

    <!-- Grid de Artigos -->
    <div class="grid gap-6 md:grid-cols-2 w-full max-w-5xl">
      <UCard
        v-for="post in filteredPosts"
        :key="post.path"
        class="flex flex-col h-full transition-shadow hover:shadow-lg overflow-hidden"
        :ui="{ body: { padding: '' }, header: { padding: '' } }"
        variant="soft"
      >
        <template #header>
           <img v-if="post.meta?.image" :src="post.meta.image" :alt="post.title" class="w-full h-48 object-cover" />
        </template>
        
        <div class="p-6 flex flex-col flex-grow">
          <div v-if="post.meta?.date" class="text-xs text-primary mb-2 font-mono">
            {{ post.meta.date }}
          </div>
          <h2 class="text-xl font-bold mb-3">{{ post.title }}</h2>
          <p class="text-muted text-sm flex-grow">
            {{ post.description }}
          </p>

          <div v-if="post.meta?.tags" class="flex flex-wrap gap-2 mt-5">
            <UBadge v-for="tag in post.meta.tags" :key="tag" variant="subtle" size="xs">{{ tag }}</UBadge>
          </div>
        </div>
        
        <template #footer>
          <UButton
            :to="post.path"
            variant="ghost"
            icon="i-heroicons-arrow-right"
            trailing
          >
            Ler Artigo
          </UButton>
        </template>
      </UCard>
    </div>
  </UContainer>
</template>