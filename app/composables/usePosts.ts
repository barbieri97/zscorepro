import type { Database } from '~/types/database.types'

export type Post = Database['public']['Tables']['posts']['Row']

export type PostWithMeta = Post & {
  profiles?: {
    username: string | null
    avatar_url: string | null
    instagram: string | null
    linkedin: string | null
    twitter: string | null
    github: string | null
  } | null
  post_likes?: [{ count: number }]
  comments?: [{ count: number }]
}

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const calcReadingTime = (wordCount: number): number =>
  Math.max(1, Math.ceil(wordCount / 200))

export const usePosts = () => {
  const supabase = useSupabaseClient<Database>()

  const profileFields = 'username, avatar_url, instagram, linkedin, twitter, github'

  const getPublishedPosts = async () => {
    return supabase
      .from('posts')
      .select(`*, profiles(${profileFields}), post_likes(count), comments(count)`)
      .eq('published', true)
      .order('published_at', { ascending: false })
  }

  const getPostBySlug = async (slug: string) => {
    return supabase
      .from('posts')
      .select(`*, profiles(${profileFields}), post_likes(count), comments(count)`)
      .eq('slug', slug)
      .eq('published', true)
      .single()
  }

  const getAdminPosts = async () => {
    return supabase
      .from('posts')
      .select('*, post_likes(count), comments(count)')
      .order('created_at', { ascending: false })
  }

  const getAllPostsWithAuthors = async () => {
    return supabase
      .from('posts')
      .select(`*, profiles(${profileFields}), post_likes(count), comments(count)`)
      .order('created_at', { ascending: false })
  }

  const togglePostPublished = async (id: string, published: boolean) => {
    return supabase
      .from('posts')
      .update({ published, published_at: published ? new Date().toISOString() : null })
      .eq('id', id)
  }

  const getPostById = async (id: string) => {
    return supabase.from('posts').select('*').eq('id', id).single()
  }

  const createPost = async (post: Database['public']['Tables']['posts']['Insert']) => {
    return supabase.from('posts').insert(post).select().single()
  }

  const updatePost = async (id: string, updates: Database['public']['Tables']['posts']['Update']) => {
    return supabase.from('posts').update(updates).eq('id', id).select().single()
  }

  const deletePost = async (id: string) => {
    return supabase.from('posts').delete().eq('id', id)
  }

  return {
    getPublishedPosts,
    getPostBySlug,
    getAdminPosts,
    getAllPostsWithAuthors,
    getPostById,
    createPost,
    updatePost,
    togglePostPublished,
    deletePost,
  }
}
