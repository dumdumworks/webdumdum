// ─────────────────────────────────────────────────────────────
// /api/banners — leer y guardar los avisos «Por cierto!» (pestaña de avisos del panel).
// Protegido por Cloudflare Access, como /api/menu (ver _lib/access.js).
//
//   GET  /api/banners  → el conjunto completo, con los inactivos y los campos internos.
//   POST /api/banners  → lo valida (_lib/avisos.js) y lo guarda en KV (binding MENU).
// ─────────────────────────────────────────────────────────────
import { requireAccess } from "../_lib/access.js";
import { CLAVE, leerAvisos, sanear } from "../_lib/avisos.js";

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function onRequestGet({ env, request }) {
  const denegado = await requireAccess(request, env);
  if (denegado) return denegado;
  return json(await leerAvisos(env));
}

export async function onRequestPost({ env, request }) {
  const denegado = await requireAccess(request, env);
  if (denegado) return denegado;
  if (!env.MENU) return json({ error: "La base de datos (KV binding MENU) no está configurada todavía." }, 500);

  let entrada;
  try {
    entrada = await request.json();
  } catch (e) {
    return json({ error: "El cuerpo no es JSON válido." }, 400);
  }
  const { data, error } = sanear(entrada);
  if (error) return json({ error }, 400);

  await env.MENU.put(CLAVE, JSON.stringify(data));
  return json({ ok: true, savedAt: new Date().toISOString(), avisos: data.avisos.length });
}
