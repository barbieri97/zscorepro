<script setup lang="ts">
import type { StorageBucket } from '~/composables/useImageUpload'

const props = withDefaults(defineProps<{
  modelValue: string | null
  bucket?: StorageBucket
  label?: string
}>(), {
  bucket: 'post-covers',
  label: 'Imagem de Capa',
})

const emit = defineEmits<{ 'update:modelValue': [url: string | null] }>()

const { uploadImage, uploading } = useImageUpload()
const toast = useToast()
const fileInput = ref<HTMLInputElement | null>(null)
const dragging = ref(false)

const handleFile = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    toast.add({ title: 'Arquivo inválido', description: 'Selecione uma imagem.', color: 'error' })
    return
  }
  const { url, error } = await uploadImage(file, props.bucket)
  if (error) {
    toast.add({ title: 'Erro no upload', description: (error as Error).message, color: 'error' })
  } else {
    emit('update:modelValue', url)
  }
}

const onFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) handleFile(file)
}

const onDrop = (e: DragEvent) => {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) handleFile(file)
}

const remove = () => emit('update:modelValue', null)
</script>

<template>
  <div class="space-y-2">
    <label class="text-sm font-medium">{{ label }}</label>

    <div
      v-if="!modelValue"
      class="border-2 border-dashed rounded-xl transition-colors cursor-pointer"
      :class="dragging ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-700 hover:border-primary'"
      @click="fileInput?.click()"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
    >
      <div class="flex flex-col items-center justify-center py-10 gap-3 pointer-events-none">
        <UIcon name="i-heroicons-photo" class="text-4xl text-muted" />
        <div class="text-center">
          <p class="text-sm font-medium">Clique ou arraste uma imagem</p>
          <p class="text-xs text-muted mt-1">JPG, PNG, WebP ou GIF · máx. 5 MB</p>
        </div>
        <UButton v-if="uploading" loading variant="ghost" size="sm">Enviando...</UButton>
      </div>
    </div>

    <div v-else class="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <img :src="modelValue" alt="Capa do post" class="w-full h-52 object-cover" />
      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
        <UButton size="sm" variant="solid" color="neutral" @click="fileInput?.click()">Trocar</UButton>
        <UButton size="sm" variant="solid" color="error" icon="i-heroicons-trash" @click="remove">Remover</UButton>
      </div>
    </div>

    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
  </div>
</template>
