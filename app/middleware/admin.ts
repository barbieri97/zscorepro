export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()

  if (!user.value) {
    return navigateTo('/auth/login')
  }

  const supabase = useSupabaseClient<Database>()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.value.id)
    .single()

  if (!profile || !['author', 'admin'].includes(profile.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado. Apenas autores e administradores podem acessar esta área.' })
  }
})
