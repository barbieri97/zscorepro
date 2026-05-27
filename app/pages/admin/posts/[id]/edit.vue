<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const route = useRoute()
const postId = route.params.id as string
const { getPostById, updatePost } = usePosts()
const toast = useToast()
const router = useRouter()

const { data: post, pending } = await useAsyncData(`edit-post-${postId}`, async () => {
  const { data } = await getPostById(postId)
  return data
})

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post não encontrado' })
}

useSeoMeta({ title: `Editar: ${post.value?.title ?? ''} · Admin` })

const form = reactive({
  title: post.value?.title ?? '',
  slug: post.value?.slug ?? '',
  excerpt: post.value?.excerpt ?? '',
  content: post.value?.content ?? '',
  cover_image: post.value?.cover_image ?? null as string | null,
  tags: [...(post.value?.tags ?? [])],
  reading_time_minutes: post.value?.reading_time_minutes ?? 1,
  published: post.value?.published ?? false,
})

const tagInput = ref('')
const saving = ref(false)

const onWordCount = (words: number) => {
  form.reading_time_minutes = calcReadingTime(words)
}

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !form.tags.includes(tag)) form.tags.push(tag)
  tagInput.value = ''
}

const removeTag = (tag: string) => {
  form.tags = form.tags.filter((t) => t !== tag)
}

const save = async (action: 'draft' | 'publish' | 'unpublish') => {
  if (!form.title.trim() || !form.slug.trim()) {
    toast.add({ title: 'Preencha o título e o slug.', color: 'error' })
    return
  }

  saving.value = true

  const updates: Record<string, unknown> = {
    title: form.title,
    slug: form.slug,
    excerpt: form.excerpt || null,
    content: form.content || null,
    cover_image: form.cover_image,
    tags: form.tags,
    reading_time_minutes: form.reading_time_minutes,
  }

  if (action === 'publish') {
    updates.published = true
    updates.published_at = new Date().toISOString()
  } else if (action === 'unpublish') {
    updates.published = false
    updates.published_at = null
  }

  const { error } = await updatePost(postId, updates as Parameters<typeof updatePost>[1])
  saving.value = false

  if (error) {
    toast.add({ title: 'Erro ao salvar', description: (error as Error).message, color: 'error' })
    return
  }

  if (action === 'publish') form.published = true
  if (action === 'unpublish') form.published = false

  toast.add({
    title: action === 'publish' ? 'Publicado!' : action === 'unpublish' ? 'Despublicado' : 'Salvo!',
    color: 'success',
  })
}
</script>

<template>
  <UContainer class="py-10 max-w-4xl space-y-8">
    <div class="flex items-center gap-4">
      <UButton to="/admin" variant="ghost" icon="i-heroicons-arrow-left">Admin</UButton>
      <h1 class="text-xl font-bold">Editar Post</h1>
      <UBadge :color="form.published ? 'success' : 'warning'" variant="soft" class="ml-auto">
        {{ form.published ? 'Publicado' : 'Rascunho' }}
      </UBadge>
    </div>

    <div v-if="pending" class="space-y-4">
      <USkeleton class="h-12 w-full rounded-xl" />
      <USkeleton class="h-96 w-full rounded-xl" />
    </div>

    <div v-else class="grid lg:grid-cols-3 gap-6">
      <!-- Main content -->
      <div class="lg:col-span-2 space-y-6">
        <UCard variant="soft">
          <template #header><span class="font-semibold">Conteúdo</span></template>
          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Título *</label>
              <UInput v-model="form.title" placeholder="Título do post" size="lg" class="w-full" />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Slug *</label>
              <UInput v-model="form.slug" placeholder="slug-do-post" class="w-full font-mono text-sm" />
              <p class="text-xs text-muted">URL: /blog/{{ form.slug }}</p>
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Resumo</label>
              <UTextarea v-model="form.excerpt" placeholder="Breve descrição..." :rows="2" class="w-full" />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium flex items-center justify-between">
                <span>Conteúdo</span>
                <span class="text-xs text-muted font-normal">≈ {{ form.reading_time_minutes }} min de leitura</span>
              </label>
              <ClientOnly>
                <AdminTipTapEditor v-model="form.content" @word-count="onWordCount" />
              </ClientOnly>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <UCard variant="soft">
          <template #header><span class="font-semibold">Publicação</span></template>
          <div class="space-y-3">
            <UButton block :loading="saving" variant="outline" icon="i-heroicons-document" @click="save('draft')">
              Salvar Alterações
            </UButton>
            <UButton
              v-if="!form.published"
              block :loading="saving" icon="i-heroicons-globe-alt"
              @click="save('publish')"
            >
              Publicar
            </UButton>
            <UButton
              v-else
              block :loading="saving" variant="outline" color="warning" icon="i-heroicons-eye-slash"
              @click="save('unpublish')"
            >
              Despublicar
            </UButton>
            <UButton
              block variant="ghost" size="sm" :to="`/blog/${form.slug}`" target="_blank"
              icon="i-heroicons-arrow-top-right-on-square"
            >
              Ver no Blog
            </UButton>
          </div>
        </UCard>

        <AdminImageUploader v-model="form.cover_image" bucket="post-covers" label="Imagem de Capa" />

        <UCard variant="soft">
          <template #header><span class="font-semibold">Tags</span></template>
          <div class="space-y-3">
            <div class="flex gap-2">
              <UInput v-model="tagInput" placeholder="Nova tag" class="flex-1" @keydown.enter.prevent="addTag" />
              <UButton icon="i-heroicons-plus" variant="outline" @click="addTag" />
            </div>
            <div v-if="form.tags.length" class="flex flex-wrap gap-2">
              <div v-for="tag in form.tags" :key="tag" class="flex items-center gap-1">
                <UBadge variant="soft">{{ tag }}</UBadge>
                <button class="text-xs text-muted hover:text-error" @click="removeTag(tag)">×</button>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
