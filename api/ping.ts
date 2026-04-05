import { createClient } from "@supabase/supabase-js";

function json(res: any, status: number, body: Record<string, unknown>) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(body);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return json(res, 405, { ok: false });
  }

  const healthcheckSecret = process.env.HEALTHCHECK_SECRET;
  const providedSecret = String(req.headers["x-healthcheck-key"] || "").trim();

  if (!healthcheckSecret || providedSecret !== healthcheckSecret) {
    return json(res, 401, { ok: false });
  }

  try {
    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return json(res, 503, { ok: false });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { error } = await supabase
      .from("healthcheck")
      .select("id")
      .limit(1);

    if (error) {
      return json(res, 503, { ok: false });
    }

    return json(res, 200, { ok: true });
  } catch {
    return json(res, 500, { ok: false });
  }
}
