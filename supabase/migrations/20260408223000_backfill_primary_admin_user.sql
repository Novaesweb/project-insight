do $$
begin
  update public.usuarios
  set
    nome = 'Lucas Rodrigo Ferreira dos Santos',
    cargo = coalesce(nullif(cargo, ''), 'Fundador e CEO'),
    acesso = 'admin',
    status = 'ativo',
    bloqueado = false,
    tentativas_login = 0,
    email = 'novaesweb@gmail.com'
  where lower(email) = 'novaesweb@gmail.com';

  if not found then
    insert into public.usuarios (
      nome,
      email,
      cargo,
      acesso,
      status,
      bloqueado,
      tentativas_login,
      avatar
    )
    values (
      'Lucas Rodrigo Ferreira dos Santos',
      'novaesweb@gmail.com',
      'Fundador e CEO',
      'admin',
      'ativo',
      false,
      0,
      'LR'
    );
  end if;
end
$$;
