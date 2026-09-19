# Cómo añadir una página nueva

La web es HTML generado por `build.mjs` (ver `BUILD.md`). Una página nueva son
**tres pasos** y sale en los dos idiomas.

## Paso 1 — La plantilla (en `src/html/paginas/`)

    // src/html/paginas/merch.mjs
    import { esc } from "../plantilla.mjs";
    import { esqueleto, specFoot } from "../shell.mjs";

    export const RUTA = "/merch";

    export function merch(i, { locales, seo, ldGlobal }) {
      const { t } = i;                       // t(es, en) según el idioma de la página
      const s = seo.find((r) => r.p === RUTA);
      const main = `<section style="padding:14vh var(--gutter) 6vh">
      <div class="tiny muted">[06] ${esc(t("Merch", "Merch"))}</div>
      <h1 class="h-display" style="margin-top:16px">${esc(t("Camisetas.", "Tees."))}</h1>
    </section>`;
      return {
        titulo: i.lang === "en" ? (s.te || s.t) : s.t,
        desc: i.lang === "en" ? (s.de || s.d) : s.d,
        cuerpo: esqueleto(i, RUTA, locales, main),   // topbar + flotante + modales + footer
        ld: ldGlobal,
      };
    }

- Todo texto en los dos idiomas con `t(es, en)`. Todo lo que venga de datos pasa
  por `esc()`.
- Enlaces internos con `i.ruta("/menu")`: en la versión inglesa apunta a `/en/menu`.
- Botones que abren los modales: `data-reservar` (selector de local),
  `data-reservar="chamberi"` (directo), `data-pide`, `data-pide="domicilio"`.
- Si la página necesita comportamiento, una isla en `src/islas/` registrada en
  `islas.js`: busca su elemento y, si no está, no hace nada.

## Paso 2 — Título y descripción (en `src/html/seo.mjs`)

    { p: "/merch", t: "DUM DUM™ — Merch", d: "Camisetas y merch de DUM DUM.",
      te: "DUM DUM™ — Merch", de: "DUM DUM tees and merch." },

## Paso 3 — Registrarla (en `build.mjs`)

    import { merch, RUTA as RUTA_MERCH } from "./src/html/paginas/merch.mjs";
    …
    const PAGINAS_HTML = { …, [RUTA_MERCH]: merch };

Con eso salen `dist/merch.html` y `dist/en/merch.html` (`/merch` y `/en/merch`),
sus reglas de `_headers` y `_redirects`, y el selector de idioma y el resto de
enlaces de la web la conocen. El build aborta si falta la entrada de SEO.

## Enlazarla

Desde cualquier plantilla, `<a href="${i.ruta("/merch")}">`. Enlaces externos:
URL completa con `target="_blank" rel="noreferrer"`. Imágenes como `img/...`
(el `<base href="/">` las resuelve desde la raíz).

## Reglas de oro
- **No toques el `_redirects` ni el `_headers` generados**: no hace falta, y
  `/ruta → /ruta.html 200` provoca un bucle infinito (ver `BUILD.md`).
- Nada de estilos nuevos sueltos: tokens (`var(--…)`) y las clases que ya existen.
- Mide la página en 375, 390, 768, 1024, 1440 y 1920, en ES y EN.
