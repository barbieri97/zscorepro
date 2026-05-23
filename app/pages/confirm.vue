<script setup lang="ts">
useHead({ title: 'Email confirmado — ZSCOREPRO' })

const router = useRouter()

onMounted(() => {
  setTimeout(() => router.push('/'), 4000)
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="text-center space-y-4 max-w-sm">
      <div class="flex justify-center">
        <div class="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
          <UIcon name="i-lucide-circle-check" class="text-success w-8 h-8" />
        </div>
      </div>

      <h1 class="text-2xl font-bold">Email confirmado!</h1>
      <p class="text-muted text-sm">
        Sua conta foi verificada com sucesso. Você já pode entrar com seu email e senha.
      </p>
      <p class="text-xs text-muted">Redirecionando para a página inicial...</p>

      <UButton to="/" variant="outline" class="mt-2">
        Ir para o início agora
      </UButton>
    </div>
  </div>
</template>
