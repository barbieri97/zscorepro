<script setup lang="ts">
import type { PostWithMeta } from '~/composables/usePosts'

const route = useRoute()
const slug = route.params.slug as string
const { getPostBySlug } = usePosts()

const { data: post, error } = await useAsyncData(`post-${slug}`, async () => {
  const { data, error } = await getPostBySlug(slug)
  if (error) return null
  return data as PostWithMeta
})

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post não encontrado' })
}

useSeoMeta({
  title: () => `${post.value?.title ?? 'Post'} · ZSCOREPRO`,
  description: () => post.value?.excerpt ?? '',
  ogImage: () => post.value?.cover_image ?? undefined,
  ogType: 'article',
})

const likesCount = computed(() => post.value?.post_likes?.[0]?.count ?? 0)

const formattedDate = computed(() => {
  if (!post.value) return ''
  const d = post.value.published_at || post.value.created_at
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
})
</script>

<template>
  <UContainer class="py-12 flex justify-center">
    <div class="w-full max-w-3xl space-y-8">

      <UButton to="/blog" variant="ghost" icon="i-heroicons-arrow-left">
        Voltar para o Blog
      </UButton>

      <article v-if="post">
        <!-- Cover -->
        <div v-if="post.cover_image" class="rounded-2xl overflow-hidden mb-8 shadow-md">
          <img :src="post.cover_image" :alt="post.title" class="w-full h-64 md:h-96 object-cover" />
        </div>

        <!-- Header -->
        <header class="mb-10 space-y-5">
          <div class="flex flex-wrap gap-2">
            <UBadge v-for="tag in post.tags" :key="tag" variant="soft" color="primary">{{ tag }}</UBadge>
          </div>

          <h1 class="text-3xl sm:text-4xl font-extrabold leading-tight">{{ post.title }}</h1>

          <div class="flex items-center flex-wrap gap-4">
            <div v-if="post.profiles" class="flex items-center gap-2">
              <UAvatar :src="post.profiles.avatar_url ?? undefined" :alt="post.profiles.username ?? 'Autor'" size="sm" />
              <span class="text-sm font-medium">{{ post.profiles.username }}</span>
            </div>
            <span class="text-sm text-muted">{{ formattedDate }}</span>
            <span v-if="post.reading_time_minutes" class="text-sm text-muted">
              · {{ post.reading_time_minutes }} min de leitura
            </span>
          </div>
        </header>

        <!-- Content -->
        <UCard variant="soft" class="mb-8">
          <div class="blog-content" v-html="post.content" />
        </UCard>

        <!-- Likes -->
        <div class="flex flex-col items-center gap-2 py-8 border-y border-gray-200 dark:border-gray-700 mb-8">
          <p class="text-sm text-muted mb-2">Gostou do artigo?</p>
          <BlogPostLikes :post-id="post.id" :initial-count="likesCount" />
        </div>

        <!-- Comments -->
        <BlogCommentSection :post-id="post.id" />
      </article>
    </div>
  </UContainer>
</template>

<style>
.blog-content { line-height: 1.8; }
.blog-content > * + * { margin-top: 1rem; }
.blog-content h1 { font-size: 1.875rem; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; }
.blog-content h2 { font-size: 1.5rem; font-weight: 600; margin-top: 1.75rem; margin-bottom: 0.5rem; color: var(--ui-primary); }
.blog-content h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; }
.blog-content ul { list-style-type: disc; padding-left: 1.75rem; }
.blog-content ol { list-style-type: decimal; padding-left: 1.75rem; }
.blog-content li { margin-bottom: 0.25rem; }
.blog-content blockquote { border-left: 3px solid var(--ui-primary); padding-left: 1rem; opacity: 0.85; font-style: italic; margin: 1.5rem 0; }
.blog-content code { background: rgba(128,128,128,0.12); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875em; }
.blog-content pre { background: rgba(128,128,128,0.1); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1.5rem 0; }
.blog-content pre code { background: none; padding: 0; }
.blog-content hr { border: none; border-top: 2px solid rgba(128,128,128,0.2); margin: 2rem 0; }
.blog-content img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0; }
.blog-content a { color: var(--ui-primary); text-decoration: underline; }
.blog-content strong { font-weight: 700; }
.blog-content em { font-style: italic; }
</style>
