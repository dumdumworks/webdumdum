# Build de la web (HTML generado con Node + esbuild)

La web es **HTML estático por página**, generado por `build.mjs`, con un poco de
JavaScript en "islas" para lo que se mueve (modales, galerías, formulario…). La
carta es la excepción: se pinta en el borde de Cloudflare en cada petición con la
carta viva de KV. No hay framework en el navegador.

## Configuración en Cloudflare Pages (ya aplicada)

- **Build command:** `npm ci && node build.mjs`
- **Build output directory:** `dist`

`build.mjs`, `src/` y los JSON se versionan; `dist/`, `node_modules/` y
`functions/_generado/` van en `.gitignore` (los genera el build). `galerias.json`
y `eventos.json` se editan en el repo: cada push a `main` dispara un rebuild.
La carta (`menu.json` / KV) no necesita build: ver más abajo.

## Qué hace `build.mjs`

`node build.mjs` genera `dist/`:

1. **Islas** (`src/islas/`): un solo `assets/islas.<hash>.js` (≈17 kB, ~6 kB gzip),
   minificado con esbuild, cargado con `defer`. Cada isla busca su elemento y, si la
   página no lo tiene, no hace nada.
2. **CSS**: `styles-2.css` + `styles.css` (en ese orden, replicando la cascada del
   `@import` original) minificados en `assets/dumdum.<hash>.css`.
3. **Páginas**: una función por página en `src/html/paginas/` devuelve
   `{ titulo, desc, cuerpo, ld }`; `documento()` (`plantilla.mjs`) la envuelve en el
   `<head>` completo (title, description, canónica, `hreflang`, Open Graph, JSON-LD,
   fuentes, CSS e islas). Cada página se escribe dos veces: `/ruta` y `/en/ruta`
   (`dist/en/…`). Más `404.html` y `en/404.html`, que Cloudflare sirve con estado
   404 real. El build comprueba que existan todas las imágenes referenciadas y los
   recursos del `<head>`; si falta algo, aborta.
4. **La carta para el edge**: `src/html/carta-edge.mjs` (documento + shell +
   platos) se empaqueta con las constantes resueltas (analítica, hashes, locales,
   SEO) en `functions/_generado/carta.js`. Pages empaqueta `functions/` después.
   También escribe `functions/_generado/sitemap.js` (rutas y fecha del último commit
   del contenido de cada página) para `functions/sitemap.xml.js`, que sirve el
   sitemap en el edge: las 7 rutas en los dos idiomas con `hreflang`, y la carta
   fechada por el panel (KV `updated`).
5. **Estáticos**: `img/`, `panel/`, favicons, `robots.txt`
   y `menu.base.json` (copia de `menu.json`, respaldo de la carta).
6. **`_redirects`** y **`_headers`**, generados a partir de todas las rutas limpias
   en los dos idiomas (barra final → 301; HTML `no-cache`; `/assets/*` inmutable).

En local (sin `CF_PAGES`) copia además `dev/*.html` (el visor `marco.html`).

## Dónde vive cada cosa (`src/html/`)

- `plantilla.mjs`: `idioma(lang, rutasEn)` (`t(es, en)`, `ruta(p)`), `documento()`,
  `archivoDe()`, `esc()`. El script de idioma preferido va el primero del `<head>`.
- `shell.mjs`: topbar, flotante "Pide ya", modales (pedir, reservar, DISH),
  footer y `specFoot()`. `esqueleto()` monta una página a partir de su `<main>`.
- `locales.mjs`: los datos de los dos locales (FUENTE ÚNICA).
- `seo.mjs`: título, descripción e imagen para compartir por ruta (`t`/`d` en español,
  `te`/`de` en inglés, `og` → `img/og/<og>.jpg`, 1200×630).
- `analitica.html`: Consent Mode v2 → Cookiebot (síncrono) → GA4 (solo en
  producción) y el listener global de conversiones. **No alterar ese orden.**
- `ld-global.json`: JSON-LD del restaurante con los dos locales (lo llevan las
  páginas sin JSON-LD propio).
- `enlaces.mjs`, `texto.mjs` (mini-markdown, saneador), `imagenes.mjs` (srcset),
  `galeria.mjs`, `embeds.mjs`, `carta.mjs` (la carta y sus alérgenos).
- `paginas/`: `home`, `menu`, `locales`, `local` (fichas), `eventos`, `contacto`, `404`.

## La carta (`/menu`, `/en/menu`)

No es un archivo: `functions/menu.js` y `functions/en/menu.js` (vía
`functions/_lib/carta.js`) leen la carta viva de KV (binding `MENU`, la escribe
el panel) o `/menu.base.json` si falta, y la pintan en cada petición con
`functions/_generado/carta.js`. Caché corta (`max-age=15, stale-while-revalidate=60`),
como `menu.json`. Lleva datos estructurados `schema.org/Menu`. La barra final se
normaliza en la propia función (`_redirects` no alcanza a las funciones).

### Infraestructura en Cloudflare (proyecto `webdumdum`, entorno Production)

- **KV** `dumdum-menu`, binding **`MENU`**: la carta viva (clave `current`,
  con `updated` en formato `AAAA-MM-DD`, que fecha `/menu` en el sitemap).
- **R2** `dumdum-fotos`, binding **`PHOTOS`**: fotos de platos subidas desde el
  panel, servidas por `functions/img/menu/[[path]].js`.
  El panel las redimensiona en el navegador antes de subirlas (principal de
  hasta 1200 px y variantes de 480 y 800, JPEG, sin librerías) y la carta usa
  el `srcset`. El nombre lleva el ancho (`<plato>-<ts>-1200.jpg`): así se
  distinguen de las subidas antes (sin variantes). Convención en
  `src/html/fotos-r2.mjs`; si cambian `ANCHOS`, cambiarlos también en el script
  de `panel/index.html`.
- **Access** (Zero Trust): aplicación self-hosted sobre `dum-dum.es/panel` y
  `dum-dum.es/api`, política Allow por email. Protege el panel y `functions/api/*`.
- Los previews (`*.pages.dev`) no tienen KV: sirven la copia del repo.

## Idiomas

ES y EN son **rutas distintas** (`/menu` y `/en/menu`) con `hreflang` cruzado. El
selector es un enlace; al pulsarlo guarda la preferencia en `localStorage`
(`dumdum.lang`) y el script de cabecera lleva a cada uno a su versión al
aterrizar. Sin preferencia guardada manda la URL (enlaces compartidos,
rastreadores).

## Fotos

Las fotos de los locales (`img/chamberi`, `img/espacio`) tienen variantes de 480 y
800 px generadas con `python3 dev/fotos-variantes.py` (Pillow) y guardadas en el
repo; `imagenes.mjs` monta el `srcset`. Si una carpeta con variantes tiene una foto
nueva sin procesar, el build aborta. Las demás fotos se sirven tal cual.

## `_redirects`: solo redirecciones reales

**NO añadir reglas `/ruta → /ruta.html 200` ni un catch-all `/* → /404.html 404`.**
Cloudflare Pages ya sirve las URLs limpias desde los `.html` de `dist/` y usa
`404.html` automáticamente para lo inexistente. Un rewrite `/menu → /menu.html`
provocó un **bucle infinito** (`ERR_TOO_MANY_REDIRECTS`): Cloudflare redirige
`/menu.html → /menu` por su cuenta y el rewrite lo devolvía a `/menu.html`.

El `_redirects` generado solo contiene: el 301 de `/menu_eng`, los de `/embed`
(soft-404 histórico) y la normalización de barra final.

> No hay `_redirects` ni `_headers` en la raíz del repo: Cloudflare solo lee
> `dist/`, y los únicos válidos los genera `build.mjs`.

## Fuentes

Webfonts:
- **Helvetica Neue**, alojada en `fonts/` con el nombre de familia propio
  `"Helvetica Neue Web"` para que ningún dispositivo use la del sistema. Solo los
  estilos que usa la web: Roman (400), Italic (400), Medium (500) y Bold (600 y
  700; no existe semibold), recortadas a Latín (~12–15 kB cada una). Medium, Bold
  y Roman se precargan en `plantilla.mjs`. Si se añade un peso o estilo, hay que
  añadir su archivo y su `@font-face`: si no, el navegador lo sintetiza.
  Para regenerarlas, sobre `HelveticaNeue.ttc`: `pyftsubset --font-number=N
  --unicodes=U+0020-007E,U+00A0-017F,U+2010-2027,U+2030,U+2039-203A,U+20AC,U+2122,U+2212,U+2248,U+2264-2265
  --layout-features=kern,liga,tnum,pnum,lnum,case --flavor=woff2 --no-hinting`
  (caras 0, 2, 10 y 1 del `.ttc`). Flechas, ★, ✕ y emojis no existen en
  Helvetica Neue: salen de la fuente de reserva, como siempre.
- **JetBrains Mono** (Google Fonts): topbar, estado del local y metadatos.
- **Mastone Outline** y **SF Compact Bold**, recortadas: solo el logo de la home.
Hubo un kit de Adobe Typekit que se retiró: ninguna regla usaba sus familias y
costaba dos orígenes render-blocking. No reintroducir sin comprobar que se usa.

## Embeds de terceros

Los iframes de YouTube, Instagram y Google Maps llevan `data-cookieconsent="ignore"`:
el bloqueo automático de Cookiebot vaciaría su `src` hasta el consentimiento (la
web siempre los ha cargado sin esperar; si algún día se quiere cumplir a
rajatabla, es una decisión de negocio). Los vídeos de Universo van como
miniatura + play y solo incrustan el reproductor al pulsar.
