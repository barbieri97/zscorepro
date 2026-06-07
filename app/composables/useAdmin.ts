import type { Database, UserRole } from '~/types/database.types'

export type ProfileWithRole = Database['public']['Tables']['profiles']['Row']

export const useAdmin = () => {
  const supabase = useSupabaseClient<Database>()

  const getAllProfiles = async () => {
    return supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
  }

  const updateUserRole = async (userId: string, role: UserRole) => {
    return supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
  }

  return { getAllProfiles, updateUserRole }
}
