# Cómo añadir una página nueva (sin romper nada)

La web usa **URLs limpias** (`/menu`, no `/#/menu`) y un router central, y se
compila con esbuild a `dist/` (ver `BUILD.md`). Añadir una página son **4 pasos**.
Si te saltas el paso 4, la página funcionará al navegar por dentro pero dará
**404 al entrar directamente por la URL** — que es justo como llega la gente.

## Paso 1 — Crear el componente (en `src/pages.jsx`)

    function Merch() {
      const lang = useLang();
      return (
        <div data-screen-label="merch">
          ...tu contenido...
        </div>
      );
    }

Y al final de `pages.jsx`, añádelo al `Object.assign(window, { ... })`:

    Object.assign(window, { Home, Menu, Locales, Contacto, Eventos, Merch });

## Paso 2 — Título y descripción SEO (en `index.html`)

`window.__ROUTES_SEO` es la **fuente única** de títulos/descripciones: la consumen
el "pre-SEO" del primer pintado, `app.jsx` en runtime y `build.mjs` para el OG
estático de cada HTML. Añade una entrada:

    { p: "/merch", t: "DUM DUM™ — Merch",
      d: "Camisetas y merch de DUM DUM." },

## Paso 3 — Registrar la ruta (en `src/app.jsx`)

En `getRoutesTable()`, una línea `mk(...)` (los textos son solo respaldo por si
`__ROUTES_SEO` no cargara):

    mk("/merch", false, "Merch",
      "DUM DUM™ — Merch",
      "Camisetas y merch de DUM DUM."),

## Paso 4 — Generar su HTML (en `build.mjs`) ← NO TE LO SALTES

Cloudflare sirve cada ruta desde su `.html` prerenderizado. Añade la ruta al mapa
`FILE_FOR`:

    const FILE_FOR = { …, "/merch": "merch.html" };

Sin esto no existe `dist/merch.html`, y `dum-dum.es/merch` devuelve el 404 real.
El build **aborta** si la ruta está en `FILE_FOR` pero falta en `__ROUTES_SEO`, así
que un despiste entre los pasos 2 y 4 se caza solo.

## Paso 5 — Enlazar a la página

Usa siempre rutas que empiezan por `/` (sin `#`):

    <a href="/merch">Merch →</a>

El interceptor de clics la hará navegar sin recargar. Para enlaces EXTERNOS
(Instagram, Uber, etc.) usa la URL completa y `target="_blank"` — el interceptor
los respeta y abre en pestaña nueva.

## Reglas de oro (para no romper nada)
- **Enlaces internos**: `href="/loquesea"` (empieza por `/`). NUNCA `href="#/loquesea"`.
- **Enlaces externos**: URL completa `https://...` + `target="_blank" rel="noreferrer"`.
- **Botones que no navegan** (abren un toast, etc.): `href="#"` + `onClick` con `e.preventDefault()`.
- No uses `window.location.hash` para navegar: usa `nav("/ruta")` o un `<a href="/ruta">`.
- Las imágenes van como `img/...` (el `<base href="/">` del index las resuelve desde la raíz).
- **No toques el `_redirects` generado** para dar de alta rutas: no hace falta, y
  añadir `/ruta → /ruta.html 200` provoca un bucle infinito (ver `BUILD.md`).

## Cosas que ya están resueltas
- URLs limpias + History API (atrás/adelante funciona, con restauración de scroll).
- Cada ruta se sirve desde su HTML prerenderizado; lo inexistente da **404 real**.
- Título, descripción, canónica y Open Graph por página, estáticos (las previews
  de WhatsApp/Facebook, que no ejecutan JS, ven el título correcto).
- Match de rutas estricto: páginas con nombres parecidos no colisionan.
- Sin Babel en el navegador: se compila en el build.

## Pendiente / mejora futura conocida
- El `<body>` no se prerenderiza (sí el `<head>` y un `<noscript>`). Hacerlo
  exigiría migrar a hidratación: la app monta con `createRoot().render()`, que
  borra el contenido de `#root`, así que meter HTML estático ahí solo produciría
  un parpadeo. Ver `BUILD.md`.
