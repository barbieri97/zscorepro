import { ref, computed } from 'vue'
import type { User } from '@supabase/supabase-js'

const user = ref<User | null>(null)

export function useAuth() {
  const isLoggedIn = computed(() => !!user.value)

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

  async function signUp(email: string, password: string) {
    const { $supabase } = useNuxtApp()
    const { error } = await $supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm`,
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

  return {
    user,
    isLoggedIn,
    init,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }
}
