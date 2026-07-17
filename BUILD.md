# Build sin Babel (Fase 5)

La web tenía dos problemas estructurales: compilaba el JSX en el navegador con
**Babel Standalone** (~3 MB + transpilar ~230 KB en cada visita, en el móvil que
escanea el QR) y cargaba React desde unpkg (punto único de fallo). Este build los
elimina.

## Qué hace `build.mjs`

`node build.mjs` genera `dist/` (directorio de publicación):

- Compila `src/*.jsx` con **esbuild** (sin Babel) a un bundle único
  `assets/dumdum.<hash>.js` minificado. Se conservan los identificadores porque
  los 4 ficheros comparten ámbito global (referencias cruzadas `t`, `useLang`…).
- **Autohospeda** React/ReactDOM 18.3.1 (`vendor/`) con **SRI** — sin unpkg.
- Une `styles.css` + `styles-2.css` en un CSS con hash (sin `@import` en serie).
- Carga `menu.json` / `galerias.json` / `eventos.json` en **paralelo**
  (`Promise.all`) y con `?v=<hash-de-contenido>` (cacheable, se invalida al publicar).
- Genera una HTML por ruta (`index/menu/locales/eventos/contacto.html`) con
  **OG/canónica/título ESTÁTICOS** — así las previews sociales (WhatsApp/Facebook,
  que no ejecutan JS) muestran el título correcto de cada página. Más un
  `<noscript>` con lo esencial (direcciones, horario :39, teléfonos, enlaces).
- `404.html` servido con **estado 404 real** (elimina soft-404 como `/embed`).
- Escribe `_headers` (caché real: HTML `no-cache`, `/assets/*` inmutable) y
  `_redirects` (rutas → su HTML prerenderizado, normalización de barra, 404 real).

## Cutover en Cloudflare Pages (paso MANUAL — requiere el panel)

Hoy el proyecto está como "sin build, servir la raíz". Mientras no se cambie,
**la web sigue funcionando con la raíz actual** (con Babel). Para activar el build:

1. En Cloudflare Pages → Settings → Builds & deployments:
   - **Build command:** `npm ci && node build.mjs`
   - **Build output directory:** `dist`
2. Guardar y hacer un deploy. A partir de ahí sirve `dist/` (sin Babel).

`vendor/` (React/ReactDOM) y `build.mjs` se versionan; `dist/` y `node_modules/`
están en `.gitignore` (los genera el build). Sveltia sigue publicando `menu.json`
etc. como hasta ahora; cada publicación dispara un rebuild que recalcula los `?v`.

## Prerender: alcance

Se prerenderiza el `<head>` (OG/SEO por ruta) y un `<noscript>` con lo esencial.
NO se prerenderiza el `<body>` completo de la app (React sigue hidratando en
cliente). Motivo: Search Console confirma que Googlebot ya renderiza y **indexa
las 5 rutas**, así que el prerender completo no era urgente; el valor real
—previews sociales, 404 real y contenido sin JS— queda cubierto con lo anterior.
Un SSG con hidratación total queda anotado como mejora futura.
