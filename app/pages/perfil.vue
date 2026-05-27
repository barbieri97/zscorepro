<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Meu Perfil · ZSCOREPRO' })

const user = useSupabaseUser()
const { profile, updateProfile } = useProfile()
const { uploadImage, uploading } = useImageUpload()
const toast = useToast()

const form = reactive({
  username: '',
  bio: '',
  avatar_url: '',
})

const saving = ref(false)
const fileInput = ref<HTMLInputElement>()

watch(profile, (p) => {
  if (p) {
    form.username = p.username ?? ''
    form.bio = p.bio ?? ''
    form.avatar_url = p.avatar_url ?? ''
  }
}, { immediate: true })

const onFileChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const { url, error } = await uploadImage(file, 'avatars')
  if (error || !url) {
    toast.add({ title: 'Erro ao enviar imagem', color: 'error' })
    return
  }
  form.avatar_url = url
}

const save = async () => {
  saving.value = true
  const { error } = await updateProfile({
    username: form.username.trim() || null,
    bio: form.bio.trim() || null,
    avatar_url: form.avatar_url || null,
  })
  saving.value = false

  if (error) {
    toast.add({ title: 'Erro ao salvar', description: (error as Error).message, color: 'error' })
  } else {
    toast.add({ title: 'Perfil atualizado!', color: 'success' })
  }
}
</script>

<template>
  <UContainer class="py-16 max-w-xl">
    <div class="space-y-8">
      <div>
        <h1 class="text-2xl font-bold">Meu Perfil</h1>
        <p class="text-muted text-sm mt-1">{{ user?.email }}</p>
      </div>

      <UCard variant="soft" class="space-y-6">
        <!-- Avatar -->
        <div class="flex flex-col items-center gap-4">
          <div class="relative group cursor-pointer" @click="fileInput?.click()">
            <UAvatar
              :src="form.avatar_url || undefined"
              :alt="form.username || 'Usuário'"
              size="3xl"
            />
            <div class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <UIcon
                :name="uploading ? 'i-heroicons-arrow-path' : 'i-heroicons-camera'"
                class="text-white text-xl"
                :class="{ 'animate-spin': uploading }"
              />
            </div>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            @change="onFileChange"
          />
          <p class="text-xs text-muted">Clique na foto para alterar · JPG, PNG ou WebP · máx. 2MB</p>
        </div>

        <USeparator />

        <!-- Campos -->
        <div class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Nome de usuário</label>
            <UInput v-model="form.username" placeholder="seu_usuario" class="w-full" />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium">Bio</label>
            <UTextarea
              v-model="form.bio"
              placeholder="Conte um pouco sobre você..."
              :rows="4"
              class="w-full"
            />
          </div>
        </div>

        <UButton block :loading="saving || uploading" @click="save">
          Salvar alterações
        </UButton>
      </UCard>
    </div>
  </UContainer>
</template>
