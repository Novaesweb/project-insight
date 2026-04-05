alter table public.clientes
  add column if not exists nome_empresa text,
  add column if not exists whatsapp text,
  add column if not exists instagram text,
  add column if not exists cep text,
  add column if not exists bairro text,
  add column if not exists numero_endereco text,
  add column if not exists complemento text;

update public.clientes
set whatsapp = telefone
where whatsapp is null
  and telefone is not null;
