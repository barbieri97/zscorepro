export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()

  if (!user.value) {
    return navigateTo('/auth/login')
  }

  const supabase = useSupabaseClient<Database>()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.value.sub as string)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado. Apenas administradores podem acessar esta área.' })
  }
})
