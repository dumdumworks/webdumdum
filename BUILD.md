# Build de la web (esbuild, sin Babel)

La web se compila con **esbuild** y se publica desde `dist/`. **El cutover ya está
hecho**: en producción NO hay Babel en el navegador ni scripts desde unpkg.

Antes, la web compilaba el JSX en el navegador con **Babel Standalone** (~3 MB +
transpilar ~230 KB en cada visita, en el móvil que escanea el QR) y cargaba React
desde unpkg (punto único de fallo). Esto lo elimina.

## Configuración en Cloudflare Pages (ya aplicada)

- **Build command:** `npm ci && node build.mjs`
- **Build output directory:** `dist`

`build.mjs`, `vendor/` (React/ReactDOM) y los JSON se versionan; `dist/` y
`node_modules/` van en `.gitignore` (los genera el build). Sveltia sigue publicando
`menu.json` / `galerias.json` / `eventos.json` como siempre: **son la fuente de la
verdad en runtime**, y cada publicación dispara un rebuild que recalcula los `?v`.

## Qué hace `build.mjs`

`node build.mjs` genera `dist/`:

- Compila `src/*.jsx` con **esbuild** a un bundle único `assets/dumdum.<hash>.js`
  minificado. Se conservan los identificadores porque los 4 ficheros comparten
  ámbito global (referencias cruzadas `t`, `useLang`…).
- **Autohospeda** React/ReactDOM 18.3.1 (`vendor/`) con **SRI** — sin unpkg.
- Une `styles.css` + `styles-2.css` en un CSS **minificado** con hash (sin
  `@import` en serie).
- Genera una HTML por ruta (`index/menu/locales/eventos/contacto.html`) con
  **OG/canónica/título ESTÁTICOS** — así las previews sociales (WhatsApp/Facebook,
  que no ejecutan JS) muestran el título correcto de cada página. Más un
  `<noscript>` con lo esencial (direcciones, horario :39, teléfonos, enlaces).
  Si algún reemplazo de OG/canónica no casa, el build **aborta** (nada silencioso).
- `404.html`, que Cloudflare Pages sirve automáticamente con **estado 404 real**.
- Inyecta `<link rel="preload">` del bundle y de `menu.json` con los hashes que él
  mismo genera, para que se descarguen en paralelo desde el primer momento en vez
  de en serie tras react-dom. **Ojo con `crossorigin`: no es simétrico** — el
  bundle se inyecta con `<script src>` (no-CORS) y va SIN; `menu.json` se pide con
  `fetch()` (cors) y va CON. Equivocarlo duplica la descarga.
- Escribe `_headers` (HTML `no-cache` incluidas las URLs limpias `/menu`,
  `/locales`… que no matchean `/*.html`; `/assets/*` inmutable) y `_redirects`.
- Verifica que todos los recursos locales del `<head>` existen en `dist/`; si falta
  alguno, aborta.

## `_redirects`: solo redirecciones reales

**NO añadir reglas `/ruta → /ruta.html 200` ni un catch-all `/* → /404.html 404`.**
Cloudflare Pages ya sirve las URLs limpias desde los `.html` de `dist/` y usa
`404.html` automáticamente para lo inexistente. Un rewrite `/menu → /menu.html`
provocó un **bucle infinito** (`ERR_TOO_MANY_REDIRECTS`): Cloudflare redirige
`/menu.html → /menu` por su cuenta y el rewrite lo devolvía a `/menu.html`.

El `_redirects` generado solo contiene: el 301 de `/menu_eng`, los de `/embed`
(soft-404 histórico), la normalización de barra final y `/admin/*` (Sveltia).

> No hay `_redirects` en la raíz del repo: se eliminó tras el cutover porque no se
> publicaba (Cloudflare solo lee `dist/`) y era una trampa — quien lo editara no
> vería efecto, y copiar su catch-all reintroduciría el bucle. El único válido lo
> genera `build.mjs`. Lo mismo con `_headers`.

## Arranque (boot)

No es un `Promise.all` de los tres JSON: la carta manda. En cuanto llega
`menu.json` (o expira a los ~5 s con `AbortController`) se monta la app, para que
`/menu` —dos tercios del tráfico, móvil en el local— no espere nunca por
`galerias.json` ni `eventos.json`. Esos dos van en segundo plano y, al llegar,
despachan un evento `focus`, que es lo que los componentes escuchan para recargar
sus datos.

## Fuentes

La **única** webfont es **JetBrains Mono** (Google Fonts). El resto de la
tipografía es de sistema (`--font-display` / `--font-mono` = Helvetica Neue).
Hubo un kit de Adobe Typekit que se retiró: ninguna regla usaba sus familias y
costaba dos orígenes render-blocking. No reintroducir sin comprobar que se usa.

## Prerender: alcance

Se prerenderiza el `<head>` (OG/SEO por ruta) y un `<noscript>` con lo esencial.
**NO** se prerenderiza el `<body>` de la app.

Aviso para quien lo intente: la app monta con `createRoot().render()`, que **borra**
el contenido de `#root`. Meter HTML estático ahí provocaría un parpadeo, no una
mejora — haría falta migrar a hidratación (`hydrateRoot`), que es un cambio
arquitectónico serio. Google ya indexa las 5 rutas renderizando el JS, así que el
valor pendiente sería sobre todo para clientes sin JS.
