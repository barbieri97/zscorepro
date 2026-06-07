-- Permite que admins alterem o role de qualquer usuário via API.
-- Usuários comuns ainda não conseguem alterar o próprio role.
CREATE OR REPLACE FUNCTION public.protect_role_column()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- Sem JWT (seed, migrations, acesso direto ao banco): permite tudo
  IF current_setting('request.jwt.claims', true) IS NULL
     OR current_setting('request.jwt.claims', true) = '' THEN
    RETURN NEW;
  END IF;

  -- Role não foi alterado: sem restrição
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  -- Verifica se quem está fazendo a chamada é admin
  SELECT p.role INTO caller_role
  FROM public.profiles p
  WHERE p.id = auth.uid();

  IF caller_role = 'admin' THEN
    RETURN NEW;
  END IF;

  -- Caso contrário, reverte a mudança de role
  NEW.role := OLD.role;
  RETURN NEW;
END;
$$;
