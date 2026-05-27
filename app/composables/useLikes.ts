import type { Database } from '~/types/database.types'

export const useLikes = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  // ---- Post Likes ----

  const getPostLikes = async (postId: string) => {
    const { count } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
    return count ?? 0
  }

  const hasUserLikedPost = async (postId: string): Promise<boolean> => {
    if (!user.value) return false
    const { data } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.value.sub as string)
      .maybeSingle()
    return !!data
  }

  const togglePostLike = async (postId: string, currentlyLiked: boolean) => {
    if (!user.value) return { error: new Error('Login necessário para curtir') }
    if (currentlyLiked) {
      return supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.value.sub as string)
    }
    return supabase.from('post_likes').insert({ post_id: postId, user_id: user.value.sub as string })
  }

  // ---- Comment Likes ----

  const getCommentLikes = async (commentId: string) => {
    const { count } = await supabase
      .from('comment_likes')
      .select('*', { count: 'exact', head: true })
      .eq('comment_id', commentId)
    return count ?? 0
  }

  const hasUserLikedComment = async (commentId: string): Promise<boolean> => {
    if (!user.value) return false
    const { data } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', user.value.sub as string)
      .maybeSingle()
    return !!data
  }

  const toggleCommentLike = async (commentId: string, currentlyLiked: boolean) => {
    if (!user.value) return { error: new Error('Login necessário para curtir') }
    if (currentlyLiked) {
      return supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', user.value.sub as string)
    }
    return supabase.from('comment_likes').insert({ comment_id: commentId, user_id: user.value.sub as string })
  }

  return {
    getPostLikes,
    hasUserLikedPost,
    togglePostLike,
    getCommentLikes,
    hasUserLikedComment,
    toggleCommentLike,
  }
}
