<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'Autenticando · ZSCOREPRO' })

const user = useSupabaseUser()
const router = useRouter()

watchEffect(() => {
  if (user.value) {
    router.push('/')
  }
})

onMounted(() => {
  // Timeout de segurança caso algo dê errado
  setTimeout(() => {
    if (!user.value) {
      router.push('/auth/login')
    }
  }, 5000)
})
</script>

<template>
  <UContainer class="py-20 flex justify-center">
    <div class="text-center space-y-4">
      <UIcon name="i-heroicons-arrow-path" class="text-4xl text-primary animate-spin" />
      <p class="text-muted">Autenticando...</p>
    </div>
  </UContainer>
</template>
