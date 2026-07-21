<script setup lang="ts">
import type { Database } from '~/types/database.types'
import type { PostWithMeta } from '~/composables/usePosts'

const route = useRoute()
const supabase = useSupabaseClient<Database>()
const { getPublishedPostsByAuthor } = usePosts()

const username = computed(() => route.params.username as string)

const { data: member } = await useAsyncData(`equipe-${username.value}`, async () => {
  const { data } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, bio, role, instagram, linkedin, twitter, github, created_at')
    .eq('username', username.value)
    .in('role', ['admin', 'author'])
    .single()
  return data
})

if (!member.value) {
  throw createError({ statusCode: 404, statusMessage: 'Membro não encontrado' })
}

const { data: posts, pending: postsPending } = await useAsyncData(
  `equipe-posts-${member.value.id}`,
  async () => {
    const { data } = await getPublishedPostsByAuthor(member.value!.id)
    return (data ?? []) as PostWithMeta[]
  },
)

const links = computed(() => socialLinks(member.value as unknown as Record<string, unknown>))

const memberSince = computed(() =>
  member.value?.created_at
    ? new Date(member.value.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : null,
)

useSeoMeta({
  title: () => `${member.value?.username ?? 'Membro'} · Equipe · ZSCOREPRO`,
  description: () => member.value?.bio ?? 'Conheça este membro da equipe ZSCOREPRO.',
})
</script>

<template>
  <UContainer v-if="member" class="py-16 max-w-4xl space-y-12">
    <UButton to="/equipe" variant="ghost" size="sm" icon="i-heroicons-arrow-left">
      Voltar para a equipe
    </UButton>

    <div class="grid md:grid-cols-[minmax(0,20rem)_1fr] gap-8 md:gap-10 items-start">
      <!-- Foto sem cortar -->
      <div class="w-full rounded-2xl bg-(--ui-bg-elevated) overflow-hidden flex items-center justify-center">
        <img
          v-if="member.avatar_url"
          :src="member.avatar_url"
          :alt="member.username ?? 'Membro'"
          class="w-full max-h-[28rem] object-contain"
        >
        <div v-else class="w-full h-72 flex items-center justify-center opacity-30">
          <UIcon name="i-heroicons-user" class="text-7xl" />
        </div>
      </div>

      <!-- Info -->
      <div class="space-y-5">
        <div class="space-y-2">
          <div class="flex items-center gap-3 flex-wrap">
            <h1 class="text-3xl font-bold">{{ member.username ?? 'Membro' }}</h1>
            <UBadge
              :color="member.role === 'admin' ? 'primary' : 'neutral'"
              variant="soft"
            >
              {{ roleLabel[member.role] }}
            </UBadge>
          </div>
          <p v-if="memberSince" class="text-sm text-muted">
            Membro desde {{ memberSince }}
          </p>
        </div>

        <p class="whitespace-pre-line leading-relaxed">
          {{ member.bio || 'Este membro ainda não adicionou uma biografia.' }}
        </p>

        <div v-if="links.length" class="flex items-center gap-4 pt-1">
          <a
            v-for="link in links"
            :key="link.key"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:opacity-70 transition-opacity"
          >
            <UIcon :name="link.icon" :class="['text-2xl', link.color]" />
          </a>
        </div>
      </div>
    </div>

    <!-- Posts do membro -->
    <section class="space-y-6">
      <h2 class="text-2xl font-semibold border-b border-default pb-3">
        Posts de {{ member.username ?? 'membro' }}
      </h2>

      <div v-if="postsPending" class="grid gap-6 sm:grid-cols-2">
        <USkeleton v-for="i in 2" :key="i" class="h-80 rounded-2xl" />
      </div>

      <div v-else-if="posts?.length" class="grid gap-6 sm:grid-cols-2">
        <BlogPostCard v-for="post in posts" :key="post.id" :post="post" />
      </div>

      <p v-else class="text-muted py-8 text-center">
        Nenhum post publicado ainda.
      </p>
    </section>
  </UContainer>
</template>
