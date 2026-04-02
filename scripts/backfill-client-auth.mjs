import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadDotEnv(filePath) {
  const raw = readFileSync(filePath, "utf8");
  return raw.split(/\r?\n/).reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return acc;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return acc;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    acc[key] = value;
    return acc;
  }, {});
}

const envPath = resolve(process.cwd(), ".env");
const env = {
  ...loadDotEnv(envPath),
  ...process.env,
};

const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL || "https://mvxlbvfryzmocrafhfjp.supabase.co";
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY não encontrado no ambiente local.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function listAllAuthUsers() {
  const users = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;

    const batch = data?.users || [];
    users.push(...batch);
    if (batch.length < 200) break;
    page += 1;
  }

  return users;
}

async function main() {
  const { data: clients, error: clientsError } = await supabase
    .from("clientes")
    .select("id, nome, email, senha, auth_user_id")
    .not("senha", "is", null);

  if (clientsError) throw clientsError;

  const authUsers = await listAllAuthUsers();
  const usersByEmail = new Map(
    authUsers
      .filter((user) => user.email)
      .map((user) => [user.email.trim().toLowerCase(), user])
  );

  const results = {
    linkedExisting: 0,
    createdNew: 0,
    clearedPasswords: 0,
    skipped: 0,
  };

  for (const client of clients || []) {
    const normalizedEmail = client.email?.trim().toLowerCase();
    const currentPassword = String(client.senha || "");

    if (!normalizedEmail) {
      results.skipped += 1;
      continue;
    }

    let authUserId = client.auth_user_id || null;
    const existingUser = usersByEmail.get(normalizedEmail);

    if (existingUser?.id) {
      authUserId = existingUser.id;
      results.linkedExisting += client.auth_user_id ? 0 : 1;
    } else if (!authUserId && currentPassword.length >= 6) {
      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password: currentPassword,
        email_confirm: true,
        user_metadata: {
          nome: client.nome,
          tipo: "cliente",
          provisioned_by: "backfill-client-auth",
        },
      });

      if (createError) {
        console.error(`Falha ao criar auth user para ${normalizedEmail}: ${createError.message}`);
        results.skipped += 1;
        continue;
      }

      authUserId = created.user?.id || null;
      if (authUserId) {
        usersByEmail.set(normalizedEmail, created.user);
        results.createdNew += 1;
      }
    }

    if (!authUserId) {
      results.skipped += 1;
      continue;
    }

    const updatePayload = {
      auth_user_id: authUserId,
      senha: null,
    };

    const { error: updateError } = await supabase
      .from("clientes")
      .update(updatePayload)
      .eq("id", client.id);

    if (updateError) {
      console.error(`Falha ao atualizar cliente ${client.id}: ${updateError.message}`);
      results.skipped += 1;
      continue;
    }

    results.clearedPasswords += 1;
  }

  console.log("Backfill concluído:", results);
}

main().catch((error) => {
  console.error("Erro no backfill de auth dos clientes:", error);
  process.exitCode = 1;
});
