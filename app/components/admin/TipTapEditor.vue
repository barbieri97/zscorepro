<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'

const props = withDefaults(defineProps<{
  modelValue: string
  editable?: boolean
  placeholder?: string
}>(), {
  editable: true,
  placeholder: 'Comece a escrever o seu artigo...',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  wordCount: [count: number]
}>()

const { uploadImage } = useImageUpload()
const toast = useToast()

const showLinkModal = ref(false)
const linkUrl = ref('')
const imageFileInput = ref<HTMLInputElement | null>(null)

const editor = useEditor({
  content: props.modelValue || '',
  editable: props.editable,
  extensions: [
    StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
    Image.configure({ inline: false }),
    Link.configure({ openOnClick: false }),
    Placeholder.configure({ placeholder: props.placeholder }),
    CharacterCount,
  ],
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
    emit('wordCount', editor.storage.characterCount?.words?.() ?? 0)
  },
})

watch(() => props.modelValue, (val) => {
  if (editor.value && val !== editor.value.getHTML()) {
    editor.value.commands.setContent(val || '', false)
  }
})

watch(() => props.editable, (val) => editor.value?.setEditable(val))

onBeforeUnmount(() => editor.value?.destroy())

const openLinkModal = () => {
  linkUrl.value = editor.value?.getAttributes('link').href || ''
  showLinkModal.value = true
}

const applyLink = () => {
  if (!editor.value) return
  if (!linkUrl.value) {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
  } else {
    editor.value.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.value }).run()
  }
  showLinkModal.value = false
  linkUrl.value = ''
}

const onImageFile = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const { url, error } = await uploadImage(file, 'post-images')
  ;(e.target as HTMLInputElement).value = ''
  if (error) {
    toast.add({ title: 'Erro ao enviar imagem', color: 'error' })
    return
  }
  if (url) editor.value?.chain().focus().setImage({ src: url }).run()
}
</script>

<template>
  <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
    <!-- Toolbar -->
    <div
      v-if="editable && editor"
      class="flex flex-wrap gap-0.5 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
    >
      <UButton size="xs" :variant="editor.isActive('bold') ? 'solid' : 'ghost'" title="Negrito" @click="editor.chain().focus().toggleBold().run()">
        <UIcon name="i-tabler-bold" />
      </UButton>
      <UButton size="xs" :variant="editor.isActive('italic') ? 'solid' : 'ghost'" title="Itálico" @click="editor.chain().focus().toggleItalic().run()">
        <UIcon name="i-tabler-italic" />
      </UButton>
      <UButton size="xs" :variant="editor.isActive('strike') ? 'solid' : 'ghost'" title="Tachado" @click="editor.chain().focus().toggleStrike().run()">
        <UIcon name="i-tabler-strikethrough" />
      </UButton>

      <div class="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />

      <UButton size="xs" :variant="editor.isActive('heading', { level: 1 }) ? 'solid' : 'ghost'" title="Título 1" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()">
        <UIcon name="i-tabler-h-1" />
      </UButton>
      <UButton size="xs" :variant="editor.isActive('heading', { level: 2 }) ? 'solid' : 'ghost'" title="Título 2" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">
        <UIcon name="i-tabler-h-2" />
      </UButton>
      <UButton size="xs" :variant="editor.isActive('heading', { level: 3 }) ? 'solid' : 'ghost'" title="Título 3" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">
        <UIcon name="i-tabler-h-3" />
      </UButton>

      <div class="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />

      <UButton size="xs" :variant="editor.isActive('bulletList') ? 'solid' : 'ghost'" title="Lista" @click="editor.chain().focus().toggleBulletList().run()">
        <UIcon name="i-tabler-list" />
      </UButton>
      <UButton size="xs" :variant="editor.isActive('orderedList') ? 'solid' : 'ghost'" title="Lista numerada" @click="editor.chain().focus().toggleOrderedList().run()">
        <UIcon name="i-tabler-list-numbers" />
      </UButton>
      <UButton size="xs" :variant="editor.isActive('blockquote') ? 'solid' : 'ghost'" title="Citação" @click="editor.chain().focus().toggleBlockquote().run()">
        <UIcon name="i-tabler-blockquote" />
      </UButton>
      <UButton size="xs" :variant="editor.isActive('codeBlock') ? 'solid' : 'ghost'" title="Bloco de código" @click="editor.chain().focus().toggleCodeBlock().run()">
        <UIcon name="i-tabler-code" />
      </UButton>
      <UButton size="xs" variant="ghost" title="Separador" @click="editor.chain().focus().setHorizontalRule().run()">
        <UIcon name="i-tabler-minus" />
      </UButton>

      <div class="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />

      <UButton size="xs" :variant="editor.isActive('link') ? 'solid' : 'ghost'" title="Link" @click="openLinkModal">
        <UIcon name="i-tabler-link" />
      </UButton>
      <UButton size="xs" variant="ghost" title="Inserir imagem" @click="imageFileInput?.click()">
        <UIcon name="i-tabler-photo" />
      </UButton>

      <div class="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />

      <UButton size="xs" variant="ghost" title="Desfazer" :disabled="!editor.can().undo()" @click="editor.chain().focus().undo().run()">
        <UIcon name="i-tabler-arrow-back-up" />
      </UButton>
      <UButton size="xs" variant="ghost" title="Refazer" :disabled="!editor.can().redo()" @click="editor.chain().focus().redo().run()">
        <UIcon name="i-tabler-arrow-forward-up" />
      </UButton>
    </div>

    <!-- Editor area -->
    <div class="p-4 min-h-96">
      <EditorContent :editor="editor" class="tiptap-content" />
    </div>
  </div>

  <!-- Hidden image input -->
  <input ref="imageFileInput" type="file" accept="image/*" class="hidden" @change="onImageFile" />

  <!-- Link modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="showLinkModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        @click.self="showLinkModal = false"
      >
        <UCard class="w-full max-w-sm">
          <template #header>
            <span class="font-semibold">Inserir Link</span>
          </template>
          <UInput v-model="linkUrl" placeholder="https://..." type="url" class="w-full" autofocus @keydown.enter="applyLink" @keydown.esc="showLinkModal = false" />
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton variant="ghost" @click="showLinkModal = false">Cancelar</UButton>
              <UButton @click="applyLink">Aplicar</UButton>
            </div>
          </template>
        </UCard>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.tiptap-content .ProseMirror { outline: none; min-height: 350px; }
.tiptap-content .ProseMirror > * + * { margin-top: 0.75em; }
.tiptap-content .ProseMirror p { line-height: 1.75; }
.tiptap-content .ProseMirror h1 { font-size: 1.875rem; font-weight: 700; }
.tiptap-content .ProseMirror h2 { font-size: 1.5rem; font-weight: 600; color: var(--ui-primary); }
.tiptap-content .ProseMirror h3 { font-size: 1.25rem; font-weight: 600; }
.tiptap-content .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; }
.tiptap-content .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; }
.tiptap-content .ProseMirror blockquote { border-left: 3px solid var(--ui-primary); padding-left: 1rem; opacity: 0.85; font-style: italic; }
.tiptap-content .ProseMirror code { background: rgba(128,128,128,0.15); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875em; }
.tiptap-content .ProseMirror pre { background: rgba(128,128,128,0.12); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
.tiptap-content .ProseMirror pre code { background: none; padding: 0; }
.tiptap-content .ProseMirror hr { border: none; border-top: 2px solid rgba(128,128,128,0.3); margin: 1.5rem 0; }
.tiptap-content .ProseMirror img { max-width: 100%; height: auto; border-radius: 0.5rem; }
.tiptap-content .ProseMirror a { color: var(--ui-primary); text-decoration: underline; }
.tiptap-content .ProseMirror p.is-editor-empty:first-child::before {
  color: rgba(128,128,128,0.5); content: attr(data-placeholder); float: left; height: 0; pointer-events: none;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
