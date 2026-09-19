// ─────────────────────────────────────────────────────────────
// Entrada del paquete que build.mjs compila a functions/_generado/carta.js:
// la carta entera (documento + shell + platos) lista para que la función de
// Cloudflare la sirva con la carta viva. Las constantes __X__ las inyecta el
// build (esbuild define): el bloque de analítica de index.html, los nombres
// con hash del CSS y las islas, los datos de los locales, el SEO y la lista
// de rutas HTML. Así la función no depende de nada del sistema de archivos.
// ─────────────────────────────────────────────────────────────
import { idioma, documento } from "./plantilla.mjs";
import { menu, RUTA } from "./paginas/menu.mjs";

export function paginaCarta(lang, carta) {
  const i = idioma(lang, __RUTAS_HTML__);
  return documento({
    i, ruta: RUTA, ...menu(i, { locales: __LOCALES__, seo: __SEO__, carta }),
    analitica: __ANALITICA__, css: __CSS__, islas: __ISLAS__,
  });
}
