// ─────────────────────────────────────────────────────────────
// /api/menu — leer y guardar la carta (usado por el panel de /admin).
//
// PROTEGIDO POR CLOUDFLARE ACCESS: /api/* debe estar dentro de la misma
// aplicación de Access que protege el panel. Access inyecta la cabecera
// "Cf-Access-Jwt-Assertion" en las peticiones que han pasado el login; aquí
// exigimos su presencia como comprobación básica (defensa en profundidad).
//
//   GET  /api/menu  → devuelve la carta actual (KV, o el fallback del build).
//   POST /api/menu  → guarda la carta en KV (body = objeto menu.json completo).
// ─────────────────────────────────────────────────────────────
function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra },
  });
}
function requireAccess(request) {
  return !!request.headers.get("Cf-Access-Jwt-Assertion");
}

export async function onRequestGet({ env, request }) {
  if (!requireAccess(request)) return json({ error: "No autorizado" }, 401);
  try {
    if (env.MENU) {
      const v = await env.MENU.get("current");
      if (v) return new Response(v, { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
    }
  } catch (e) { /* fallback */ }
  const res = await env.ASSETS.fetch(new URL("/menu.base.json", request.url));
  return new Response(await res.text(), { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
}

export async function onRequestPost({ env, request }) {
  if (!requireAccess(request)) return json({ error: "No autorizado" }, 401);
  if (!env.MENU) return json({ error: "La base de datos (KV binding MENU) no está configurada todavía." }, 500);

  let data;
  try {
    data = await request.json();
  } catch (e) {
    return json({ error: "El cuerpo no es JSON válido." }, 400);
  }
  // Validación mínima: que sea una carta con secciones (evita machacar KV con basura).
  if (!data || typeof data !== "object" || !Array.isArray(data.sections)) {
    return json({ error: "Falta 'sections' (no parece una carta válida)." }, 400);
  }

  await env.MENU.put("current", JSON.stringify(data));
  return json({ ok: true, savedAt: new Date().toISOString(), platos: data.sections.reduce((n, s) => n + (s.items ? s.items.length : 0), 0) });
}
