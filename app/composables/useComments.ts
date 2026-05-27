import type { Database } from '~/types/database.types'

export type Comment = Database['public']['Tables']['comments']['Row']

export type CommentWithMeta = Comment & {
  profiles?: { username: string | null; avatar_url: string | null } | null
  comment_likes?: [{ count: number }]
  replies?: CommentWithMeta[]
}

export const useComments = () => {
  const supabase = useSupabaseClient<Database>()

  const getPostComments = async (postId: string) => {
    return supabase
      .from('comments')
      .select('*, profiles(username, avatar_url), comment_likes(count)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
  }

  const createComment = async (comment: Database['public']['Tables']['comments']['Insert']) => {
    return supabase.from('comments').insert(comment).select('*, profiles(username, avatar_url)').single()
  }

  const updateComment = async (id: string, content: string) => {
    return supabase.from('comments').update({ content }).eq('id', id).select().single()
  }

  const deleteComment = async (id: string) => {
    return supabase.from('comments').delete().eq('id', id)
  }

  // Organiza lista plana em árvore (top-level + replies aninhados)
  const buildTree = (comments: CommentWithMeta[]): CommentWithMeta[] => {
    const map = new Map<string, CommentWithMeta>()
    const roots: CommentWithMeta[] = []

    comments.forEach((c) => map.set(c.id, { ...c, replies: [] }))

    map.forEach((c) => {
      if (c.parent_comment_id) {
        const parent = map.get(c.parent_comment_id)
        if (parent) parent.replies!.push(c)
      } else {
        roots.push(c)
      }
    })

    return roots
  }

  return { getPostComments, createComment, updateComment, deleteComment, buildTree }
}
