import type { Database } from '~/types/database.types'

export type StorageBucket = 'post-covers' | 'post-images' | 'avatars'

export const useImageUpload = () => {
  const supabase = useSupabaseClient<Database>()
  const uploading = ref(false)

  const uploadImage = async (file: File, bucket: StorageBucket = 'post-images') => {
    uploading.value = true
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

    uploading.value = false

    if (error) return { url: null, error }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return { url: data.publicUrl, error: null }
  }

  const deleteImage = async (url: string, bucket: StorageBucket) => {
    const path = url.split(`/${bucket}/`)[1]
    if (!path) return
    await supabase.storage.from(bucket).remove([path])
  }

  return { uploadImage, deleteImage, uploading }
}
