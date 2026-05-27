<script setup lang="ts">
import type { Database } from '~/types/database.types'

useSeoMeta({ title: 'Equipe · ZSCOREPRO' })

const supabase = useSupabaseClient<Database>()

const { data: members, pending } = await useAsyncData('equipe', async () => {
  const { data } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, bio, role')
    .in('role', ['admin', 'author'])
    .order('role', { ascending: true })
    .order('username', { ascending: true })
  return data ?? []
})

const admins = computed(() => members.value?.filter(m => m.role === 'admin') ?? [])
const authors = computed(() => members.value?.filter(m => m.role === 'author') ?? [])

const roleLabel: Record<string, string> = {
  admin: 'Administrador',
  author: 'Autor',
}
</script>

<template>
  <UContainer class="py-16 max-w-4xl space-y-16">
    <div class="text-center space-y-3">
      <h1 class="text-4xl font-bold">Nossa Equipe</h1>
      <p class="text-muted max-w-xl mx-auto">
        Conheça as pessoas por trás do ZSCOREPRO.
      </p>
    </div>

    <div v-if="pending" class="grid sm:grid-cols-2 gap-6">
      <USkeleton v-for="i in 4" :key="i" class="h-40 rounded-2xl" />
    </div>

    <template v-else>
      <!-- Admins -->
      <section v-if="admins.length" class="space-y-6">
        <h2 class="text-xl font-semibold border-b border-default pb-3">Administração</h2>
        <div class="grid sm:grid-cols-2 gap-6">
          <UCard v-for="member in admins" :key="member.id" variant="soft">
            <div class="flex gap-4 items-start">
              <UAvatar
                :src="member.avatar_url ?? undefined"
                :alt="member.username ?? 'Usuário'"
                size="xl"
              />
              <div class="flex-1 min-w-0 space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-semibold truncate">{{ member.username ?? 'Usuário' }}</span>
                  <UBadge color="primary" variant="soft" size="xs">
                    {{ roleLabel[member.role] }}
                  </UBadge>
                </div>
                <p class="text-sm text-muted line-clamp-3">
                  {{ member.bio ?? 'Sem bio.' }}
                </p>
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <!-- Authors -->
      <section v-if="authors.length" class="space-y-6">
        <h2 class="text-xl font-semibold border-b border-default pb-3">Autores</h2>
        <div class="grid sm:grid-cols-2 gap-6">
          <UCard v-for="member in authors" :key="member.id" variant="soft">
            <div class="flex gap-4 items-start">
              <UAvatar
                :src="member.avatar_url ?? undefined"
                :alt="member.username ?? 'Usuário'"
                size="xl"
              />
              <div class="flex-1 min-w-0 space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-semibold truncate">{{ member.username ?? 'Usuário' }}</span>
                  <UBadge color="neutral" variant="soft" size="xs">
                    {{ roleLabel[member.role] }}
                  </UBadge>
                </div>
                <p class="text-sm text-muted line-clamp-3">
                  {{ member.bio ?? 'Sem bio.' }}
                </p>
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <div v-if="!admins.length && !authors.length" class="text-center text-muted py-16">
        Nenhum membro da equipe cadastrado ainda.
      </div>
    </template>
  </UContainer>
</template>
