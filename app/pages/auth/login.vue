<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'Entrar · ZSCOREPRO' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const email = ref('')
const loading = ref(false)
const sent = ref(false)
const errorMsg = ref('')

if (user.value) {
  router.push('/')
}

const sendMagicLink = async () => {
  if (!email.value.trim()) return
  loading.value = true
  errorMsg.value = ''

  const { error } = await supabase.auth.signInWithOtp({
    email: email.value.trim(),
    options: {
      emailRedirectTo: `${window.location.origin}/auth/confirm`,
    },
  })

  loading.value = false

  if (error) {
    errorMsg.value = error.message
  } else {
    sent.value = true
  }
}
</script>

<template>
  <UContainer class="py-20 flex justify-center">
    <div class="w-full max-w-md space-y-8">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold">Entrar</h1>
        <p class="text-muted">Receba um link mágico no seu e-mail para acessar sua conta.</p>
      </div>

      <UCard variant="soft">
        <div v-if="!sent" class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">E-mail</label>
            <UInput
              v-model="email"
              type="email"
              placeholder="seu@email.com"
              size="lg"
              class="w-full"
              :disabled="loading"
              @keydown.enter="sendMagicLink"
            />
          </div>

          <UAlert v-if="errorMsg" color="error" variant="soft" :description="errorMsg" />

          <UButton
            block
            size="lg"
            :loading="loading"
            :disabled="!email.trim()"
            icon="i-heroicons-envelope"
            @click="sendMagicLink"
          >
            Enviar link mágico
          </UButton>

          <p class="text-xs text-center text-muted">
            Ao entrar, você concorda com os termos de uso.
            Novos usuários recebem o papel de <strong>usuário comum</strong> por padrão.
          </p>
        </div>

        <div v-else class="text-center space-y-4 py-4">
          <div class="text-5xl">📬</div>
          <h2 class="text-xl font-bold">Verifique o seu e-mail</h2>
          <p class="text-muted text-sm">
            Enviamos um link para <strong>{{ email }}</strong>.<br />
            Clique no link para entrar.
          </p>
          <UButton variant="ghost" size="sm" @click="sent = false; email = ''">
            Usar outro e-mail
          </UButton>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
