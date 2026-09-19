// Sitemap en el edge: las rutas y sus fechas las escribe build.mjs en
// _generado/sitemap.js (fecha del último commit del contenido de cada página).
// La carta es la excepción: su fecha es la del panel (KV `updated`), porque
// cambia sin pasar por git. Cada URL sale en los dos idiomas con sus
// alternativas hreflang, igual que el <head> de cada página.
import { ORIGIN, SITEMAP } from "./_generado/sitemap.js";

const RUTA_MENU = "/menu";
const urlEn = (ruta) => ORIGIN + "/en" + (ruta === "/" ? "/" : ruta);

async function fechaCarta(env) {
  try {
    const raw = await env.MENU?.get("current");
    const f = raw && JSON.parse(raw).updated;
    return /^\d{4}-\d{2}-\d{2}$/.test(f || "") ? f : null;
  } catch { return null; }
}

function entrada(loc, ruta, lastmod) {
  return `  <url>
    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
    <xhtml:link rel="alternate" hreflang="es" href="${ORIGIN + ruta}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${urlEn(ruta)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN + ruta}"/>
  </url>`;
}

// HEAD también (curl -I, monitores): sin esto caería al 404 estático.
export const onRequestHead = onRequestGet;

export async function onRequestGet({ env }) {
  const carta = await fechaCarta(env);
  const urls = SITEMAP.flatMap(({ ruta, lastmod }) => {
    const fecha = ruta === RUTA_MENU ? carta || lastmod : lastmod;
    return [entrada(ORIGIN + ruta, ruta, fecha), entrada(urlEn(ruta), ruta, fecha)];
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
}
