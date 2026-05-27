<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'Entrar · ZSCOREPRO' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const toast = useToast()

const mode = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')
const loading = ref(false)
const googleLoading = ref(false)
const errorMsg = ref('')

if (user.value) {
  router.push('/')
}

const handleEmailAuth = async () => {
  if (!email.value.trim() || !password.value) return
  loading.value = true
  errorMsg.value = ''

  if (mode.value === 'login') {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value,
    })
    loading.value = false
    if (error) {
      errorMsg.value = 'E-mail ou senha incorretos.'
    } else {
      router.push('/')
    }
  } else {
    const { error } = await supabase.auth.signUp({
      email: email.value.trim(),
      password: password.value,
    })
    loading.value = false
    if (error) {
      errorMsg.value = error.message
    } else {
      toast.add({ title: 'Conta criada!', description: 'Você já pode entrar.', color: 'success' })
      mode.value = 'login'
    }
  }
}

const handleGoogleLogin = async () => {
  googleLoading.value = true
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/confirm`,
    },
  })
  if (error) {
    toast.add({ title: 'Erro ao conectar com o Google', description: error.message, color: 'error' })
    googleLoading.value = false
  }
}
</script>

<template>
  <UContainer class="py-20 flex justify-center">
    <div class="w-full max-w-md space-y-8">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold">
          {{ mode === 'login' ? 'Entrar' : 'Criar conta' }}
        </h1>
        <p class="text-muted">
          {{ mode === 'login' ? 'Acesse sua conta no ZSCOREPRO.' : 'Crie sua conta gratuitamente.' }}
        </p>
      </div>

      <UCard variant="soft">
        <div class="space-y-4">
          <UButton
            block
            size="lg"
            color="neutral"
            variant="outline"
            :loading="googleLoading"
            @click="handleGoogleLogin"
          >
            <template #leading>
              <svg class="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </template>
            Continuar com Google
          </UButton>

          <div class="flex items-center gap-3">
            <div class="flex-1 h-px bg-muted" />
            <span class="text-xs text-muted">ou</span>
            <div class="flex-1 h-px bg-muted" />
          </div>

          <div class="space-y-3">
            <div class="space-y-1">
              <label class="text-sm font-medium">E-mail</label>
              <UInput
                v-model="email"
                type="email"
                placeholder="seu@email.com"
                size="lg"
                class="w-full"
                :disabled="loading"
                autocomplete="email"
              />
            </div>

            <div class="space-y-1">
              <label class="text-sm font-medium">Senha</label>
              <UInput
                v-model="password"
                type="password"
                placeholder="••••••••"
                size="lg"
                class="w-full"
                :disabled="loading"
                :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
                @keydown.enter="handleEmailAuth"
              />
            </div>
          </div>

          <UAlert v-if="errorMsg" color="error" variant="soft" :description="errorMsg" />

          <UButton
            block
            size="lg"
            :loading="loading"
            :disabled="!email.trim() || !password"
            @click="handleEmailAuth"
          >
            {{ mode === 'login' ? 'Entrar' : 'Criar conta' }}
          </UButton>

          <p class="text-sm text-center text-muted">
            {{ mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?' }}
            <UButton variant="link" size="sm" class="p-0" @click="mode = mode === 'login' ? 'register' : 'login'; errorMsg = ''">
              {{ mode === 'login' ? 'Criar conta' : 'Entrar' }}
            </UButton>
          </p>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
