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
  return Array.from(tags).sort()
})

const selectedTags = ref<string[]>([])

const filteredPosts = computed(() => {
  if (!posts.value) return []
  if (!selectedTags.value.length) return posts.value
  return posts.value.filter((p) =>
    selectedTags.value.some((tag) => p.tags?.includes(tag))
  )
})

const removeTag = (tag: string) => {
  selectedTags.value = selectedTags.value.filter((t) => t !== tag)
}
</script>

<template>
  <UContainer class="py-16 space-y-12 flex flex-col items-center">
    <div class="text-center space-y-4 max-w-2xl">
      <h1 class="text-4xl font-bold text-primary">Blog ZSCOREPRO</h1>
      <p class="text-lg text-muted">
        Artigos educacionais explorando conceitos de psicometria, estatística e teoria dos testes.
      </p>
    </div>

    <div v-if="allTags.length" class="w-full max-w-5xl space-y-3">
      <div class="flex items-center gap-3">
        <USelectMenu
          v-model="selectedTags"
          :items="allTags"
          multiple
          searchable
          placeholder="Filtrar por tags..."
          class="w-72"
        />
        <UButton
          v-if="selectedTags.length"
          variant="ghost"
          size="sm"
          icon="i-heroicons-x-mark"
          @click="selectedTags = []"
        >
          Limpar
        </UButton>
      </div>

      <div v-if="selectedTags.length" class="flex flex-wrap gap-2">
        <UBadge
          v-for="tag in selectedTags"
          :key="tag"
          variant="soft"
          class="cursor-pointer"
          @click="removeTag(tag)"
        >
          {{ tag }}
          <UIcon name="i-heroicons-x-mark" class="ml-1 size-3" />
        </UBadge>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="grid gap-6 md:grid-cols-2 w-full max-w-5xl">
      <USkeleton v-for="i in 4" :key="i" class="h-80 rounded-2xl" />
    </div>

    <!-- Empty -->
    <div v-else-if="!filteredPosts.length" class="text-center py-16 space-y-3">
      <UIcon name="i-heroicons-document-magnifying-glass" class="text-5xl text-muted" />
      <p class="text-muted">Nenhum post encontrado para as tags selecionadas.</p>
    </div>

    <!-- Grid -->
    <div v-else class="grid gap-6 md:grid-cols-2 w-full max-w-5xl">
      <BlogPostCard v-for="post in filteredPosts" :key="post.id" :post="post" />
    </div>
  </UContainer>
</template>
