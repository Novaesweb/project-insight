do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'projeto_arquivos'
  ) then
    execute 'alter table public.projeto_arquivos enable row level security';
    execute 'grant select, insert, update, delete on public.projeto_arquivos to authenticated';

    execute 'drop policy if exists "Internal manage projeto_arquivos" on public.projeto_arquivos';
    execute 'drop policy if exists "Clientes view own projeto_arquivos" on public.projeto_arquivos';
    execute 'drop policy if exists "Clientes insert own projeto_arquivos" on public.projeto_arquivos';

    execute $policy$
      create policy "Internal manage projeto_arquivos"
      on public.projeto_arquivos
      for all
      to authenticated
      using (public.is_admin())
      with check (public.is_admin())
    $policy$;

    execute $policy$
      create policy "Clientes view own projeto_arquivos"
      on public.projeto_arquivos
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.projetos
          where projetos.id = projeto_arquivos.projeto_id
            and projetos.cliente_id = public.get_cliente_id()
        )
      )
    $policy$;

    execute $policy$
      create policy "Clientes insert own projeto_arquivos"
      on public.projeto_arquivos
      for insert
      to authenticated
      with check (
        enviado_por = 'cliente'
        and exists (
          select 1
          from public.projetos
          where projetos.id = projeto_arquivos.projeto_id
            and projetos.cliente_id = public.get_cliente_id()
        )
      )
    $policy$;
  end if;
end;
$$;
