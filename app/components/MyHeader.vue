<script setup lang="ts">
const { items } = useNavigation()
const { user, isLoggedIn, signOut } = useAuth()

const showAuth = ref(false)
const toast = useToast()

async function handleSignOut() {
  await signOut()
  toast.add({ title: 'Até logo!', description: 'Você saiu da sua conta.', color: 'success' })
}
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

      <!-- Auth: logged in -->
      <UDropdownMenu
        v-if="isLoggedIn"
        :items="[[{ label: 'Sair', icon: 'i-lucide-log-out', onSelect: handleSignOut }]]"
      >
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-circle-user-round"
          :label="user?.email?.split('@')[0]"
          trailing-icon="i-lucide-chevron-down"
          size="sm"
        />
      </UDropdownMenu>

      <!-- Auth: not logged in -->
      <UButton
        v-else
        size="sm"
        variant="outline"
        icon="i-lucide-log-in"
        label="Entrar"
        @click="showAuth = true"
      />
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>

  <AuthModal v-model:open="showAuth" />
</template>

