import { computed } from 'vue'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  // useSupabaseUser() é reativo e gerenciado automaticamente pelo @nuxtjs/supabase
  const user = useSupabaseUser()

  const isLoggedIn = computed(() => !!user.value)

  const userDisplayName = computed(() => {
    if (!user.value) return ''
    const name = (
      user.value.user_metadata?.display_name ||
      user.value.user_metadata?.name ||
      user.value.user_metadata?.full_name ||
      user.value.email?.split('@')[0] ||
      'Usuário'
    )
    return name.trim().split(/\s+/)[0]
  })

  const userFullName = computed(() => {
    if (!user.value) return ''
    return (
      user.value.user_metadata?.display_name ||
      user.value.user_metadata?.name ||
      user.value.user_metadata?.full_name ||
      user.value.email ||
      'Usuário'
    )
  })

  const userAvatarUrl = computed(() => {
    if (!user.value) return null
    return (
      user.value.user_metadata?.avatar_url ||
      user.value.user_metadata?.picture ||
      null
    )
  })

  // init() mantido por compatibilidade com quem já o chama,
  // mas o estado é gerenciado pelo @nuxtjs/supabase automaticamente
  async function init() {}

  async function signIn(email: string, password: string) {
    const supabase = useSupabaseClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email: string, password: string, displayName?: string) {
    const supabase = useSupabaseClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm`,
        data: {
          display_name: displayName,
          full_name: displayName,
        },
      },
    })
    if (error) throw error
  }

  async function signOut() {
    const supabase = useSupabaseClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async function resetPassword(email: string) {
    const supabase = useSupabaseClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/confirm`,
    })
    if (error) throw error
  }

  async function signInWithGoogle() {
    const supabase = useSupabaseClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/confirm`,
      },
    })
    if (error) throw error
  }

  return {
    user,
    isLoggedIn,
    userDisplayName,
    userFullName,
    userAvatarUrl,
    init,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithGoogle,
  }
}
