import { ref, computed } from 'vue'
import type { User } from '@supabase/supabase-js'

const user = ref<User | null>(null)

export function useAuth() {
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

  // Only runs on the client — $supabase is a client-only plugin
  async function init() {
    if (!import.meta.client) return

    const { $supabase } = useNuxtApp()

    const { data } = await $supabase.auth.getSession()
    user.value = data.session?.user ?? null

    $supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })
  }

  async function signIn(email: string, password: string) {
    const { $supabase } = useNuxtApp()
    const { error } = await $supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email: string, password: string, displayName?: string) {
    const { $supabase } = useNuxtApp()
    const { error } = await $supabase.auth.signUp({
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
    const { $supabase } = useNuxtApp()
    const { error } = await $supabase.auth.signOut()
    if (error) throw error
  }

  async function resetPassword(email: string) {
    const { $supabase } = useNuxtApp()
    const { error } = await $supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/confirm`,
    })
    if (error) throw error
  }

  async function signInWithGoogle() {
    const { $supabase } = useNuxtApp()
    const { error } = await $supabase.auth.signInWithOAuth({
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
