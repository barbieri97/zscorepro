<script setup lang="ts">
import type { PostWithMeta } from '~/composables/usePosts'

useSeoMeta({
  title: 'Blog · ZSCOREPRO',
  description: 'Artigos educacionais sobre psicometria, estatística e teoria dos testes.',
})

const { getPublishedPosts } = usePosts()

const { data: posts, pending } = await useAsyncData('blog-posts', async () => {
  const { data } = await getPublishedPosts()
  return (data ?? []) as PostWithMeta[]
})

const allTags = computed(() => {
  if (!posts.value) return []
  const tags = new Set<string>()
  posts.value.forEach((p) => p.tags?.forEach((t) => tags.add(t)))
  return Array.from(tags)
})

const tabItems = computed(() => [
  { label: 'Todos', key: 'all' },
  ...allTags.value.map((t) => ({ label: t, key: t })),
])

const selectedTab = ref(0)

const filteredPosts = computed(() => {
  if (!posts.value) return []
  const selected = tabItems.value[selectedTab.value]
  if (!selected || selected.key === 'all') return posts.value
  return posts.value.filter((p) => p.tags?.includes(selected.label))
})
</script>

<template>
  <UContainer class="py-16 space-y-12 flex flex-col items-center">
    <div class="text-center space-y-4 max-w-2xl">
      <h1 class="text-4xl font-bold text-primary">Blog ZSCOREPRO</h1>
      <p class="text-lg text-muted">
        Artigos educacionais explorando conceitos de psicometria, estatística e teoria dos testes.
      </p>
    </div>

    <div v-if="allTags.length" class="w-full max-w-5xl flex justify-center">
      <UTabs :items="tabItems" v-model="selectedTab" class="w-full max-w-2xl" />
    </div>

    <!-- Loading -->
    <div v-if="pending" class="grid gap-6 md:grid-cols-2 w-full max-w-5xl">
      <USkeleton v-for="i in 4" :key="i" class="h-80 rounded-2xl" />
    </div>

    <!-- Empty -->
    <div v-else-if="!filteredPosts.length" class="text-center py-16 space-y-3">
      <UIcon name="i-heroicons-document-magnifying-glass" class="text-5xl text-muted" />
      <p class="text-muted">Nenhum post encontrado.</p>
    </div>

    <!-- Grid -->
    <div v-else class="grid gap-6 md:grid-cols-2 w-full max-w-5xl">
      <BlogPostCard v-for="post in filteredPosts" :key="post.id" :post="post" />
    </div>
  </UContainer>
</template>
