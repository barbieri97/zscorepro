import { createClient } from '@supabase/supabase-js'
import type { Database, UserRole } from '~/app/types/database.types'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
  }

  const token = authHeader.slice(7)

  const adminClient = createClient<Database>(
    process.env.SUPABASE_URL as string,
    config.supabaseServiceKey as string,
  )

  const { data: { user }, error: authError } = await adminClient.auth.getUser(token)
  if (authError || !user) {
    throw createError({ statusCode: 401, statusMessage: 'Token inválido' })
  }

  const { data: callerProfile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (callerProfile?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Apenas administradores podem alterar roles' })
  }

  const { userId, role } = await readBody<{ userId: string; role: UserRole }>(event)

  if (!userId || !role || !['user', 'author', 'admin'].includes(role)) {
    throw createError({ statusCode: 400, statusMessage: 'Dados inválidos' })
  }

  const { error } = await adminClient
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
})
