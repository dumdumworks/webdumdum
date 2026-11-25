// ─────────────────────────────────────────────────────────────
// La carta EN VIVO. La edita el panel, que la guarda en Cloudflare KV (binding
// MENU); aquí se lee con caché CORTA para que los cambios salgan en segundos,
// sin esperar a ningún build de Pages.
// RED DE SEGURIDAD: si KV no está configurado o está vacío, se cae a la copia
// del build (/menu.base.json, que build.mjs escribe desde menu.json). Así la
// web NUNCA se queda sin carta.
// ─────────────────────────────────────────────────────────────
import { paginaCarta } from "../_generado/carta.js";

export const CACHE = "public, max-age=15, stale-while-revalidate=60";

export async function leerCarta(env, request) {
  try {
    if (env.MENU) {
      const v = await env.MENU.get("current");
      if (v) return v;
    }
  } catch (e) {
    // cae al respaldo estático
  }
  // Ruta distinta de /menu.json para que la función de ese nombre no se re-entre.
  const res = await env.ASSETS.fetch(new URL("/menu.base.json", request.url));
  return res.text();
}

// GET /menu y /en/menu: la página entera, pintada con la carta viva.
export const servirCarta = (lang) => async ({ env, request }) => {
  // La barra final se normaliza como en el resto de rutas (_redirects no
  // alcanza a las funciones): /menu/ → /menu.
  const url = new URL(request.url);
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    return Response.redirect(url.origin + url.pathname.slice(0, -1) + url.search, 301);
  }
  const carta = JSON.parse(await leerCarta(env, request));
  // Qué platos salen depende del día de la semana en Madrid (disponibilidad por días). ?dia=1..7 (1 = lunes)
  // fuerza otro día, para revisar la carta de ese día; cualquier otro valor se ignora y manda el de hoy.
  const forzado = Number(url.searchParams.get("dia"));
  const dia = Number.isInteger(forzado) && forzado >= 1 && forzado <= 7 ? forzado : undefined;
  return new Response(paginaCarta(lang, carta, dia), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": CACHE },
  });
};
