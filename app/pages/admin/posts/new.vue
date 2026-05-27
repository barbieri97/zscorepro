<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Novo Post · Admin' })

const user = useSupabaseUser()
const { createPost } = usePosts()
const toast = useToast()
const router = useRouter()

const form = reactive({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image: null as string | null,
  tags: [] as string[],
  reading_time_minutes: 1,
})

const tagInput = ref('')
const saving = ref(false)

// Auto-gera o slug ao digitar o título
watch(() => form.title, (title) => {
  form.slug = slugify(title)
})

// Calcula o tempo de leitura pelo contador de palavras do editor
const onWordCount = (words: number) => {
  form.reading_time_minutes = calcReadingTime(words)
}

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag)
  }
  tagInput.value = ''
}

const removeTag = (tag: string) => {
  form.tags = form.tags.filter((t) => t !== tag)
}

const save = async (publish = false) => {
  if (!form.title.trim() || !form.slug.trim()) {
    toast.add({ title: 'Preencha o título e o slug.', color: 'error' })
    return
  }
  if (!user.value) return

  saving.value = true
  const { data, error } = await createPost({
    author_id: user.value.sub as string,
    title: form.title,
    slug: form.slug,
    excerpt: form.excerpt || null,
    content: form.content || null,
    cover_image: form.cover_image,
    tags: form.tags,
    reading_time_minutes: form.reading_time_minutes,
    published: publish,
    published_at: publish ? new Date().toISOString() : null,
  })

  saving.value = false

  if (error) {
    toast.add({ title: 'Erro ao salvar', description: (error as Error).message, color: 'error' })
    return
  }

  toast.add({ title: publish ? 'Post publicado!' : 'Rascunho salvo!', color: 'success' })
  router.push(`/admin/posts/${data?.id}/edit`)
}
</script>

<template>
  <UContainer class="py-10 max-w-4xl space-y-8">
    <div class="flex items-center gap-4">
      <UButton to="/admin" variant="ghost" icon="i-heroicons-arrow-left">Admin</UButton>
      <h1 class="text-xl font-bold">Novo Post</h1>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
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
              <p class="text-xs text-muted">URL: /blog/{{ form.slug || '...' }}</p>
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Resumo</label>
              <UTextarea v-model="form.excerpt" placeholder="Breve descrição exibida na listagem..." :rows="2" class="w-full" />
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
            <UButton block :loading="saving" variant="outline" icon="i-heroicons-document" @click="save(false)">
              Salvar Rascunho
            </UButton>
            <UButton block :loading="saving" icon="i-heroicons-globe-alt" @click="save(true)">
              Publicar
            </UButton>
          </div>
        </UCard>

        <AdminImageUploader v-model="form.cover_image" bucket="post-covers" label="Imagem de Capa" />

        <UCard variant="soft">
          <template #header><span class="font-semibold">Tags</span></template>
          <div class="space-y-3">
            <div class="flex gap-2">
              <UInput
                v-model="tagInput"
                placeholder="Nova tag"
                class="flex-1"
                @keydown.enter.prevent="addTag"
              />
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
