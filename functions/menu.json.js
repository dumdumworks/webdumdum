// ─────────────────────────────────────────────────────────────
// GET /menu.json — sirve la carta EN VIVO desde Cloudflare KV.
//
// La carta la edita el panel de /admin, que la guarda en KV (binding MENU).
// Aquí la servimos con caché CORTA para que los cambios salgan en segundos,
// SIN esperar a ningún build de Pages.
//
// RED DE SEGURIDAD: si KV todavía no está configurado (aún no has creado el
// binding) o está vacío, caemos a la copia estática del build (/menu.base.json,
// que build.mjs escribe a partir de tu menu.json). Así la web NUNCA se queda
// sin carta, ni siquiera antes de terminar el montaje.
// ─────────────────────────────────────────────────────────────
const HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  // Corto: el edge revalida rápido; los cambios del panel salen en ~segundos.
  "Cache-Control": "public, max-age=15, stale-while-revalidate=60",
};

export async function onRequestGet({ env, request }) {
  try {
    if (env.MENU) {
      const v = await env.MENU.get("current");
      if (v) return new Response(v, { headers: HEADERS });
    }
  } catch (e) {
    // cae al fallback estático
  }
  // Fallback: copia del menu.json del build (ruta distinta para no re-entrar aquí).
  const res = await env.ASSETS.fetch(new URL("/menu.base.json", request.url));
  const body = await res.text();
  return new Response(body, { headers: HEADERS });
}
