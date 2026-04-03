// deno-lint-ignore-file
Deno.serve(async (req: Request) => {
  return new Response(JSON.stringify({
    error: "Função desativada por segurança. Use o fluxo autenticado create-account para provisionar contas."
  }), {
    status: 410,
    headers: { "Content-Type": "application/json" },
  });
});
