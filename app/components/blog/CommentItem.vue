<script setup lang="ts">
import type { CommentWithMeta } from '~/composables/useComments'

const props = defineProps<{
  comment: CommentWithMeta
  postId: string
  depth?: number
}>()

const emit = defineEmits<{
  deleted: [id: string]
  reply: [parentId: string]
}>()

const user = useSupabaseUser()
const toast = useToast()
const { updateComment, deleteComment } = useComments()
const { toggleCommentLike, hasUserLikedComment } = useLikes()

const editing = ref(false)
const editContent = ref(props.comment.content)
const liked = ref(false)
const likesCount = ref(props.comment.comment_likes?.[0]?.count ?? 0)
const showReply = ref(false)
const replyContent = ref('')
const savingReply = ref(false)

const isOwn = computed(() => user.value?.id === props.comment.user_id)
const depth = computed(() => props.depth ?? 0)

onMounted(async () => {
  liked.value = await hasUserLikedComment(props.comment.id)
})

const saveEdit = async () => {
  if (!editContent.value.trim()) return
  const { error } = await updateComment(props.comment.id, editContent.value)
  if (error) {
    toast.add({ title: 'Erro ao editar comentário', color: 'error' })
  } else {
    props.comment.content = editContent.value
    editing.value = false
    toast.add({ title: 'Comentário editado', color: 'success' })
  }
}

const remove = async () => {
  const { error } = await deleteComment(props.comment.id)
  if (error) {
    toast.add({ title: 'Erro ao excluir comentário', color: 'error' })
  } else {
    emit('deleted', props.comment.id)
  }
}

const toggleLike = async () => {
  if (!user.value) {
    toast.add({ title: 'Faça login para curtir', icon: 'i-heroicons-information-circle', color: 'info' })
    return
  }
  await toggleCommentLike(props.comment.id, liked.value)
  liked.value = !liked.value
  likesCount.value += liked.value ? 1 : -1
}

const supabase = useSupabaseClient()
const submitReply = async () => {
  if (!replyContent.value.trim() || !user.value) return
  savingReply.value = true
  const { createComment } = useComments()
  const { error } = await createComment({
    post_id: props.postId,
    user_id: user.value.id,
    parent_comment_id: props.comment.id,
    content: replyContent.value,
  })
  if (error) {
    toast.add({ title: 'Erro ao responder', color: 'error' })
  } else {
    replyContent.value = ''
    showReply.value = false
    toast.add({ title: 'Resposta enviada', color: 'success' })
    // Recarrega os comentários via emit para o pai
    emit('reply', props.comment.id)
  }
  savingReply.value = false
}

const formattedDate = computed(() =>
  new Date(props.comment.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
)
</script>

<template>
  <div :class="depth > 0 ? 'ml-6 pl-4 border-l-2 border-gray-200 dark:border-gray-700' : ''">
    <div class="flex gap-3 py-3">
      <UAvatar
        :src="comment.profiles?.avatar_url ?? undefined"
        :alt="comment.profiles?.username ?? 'Usuário'"
        size="sm"
        class="shrink-0 mt-0.5"
      />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap mb-1">
          <span class="font-semibold text-sm">{{ comment.profiles?.username ?? 'Usuário' }}</span>
          <span class="text-xs text-muted">{{ formattedDate }}</span>
        </div>

        <div v-if="!editing" class="text-sm whitespace-pre-wrap">{{ comment.content }}</div>

        <div v-else class="space-y-2 mt-1">
          <UTextarea v-model="editContent" :rows="2" class="w-full text-sm" />
          <div class="flex gap-2">
            <UButton size="xs" @click="saveEdit">Salvar</UButton>
            <UButton size="xs" variant="ghost" @click="editing = false">Cancelar</UButton>
          </div>
        </div>

        <div class="flex items-center gap-3 mt-2">
          <button class="flex items-center gap-1 text-xs transition-colors hover:text-primary" :class="liked ? 'text-primary' : 'text-muted'" @click="toggleLike">
            <UIcon :name="liked ? 'i-ph-heart-fill' : 'i-ph-heart'" class="text-sm" />
            {{ likesCount }}
          </button>

          <button v-if="user && depth < 2" class="text-xs text-muted hover:text-primary transition-colors" @click="showReply = !showReply">
            Responder
          </button>

          <template v-if="isOwn">
            <button class="text-xs text-muted hover:text-primary transition-colors" @click="editing = !editing">
              Editar
            </button>
            <button class="text-xs text-muted hover:text-error transition-colors" @click="remove">
              Excluir
            </button>
          </template>
        </div>

        <div v-if="showReply" class="mt-3 space-y-2">
          <UTextarea v-model="replyContent" placeholder="Escreva sua resposta..." :rows="2" class="w-full text-sm" />
          <div class="flex gap-2">
            <UButton size="xs" :loading="savingReply" @click="submitReply">Responder</UButton>
            <UButton size="xs" variant="ghost" @click="showReply = false">Cancelar</UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Replies -->
    <BlogCommentItem
      v-for="reply in comment.replies"
      :key="reply.id"
      :comment="reply"
      :post-id="postId"
      :depth="depth + 1"
      @deleted="$emit('deleted', $event)"
      @reply="$emit('reply', $event)"
    />
  </div>
</template>
