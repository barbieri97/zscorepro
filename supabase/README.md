# Supabase Setup

## Desenvolvimento local

**Pré-requisito:** Docker Desktop rodando.

```bash
# 1. Iniciar o Supabase local
npm run db:start

# 2. Ver as URLs e chaves geradas
npm run db:status

# 3. Criar uma nova migration
npm run db:migration -- nome_da_migration

# 4. Resetar o banco (reaplica todas as migrations + seeds)
npm run db:reset

# 5. Gerar tipos TypeScript a partir do schema atual
npm run db:types

# 6. Parar o Supabase local
npm run db:stop
```

O Studio fica disponível em `http://localhost:54323`.

## Deploy na Vercel

Na dashboard da Vercel, adicione as variáveis de ambiente do projeto de produção:

| Variável | Onde encontrar |
|---|---|
| `SUPABASE_URL` | Settings → API → Project URL |
| `SUPABASE_KEY` | Settings → API → anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → service_role key |

Para aplicar as migrations no banco de produção:
```bash
# Fazer login no Supabase CLI
npx supabase login

# Linkar com o projeto remoto
npx supabase link --project-ref <project-id>

# Aplicar migrations na produção
npm run db:push
```

## Arquivos importantes

- `supabase/config.toml` — configuração local do Supabase
- `supabase/migrations/` — todas as migrations do banco
- `app/types/database.types.ts` — tipos TypeScript gerados (rodar `db:types` após cada migration)
- `.env` — variáveis locais (não commitado)
- `.env.example` — template das variáveis necessárias
