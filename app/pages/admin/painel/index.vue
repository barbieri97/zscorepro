<script setup lang="ts">
import type { PostWithMeta } from '~/composables/usePosts'
import type { ProfileWithRole } from '~/composables/useAdmin'
import type { UserRole } from '~/types/database.types'

definePageMeta({ middleware: 'super-admin' })
useSeoMeta({ title: 'Painel Master · ZSCOREPRO' })

const { getAllPostsWithAuthors, togglePostPublished, deletePost } = usePosts()
const { getAllProfiles, updateUserRole } = useAdmin()
const toast = useToast()

const tab = ref<'posts' | 'users'>('posts')

// Posts
const posts = ref<PostWithMeta[]>([])
const loadingPosts = ref(true)

const loadPosts = async () => {
  loadingPosts.value = true
  const { data } = await getAllPostsWithAuthors()
  posts.value = (data ?? []) as PostWithMeta[]
  loadingPosts.value = false
}

// Users
const profiles = ref<ProfileWithRole[]>([])
const profileRoles = reactive<Record<string, UserRole>>({})
const loadingUsers = ref(true)

const loadUsers = async () => {
  loadingUsers.value = true
  const { data } = await getAllProfiles()
  profiles.value = data ?? []
  profiles.value.forEach(p => { profileRoles[p.id] = p.role })
  loadingUsers.value = false
}

onMounted(() => {
  loadPosts()
  loadUsers()
})

const toggle = async (post: PostWithMeta) => {
  const next = !post.published
  const { error } = await togglePostPublished(post.id, next)
  if (error) {
    toast.add({ title: 'Erro ao atualizar publicação', color: 'error' })
  } else {
    post.published = next
    toast.add({ title: next ? 'Post publicado' : 'Post despublicado', color: 'success' })
  }
}

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

const roleOptions: { label: string; value: UserRole }[] = [
  { label: 'Usuário', value: 'user' },
  { label: 'Author', value: 'author' },
  { label: 'Admin', value: 'admin' },
]

const changeRole = async (profileId: string, role: UserRole) => {
  const previous = profileRoles[profileId]
  if (role === previous) return
  profileRoles[profileId] = role
  const { error } = await updateUserRole(profileId, role)
  if (error) {
    profileRoles[profileId] = previous
    toast.add({ title: 'Erro ao alterar role', color: 'error' })
  } else {
    toast.add({ title: `Role alterado para ${role}`, color: 'success' })
  }
}

const formattedDate = (d: string) =>
  new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

const roleBadgeColor = (role: UserRole) =>
  role === 'admin' ? 'error' : role === 'author' ? 'warning' : 'neutral'
</script>

<template>
  <UContainer class="py-10 space-y-8">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold">Painel Master</h1>
        <p class="text-muted text-sm mt-1">Gerenciamento completo da plataforma</p>
      </div>
      <UButton to="/admin" variant="outline" icon="i-heroicons-arrow-left" size="sm">
        Voltar ao Admin
      </UButton>
    </div>

    <div class="flex gap-2">
      <UButton
        :variant="tab === 'posts' ? 'solid' : 'outline'"
        icon="i-heroicons-document-text"
        @click="tab = 'posts'"
      >
        Publicações
      </UButton>
      <UButton
        :variant="tab === 'users' ? 'solid' : 'outline'"
        icon="i-heroicons-users"
        @click="tab = 'users'"
      >
        Usuários
      </UButton>
    </div>

    <!-- Posts -->
    <UCard v-if="tab === 'posts'">
      <template #header>
        <span class="font-semibold">Todas as Publicações</span>
      </template>

      <div v-if="loadingPosts" class="space-y-3 p-2">
        <USkeleton v-for="i in 5" :key="i" class="h-14 w-full rounded-xl" />
      </div>

      <div v-else-if="!posts.length" class="text-center py-12 text-muted">
        <UIcon name="i-heroicons-document-text" class="text-4xl mb-3" />
        <p>Nenhum post encontrado.</p>
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
            <div class="flex items-center gap-3 mt-0.5 flex-wrap">
              <UBadge :color="post.published ? 'success' : 'warning'" variant="soft" size="xs">
                {{ post.published ? 'Publicado' : 'Rascunho' }}
              </UBadge>
              <span class="text-xs text-muted">{{ formattedDate(post.created_at) }}</span>
              <span v-if="post.profiles?.username" class="text-xs text-muted flex items-center gap-1">
                <UIcon name="i-heroicons-user" class="text-xs" /> {{ post.profiles.username }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <UTooltip :text="post.published ? 'Despublicar' : 'Publicar'">
              <UButton
                variant="ghost"
                size="xs"
                :icon="post.published ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                @click="toggle(post)"
              />
            </UTooltip>
            <UButton :to="`/admin/posts/${post.id}/edit`" variant="ghost" size="xs" icon="i-heroicons-pencil" />
            <UButton variant="ghost" size="xs" color="error" icon="i-heroicons-trash" @click="remove(post.id)" />
          </div>
        </div>
      </div>
    </UCard>

    <!-- Users -->
    <UCard v-if="tab === 'users'">
      <template #header>
        <span class="font-semibold">Todos os Usuários</span>
      </template>

      <div v-if="loadingUsers" class="space-y-3 p-2">
        <USkeleton v-for="i in 5" :key="i" class="h-14 w-full rounded-xl" />
      </div>

      <div v-else-if="!profiles.length" class="text-center py-12 text-muted">
        <UIcon name="i-heroicons-users" class="text-4xl mb-3" />
        <p>Nenhum usuário encontrado.</p>
      </div>

      <div v-else class="divide-y divide-gray-100 dark:divide-gray-800">
        <div
          v-for="profile in profiles"
          :key="profile.id"
          class="flex items-center gap-4 py-3 px-1 hover:bg-gray-50 dark:hover:bg-gray-900/30 rounded-lg transition-colors"
        >
          <UAvatar
            :src="profile.avatar_url ?? undefined"
            :alt="profile.username ?? 'Usuário'"
            size="sm"
          />

          <div class="flex-1 min-w-0">
            <p class="font-medium truncate">{{ profile.username ?? 'Sem username' }}</p>
            <p class="text-xs text-muted truncate">{{ formattedDate(profile.created_at) }}</p>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <UBadge :color="roleBadgeColor(profileRoles[profile.id])" variant="soft" size="xs">
              {{ profileRoles[profile.id] }}
            </UBadge>
            <USelect
              :model-value="profileRoles[profile.id]"
              :items="roleOptions"
              size="xs"
              class="w-28"
              @update:model-value="(val) => changeRole(profile.id, val as UserRole)"
            />
          </div>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>
