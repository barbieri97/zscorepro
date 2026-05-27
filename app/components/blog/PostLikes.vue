<script setup lang="ts">
const props = defineProps<{ postId: string; initialCount?: number }>()

const user = useSupabaseUser()
const toast = useToast()
const { togglePostLike, hasUserLikedPost } = useLikes()

const liked = ref(false)
const count = ref(props.initialCount ?? 0)
const loading = ref(false)

onMounted(async () => {
  liked.value = await hasUserLikedPost(props.postId)
})

const toggle = async () => {
  if (!user.value) {
    toast.add({ title: 'Faça login para curtir', icon: 'i-heroicons-information-circle', color: 'info' })
    return
  }
  loading.value = true
  const { error } = await togglePostLike(props.postId, liked.value) as { error: Error | null }
  if (error) {
    toast.add({ title: 'Erro ao curtir', description: error.message, color: 'error' })
  } else {
    liked.value = !liked.value
    count.value += liked.value ? 1 : -1
  }
  loading.value = false
}
</script>

<template>
  <button
    :disabled="loading"
    class="group flex flex-col items-center gap-1 transition-all disabled:opacity-50"
    :aria-label="liked ? 'Descurtir' : 'Curtir'"
    @click="toggle"
  >
    <span
      class="text-4xl transition-transform group-hover:scale-110 group-active:scale-95"
      :class="liked ? 'text-primary' : 'text-gray-400 dark:text-gray-600'"
    >
      <UIcon :name="liked ? 'i-ph-brain-fill' : 'i-ph-brain'" class="size-10" />
    </span>
    <span class="text-sm font-semibold tabular-nums" :class="liked ? 'text-primary' : 'text-muted'">
      {{ count }}
    </span>
  </button>
</template>
