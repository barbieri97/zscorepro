<script setup lang="ts">
const { items } = useNavigation()
const user = useSupabaseUser()
const { profile } = useProfile()
const supabase = useSupabaseClient()
const toast = useToast()
const router = useRouter()

const logout = async () => {
  await supabase.auth.signOut()
  toast.add({ title: 'Sessão encerrada', color: 'success' })
  router.push('/')
}

const isAdminOrAuthor = computed(() =>
  profile.value && ['author', 'admin'].includes(profile.value.role)
)

const userMenuItems = computed(() => [
  [
    {
      label: profile.value?.username ?? user.value?.email ?? 'Minha conta',
      type: 'label' as const,
    }
  ],
  [
    {
      label: 'Meu Perfil',
      icon: 'i-heroicons-user-circle',
      to: '/perfil',
    },
    ...(isAdminOrAuthor.value ? [{
      label: 'Admin',
      icon: 'i-heroicons-cog-6-tooth',
      to: '/admin',
    }] : [])
  ],
  [
    {
      label: 'Sair',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      color: 'error' as const,
      onSelect: logout,
    }
  ]
])
</script>

<template>
  <UHeader mode="slideover">
    <template #title>
      <h1 class="text-primary">ZSCOREPRO</h1>
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UColorModeButton />

      <UTooltip text="Open on GitHub" :kbds="['meta', 'G']">
        <UButton
          color="neutral"
          variant="ghost"
          to="https://github.com/barbieri97/zscorepro"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
        />
      </UTooltip>

      <template v-if="user">
        <UDropdownMenu :items="userMenuItems">
          <UButton variant="ghost" color="neutral" aria-label="Menu do usuário">
            <UAvatar
              :src="profile?.avatar_url ?? undefined"
              :alt="profile?.username ?? 'Usuário'"
              size="xs"
            />
          </UButton>
        </UDropdownMenu>
      </template>

      <UButton v-else to="/auth/login" variant="ghost" size="sm" icon="i-heroicons-user">
        Entrar
      </UButton>
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>
