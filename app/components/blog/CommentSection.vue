<script setup lang="ts">
const props = defineProps<{ postId: string }>()

const user = useSupabaseUser()
const toast = useToast()
const { getPostComments, createComment, buildTree } = useComments()

const comments = ref<CommentWithMeta[]>([])
const newComment = ref('')
const loading = ref(true)
const submitting = ref(false)

const loadComments = async () => {
  loading.value = true
  const { data, error } = await getPostComments(props.postId)
  if (!error && data) {
    comments.value = buildTree(data as CommentWithMeta[])
  }
  loading.value = false
}

onMounted(loadComments)

const submit = async () => {
  if (!newComment.value.trim() || !user.value) return
  submitting.value = true
  const { error } = await createComment({
    post_id: props.postId,
    user_id: user.value.id,
    content: newComment.value,
  })
  if (error) {
    toast.add({ title: 'Erro ao comentar', description: error.message, color: 'error' })
  } else {
    newComment.value = ''
    toast.add({ title: 'Comentário enviado!', color: 'success' })
    await loadComments()
  }
  submitting.value = false
}

const onDeleted = async () => loadComments()
const onReply = async () => loadComments()
</script>

<template>
  <section class="space-y-6">
    <h3 class="text-xl font-bold flex items-center gap-2">
      <UIcon name="i-heroicons-chat-bubble-left-right" class="text-primary" />
      Comentários
    </h3>

    <!-- New comment form -->
    <div v-if="user" class="space-y-3">
      <UTextarea
        v-model="newComment"
        placeholder="Deixe um comentário..."
        :rows="3"
        class="w-full"
      />
      <div class="flex justify-end">
        <UButton
          :loading="submitting"
          :disabled="!newComment.trim()"
          icon="i-heroicons-paper-airplane"
          @click="submit"
        >
          Comentar
        </UButton>
      </div>
    </div>

    <div v-else class="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center space-y-3">
      <p class="text-muted text-sm">Faça login para comentar</p>
      <UButton to="/auth/login" variant="outline" size="sm">Entrar</UButton>
    </div>

    <!-- Comments list -->
    <div v-if="loading" class="space-y-4">
      <USkeleton v-for="i in 3" :key="i" class="h-20 w-full rounded-xl" />
    </div>

    <div v-else-if="!comments.length" class="text-center text-muted py-8 text-sm">
      Seja o primeiro a comentar!
    </div>

    <div v-else class="divide-y divide-gray-100 dark:divide-gray-800">
      <BlogCommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :post-id="postId"
        :depth="0"
        @deleted="onDeleted"
        @reply="onReply"
      />
    </div>
  </section>
</template>
