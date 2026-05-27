import type { Database, UserRole } from '~/types/database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']

export const useProfile = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const profile = useState<Profile | null>('currentProfile', () => null)
  const loading = ref(false)

  const fetchProfile = async () => {
    if (!user.value) return
    if (profile.value?.id === user.value.id) return
    loading.value = true
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()
    profile.value = data as Profile | null
    loading.value = false
  }

  const updateProfile = async (updates: Partial<Omit<Profile, 'id' | 'role' | 'created_at'>>) => {
    if (!user.value) return { error: new Error('Não autenticado') }
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.value.id)
      .select()
      .single()
    if (data) profile.value = data as Profile
    return { data, error }
  }

  const isAuthorOrAdmin = computed<boolean>(() =>
    profile.value?.role === 'author' || profile.value?.role === 'admin'
  )

  const isAdmin = computed<boolean>(() => profile.value?.role === 'admin')

  watch(
    () => user.value?.id,
    async (id) => {
      if (!id) {
        profile.value = null
      } else {
        await fetchProfile()
      }
    },
    { immediate: true }
  )

  return { profile, loading, fetchProfile, updateProfile, isAuthorOrAdmin, isAdmin }
}
