<script setup lang="ts">
import type { PostWithMeta } from '~/composables/usePosts'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Admin · ZSCOREPRO' })

const user = useSupabaseUser()
const { profile } = useProfile()
const { getAdminPosts, deletePost } = usePosts()
const toast = useToast()

const posts = ref<PostWithMeta[]>([])
const loading = ref(true)

const load = async () => {
  loading.value = true
  const { data } = await getAdminPosts()
  posts.value = (data ?? []) as PostWithMeta[]
  loading.value = false
}

onMounted(load)

const remove = async (id: string) => {
  if (!confirm('Tem certeza que deseja excluir este post?')) return
  const { error } = await deletePost(id)
  if (error) {
    toast.add({ title: 'Erro ao excluir', color: 'error' })
  } else {
    posts.value = posts.value.filter((p) => p.id !== id)
    toast.add({ title: 'Post excluído', color: 'success' })
  }
}

const stats = computed(() => ({
  total: posts.value.length,
  published: posts.value.filter((p) => p.published).length,
  drafts: posts.value.filter((p) => !p.published).length,
  likes: posts.value.reduce((acc, p) => acc + (p.post_likes?.[0]?.count ?? 0), 0),
}))

const formattedDate = (d: string) =>
  new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
</script>

<template>
  <UContainer class="py-10 space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold">Painel Administrativo</h1>
        <p class="text-muted text-sm mt-1">Olá, {{ profile?.username ?? user?.email }}</p>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          v-if="profile?.role === 'admin'"
          to="/admin/painel"
          variant="outline"
          icon="i-heroicons-shield-check"
        >
          Painel Master
        </UButton>
        <UButton to="/admin/posts/new" icon="i-heroicons-plus">Novo Post</UButton>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <UCard variant="soft" class="text-center">
        <div class="text-3xl font-bold text-primary">{{ stats.total }}</div>
        <div class="text-sm text-muted mt-1">Posts totais</div>
      </UCard>
      <UCard variant="soft" class="text-center">
        <div class="text-3xl font-bold text-success">{{ stats.published }}</div>
        <div class="text-sm text-muted mt-1">Publicados</div>
      </UCard>
      <UCard variant="soft" class="text-center">
        <div class="text-3xl font-bold text-warning">{{ stats.drafts }}</div>
        <div class="text-sm text-muted mt-1">Rascunhos</div>
      </UCard>
      <UCard variant="soft" class="text-center">
        <div class="text-3xl font-bold text-info">{{ stats.likes }}</div>
        <div class="text-sm text-muted mt-1">Curtidas</div>
      </UCard>
    </div>

    <!-- Posts table -->
    <UCard>
      <template #header>
        <span class="font-semibold">Seus Posts</span>
      </template>

      <div v-if="loading" class="space-y-3 p-2">
        <USkeleton v-for="i in 4" :key="i" class="h-14 w-full rounded-xl" />
      </div>

      <div v-else-if="!posts.length" class="text-center py-12 text-muted">
        <UIcon name="i-heroicons-document-plus" class="text-4xl mb-3" />
        <p>Nenhum post ainda.</p>
        <UButton to="/admin/posts/new" class="mt-4" variant="outline" size="sm">Criar primeiro post</UButton>
      </div>

      <div v-else class="divide-y divide-gray-100 dark:divide-gray-800">
        <div
          v-for="post in posts"
          :key="post.id"
          class="flex items-center gap-4 py-3 px-1 hover:bg-gray-50 dark:hover:bg-gray-900/30 rounded-lg transition-colors"
        >
          <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
            <img v-if="post.cover_image" :src="post.cover_image" class="w-full h-full object-cover" :alt="post.title" />
            <div v-else class="w-full h-full flex items-center justify-center">
              <UIcon name="i-heroicons-document-text" class="text-muted text-xl" />
            </div>
          </div>

          <div class="flex-1 min-w-0">
            <p class="font-medium truncate">{{ post.title }}</p>
            <div class="flex items-center gap-3 mt-0.5">
              <UBadge :color="post.published ? 'success' : 'warning'" variant="soft" size="xs">
                {{ post.published ? 'Publicado' : 'Rascunho' }}
              </UBadge>
              <span class="text-xs text-muted">{{ formattedDate(post.created_at) }}</span>
              <span class="text-xs text-muted flex items-center gap-1">
                <UIcon name="i-ph-brain" class="text-xs" /> {{ post.post_likes?.[0]?.count ?? 0 }}
              </span>
              <span class="text-xs text-muted flex items-center gap-1">
                <UIcon name="i-heroicons-chat-bubble-left" class="text-xs" /> {{ post.comments?.[0]?.count ?? 0 }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <UButton :to="`/blog/${post.slug}`" variant="ghost" size="xs" icon="i-heroicons-eye" target="_blank" />
            <UButton :to="`/admin/posts/${post.id}/edit`" variant="ghost" size="xs" icon="i-heroicons-pencil" />
            <UButton variant="ghost" size="xs" color="error" icon="i-heroicons-trash" @click="remove(post.id)" />
          </div>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>
