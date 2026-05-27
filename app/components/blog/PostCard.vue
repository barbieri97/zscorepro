<script setup lang="ts">
import type { PostWithMeta } from '~/composables/usePosts'

const props = defineProps<{ post: PostWithMeta }>()

const likesCount = computed(() => props.post.post_likes?.[0]?.count ?? 0)
const commentsCount = computed(() => props.post.comments?.[0]?.count ?? 0)

const formattedDate = computed(() => {
  const date = props.post.published_at || props.post.created_at
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
})
</script>

<template>
  <UCard
    class="flex flex-col h-full transition-all hover:shadow-lg overflow-hidden group"
    :ui="{ body: { padding: '' }, header: { padding: '' } }"
    variant="soft"
  >
    <template #header>
      <NuxtLink :to="`/blog/${post.slug}`">
        <div class="w-full h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            v-if="post.cover_image"
            :src="post.cover_image"
            :alt="post.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div v-else class="w-full h-full flex items-center justify-center opacity-30">
            <UIcon name="i-heroicons-document-text" class="text-5xl" />
          </div>
        </div>
      </NuxtLink>
    </template>

    <div class="p-5 flex flex-col flex-grow">
      <div class="flex items-center gap-2 mb-3 flex-wrap">
        <span class="text-xs text-primary font-mono">{{ formattedDate }}</span>
        <span v-if="post.reading_time_minutes" class="text-xs text-muted">
          · {{ post.reading_time_minutes }} min de leitura
        </span>
      </div>

      <NuxtLink :to="`/blog/${post.slug}`">
        <h2 class="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {{ post.title }}
        </h2>
      </NuxtLink>

      <p class="text-muted text-sm flex-grow line-clamp-3">{{ post.excerpt }}</p>

      <div v-if="post.tags?.length" class="flex flex-wrap gap-1.5 mt-4">
        <UBadge v-for="tag in post.tags.slice(0, 3)" :key="tag" variant="subtle" size="xs">
          {{ tag }}
        </UBadge>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <div v-if="post.profiles" class="flex items-center gap-2">
          <UAvatar
            :src="post.profiles.avatar_url ?? undefined"
            :alt="post.profiles.username ?? 'Autor'"
            size="xs"
          />
          <span class="text-xs font-medium">{{ post.profiles.username }}</span>
        </div>
        <div v-else class="flex-1" />

        <div class="flex items-center gap-3 text-xs text-muted">
          <span class="flex items-center gap-1">
            <UIcon name="i-ph-brain" class="text-sm" />
            {{ likesCount }}
          </span>
          <span class="flex items-center gap-1">
            <UIcon name="i-heroicons-chat-bubble-left" class="text-sm" />
            {{ commentsCount }}
          </span>
          <UButton :to="`/blog/${post.slug}`" variant="ghost" size="xs" trailing icon="i-heroicons-arrow-right">
            Ler
          </UButton>
        </div>
      </div>
    </template>
  </UCard>
</template>
