<script setup lang="ts">
type Tab = 'login' | 'register' | 'forgot'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { signIn, signUp, resetPassword } = useAuth()

const tab = ref<Tab>('login')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// Reset form state whenever modal opens or tab changes
watch(() => props.open, (val) => {
  if (val) resetForm()
})
watch(tab, () => resetForm())

function resetForm() {
  email.value = ''
  password.value = ''
  passwordConfirm.value = ''
  errorMsg.value = ''
  successMsg.value = ''
  loading.value = false
}

function close() {
  emit('update:open', false)
}

async function handleLogin() {
  if (!email.value || !password.value) {
    errorMsg.value = 'Preencha todos os campos.'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    await signIn(email.value, password.value)
    close()
  }
  catch (e: any) {
    errorMsg.value = translateError(e.message)
  }
  finally {
    loading.value = false
  }
}

async function handleRegister() {
  if (!email.value || !password.value || !passwordConfirm.value) {
    errorMsg.value = 'Preencha todos os campos.'
    return
  }
  if (password.value !== passwordConfirm.value) {
    errorMsg.value = 'As senhas não coincidem.'
    return
  }
  if (password.value.length < 6) {
    errorMsg.value = 'A senha deve ter pelo menos 6 caracteres.'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    await signUp(email.value, password.value)
    successMsg.value = 'Conta criada! Verifique seu email para confirmar o cadastro.'
    password.value = ''
    passwordConfirm.value = ''
  }
  catch (e: any) {
    errorMsg.value = translateError(e.message)
  }
  finally {
    loading.value = false
  }
}

async function handleForgot() {
  if (!email.value) {
    errorMsg.value = 'Informe seu email.'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    await resetPassword(email.value)
    successMsg.value = 'Email de recuperação enviado! Verifique sua caixa de entrada.'
  }
  catch (e: any) {
    errorMsg.value = translateError(e.message)
  }
  finally {
    loading.value = false
  }
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Email ou senha incorretos.'
  if (msg.includes('Email not confirmed')) return 'Confirme seu email antes de entrar.'
  if (msg.includes('User already registered')) return 'Este email já está cadastrado.'
  if (msg.includes('Password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.'
  if (msg.includes('rate limit')) return 'Muitas tentativas. Aguarde alguns minutos.'
  return 'Ocorreu um erro. Tente novamente.'
}
</script>

<template>
  <UModal :open="open" @update:open="$emit('update:open', $event)" :ui="{ content: 'max-w-md' }">
    <template #content>
      <div class="p-6 space-y-5">

        <!-- Header -->
        <div class="text-center space-y-1">
          <p class="text-2xl font-bold text-primary">ZSCOREPRO</p>
          <p class="text-sm text-muted">
            <template v-if="tab === 'login'">Entre na sua conta</template>
            <template v-else-if="tab === 'register'">Crie sua conta</template>
            <template v-else>Recuperar senha</template>
          </p>
        </div>

        <!-- Tab switcher (login / register) -->
        <div v-if="tab !== 'forgot'" class="flex bg-elevated rounded-lg p-1 gap-1">
          <button
            class="flex-1 py-1.5 rounded-md text-sm font-medium transition-all"
            :class="tab === 'login' ? 'bg-primary text-inverted shadow' : 'text-muted hover:text-default'"
            @click="tab = 'login'"
          >
            Entrar
          </button>
          <button
            class="flex-1 py-1.5 rounded-md text-sm font-medium transition-all"
            :class="tab === 'register' ? 'bg-primary text-inverted shadow' : 'text-muted hover:text-default'"
            @click="tab = 'register'"
          >
            Cadastrar
          </button>
        </div>

        <!-- Success message -->
        <UAlert
          v-if="successMsg"
          color="success"
          variant="subtle"
          icon="i-lucide-circle-check"
          :description="successMsg"
        />

        <!-- Error message -->
        <UAlert
          v-if="errorMsg"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-x"
          :description="errorMsg"
        />

        <!-- LOGIN FORM -->
        <form v-if="tab === 'login' && !successMsg" class="space-y-4" @submit.prevent="handleLogin">
          <UFormField label="Email">
            <UInput
              v-model="email"
              type="email"
              placeholder="seu@email.com"
              autocomplete="email"
              class="w-full"
              :disabled="loading"
            />
          </UFormField>

          <UFormField label="Senha">
            <UInput
              v-model="password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              class="w-full"
              :disabled="loading"
            />
          </UFormField>

          <div class="flex justify-end">
            <button
              type="button"
              class="text-xs text-muted hover:text-primary transition-colors"
              @click="tab = 'forgot'"
            >
              Esqueci minha senha
            </button>
          </div>

          <UButton
            type="submit"
            class="w-full justify-center"
            :loading="loading"
          >
            Entrar
          </UButton>
        </form>

        <!-- REGISTER FORM -->
        <form v-if="tab === 'register' && !successMsg" class="space-y-4" @submit.prevent="handleRegister">
          <UFormField label="Email">
            <UInput
              v-model="email"
              type="email"
              placeholder="seu@email.com"
              autocomplete="email"
              class="w-full"
              :disabled="loading"
            />
          </UFormField>

          <UFormField label="Senha">
            <UInput
              v-model="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              autocomplete="new-password"
              class="w-full"
              :disabled="loading"
            />
          </UFormField>

          <UFormField label="Confirmar senha">
            <UInput
              v-model="passwordConfirm"
              type="password"
              placeholder="Repita a senha"
              autocomplete="new-password"
              class="w-full"
              :disabled="loading"
            />
          </UFormField>

          <UButton
            type="submit"
            class="w-full justify-center"
            :loading="loading"
          >
            Criar conta
          </UButton>
        </form>

        <!-- FORGOT PASSWORD FORM -->
        <form v-if="tab === 'forgot' && !successMsg" class="space-y-4" @submit.prevent="handleForgot">
          <p class="text-sm text-muted">
            Informe seu email e enviaremos um link para redefinir sua senha.
          </p>

          <UFormField label="Email">
            <UInput
              v-model="email"
              type="email"
              placeholder="seu@email.com"
              autocomplete="email"
              class="w-full"
              :disabled="loading"
            />
          </UFormField>

          <UButton
            type="submit"
            class="w-full justify-center"
            :loading="loading"
          >
            Enviar link de recuperação
          </UButton>

          <div class="text-center">
            <button
              type="button"
              class="text-xs text-muted hover:text-primary transition-colors"
              @click="tab = 'login'"
            >
              ← Voltar ao login
            </button>
          </div>
        </form>

        <!-- After success: close button -->
        <UButton
          v-if="successMsg"
          variant="outline"
          class="w-full justify-center"
          @click="close"
        >
          Fechar
        </UButton>

      </div>
    </template>
  </UModal>
</template>
