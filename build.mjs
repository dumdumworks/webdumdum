// ─────────────────────────────────────────────────────────────
// Build DUM DUM — sin Babel en el navegador.
//  · Compila src/*.jsx con esbuild (JSX clásico → React.createElement).
//  · Concatena en un bundle único minificado con hash de contenido.
//  · Autohospeda React/ReactDOM (vendor/) — sin unpkg (SPOF).
//  · Une styles.css + styles-2.css en un CSS con hash (sin @import en serie).
//  · Genera dist/index.html + una HTML por ruta con OG/canónica ESTÁTICOS
//    (para las previews sociales, que no ejecutan JS) y un <noscript> con lo
//    esencial. dist/404.html se sirve con estado 404 real.
//  · Carga de datos (menu/galerias/eventos.json) en PARALELO.
//  · Copia estáticos (img, json, admin, favicon, etc.) y escribe _headers.
// Salida: dist/  (directorio de publicación en Cloudflare Pages).
// ─────────────────────────────────────────────────────────────
import esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, "dist");
const rd = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const rb = (p) => fs.readFileSync(path.join(ROOT, p));
const hash8 = (buf) => crypto.createHash("sha256").update(buf).digest("hex").slice(0, 8);
const sri = (buf) => "sha384-" + crypto.createHash("sha384").update(buf).digest("base64");

// ── Limpiar dist ─────────────────────────────────────────────
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, "assets", "vendor"), { recursive: true });

// ── 1) Compilar el bundle de la app (sin Babel) ──────────────
const APP_FILES = ["src/data.jsx", "src/ui.jsx", "src/pages.jsx", "src/app.jsx"];
let bundle = "";
for (const f of APP_FILES) {
  const res = await esbuild.transform(rd(f), {
    loader: "jsx",
    jsx: "transform",           // clásico: React.createElement (React global de vendor)
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
  });
  bundle += `\n/* ${f} */\n` + res.code;
}
// Minificar espacios/sintaxis PERO conservar identificadores: los 4 ficheros
// comparten ámbito global (referencias cruzadas t/useLang/nav…), así que no
// renombramos nada para no romper esas referencias.
const min = await esbuild.transform(bundle, {
  minifyWhitespace: true,
  minifySyntax: true,
  minifyIdentifiers: false,
});
const appBuf = Buffer.from(min.code, "utf8");
const appName = `assets/dumdum.${hash8(appBuf)}.js`;
fs.writeFileSync(path.join(DIST, appName), appBuf);

// ── 2) CSS unido (styles.css sin el @import + styles-2.css) ──
const css2 = rd("src/styles-2.css");
const css1 = rd("src/styles.css").replace(/@import\s+url\(["']styles-2\.css["']\);\s*/i, "");
const cssBuf = Buffer.from(css2 + "\n" + css1, "utf8");
const cssName = `assets/dumdum.${hash8(cssBuf)}.css`;
fs.writeFileSync(path.join(DIST, cssName), cssBuf);

// ── 3) Vendor React/ReactDOM (autohospedados, con SRI) ───────
const reactBuf = rb("vendor/react.production.min.js");
const reactDomBuf = rb("vendor/react-dom.production.min.js");
const reactName = "assets/vendor/react-18.3.1.min.js";
const reactDomName = "assets/vendor/react-dom-18.3.1.min.js";
fs.writeFileSync(path.join(DIST, reactName), reactBuf);
fs.writeFileSync(path.join(DIST, reactDomName), reactDomBuf);
const reactSri = sri(reactBuf);
const reactDomSri = sri(reactDomBuf);

// ── 4) Versiones de datos (para ?v= estable, cacheable) ──────
const dataVer = {
  menu: hash8(rb("menu.json")),
  gal: hash8(rb("galerias.json")),
  ev: hash8(rb("eventos.json")),
};

// ── 5) Plantilla index → transformar a versión "buildeada" ───
let tpl = rd("index.html");

// 5a) Quitar meta http-equiv de caché (no funcionan; lo hace _headers).
tpl = tpl.replace(/\s*<meta http-equiv="Cache-Control"[^>]*>\s*/i, "\n  ");
tpl = tpl.replace(/\s*<meta http-equiv="Pragma"[^>]*>\s*/i, "");
tpl = tpl.replace(/\s*<meta http-equiv="Expires"[^>]*>\s*/i, "");

// 5b) CSS: reemplazar el <link> a src/styles.css por el CSS unido con hash.
// Con replaceOrThrow (hoisted, definido más abajo) para que FALLE RUIDOSAMENTE si
// el formato del <link> cambia: si no casara en silencio, el HTML publicado
// apuntaría a src/styles.css —inexistente en dist/— y verifyAssets no lo cazaría
// (solo revisa rutas que empiezan por "/"), publicando la web SIN ESTILOS.
tpl = replaceOrThrow(
  tpl,
  /<link rel="stylesheet" href="src\/styles\.css\?v=[^"]*" \/>/,
  () => `<link rel="stylesheet" href="/${cssName}" />`,
  "link del CSS"
);

// 5c) Reemplazar los 3 <script> de unpkg (React/ReactDOM/Babel) + el bloque
//     de arranque con Babel por: vendor React/ReactDOM (SRI) + boot paralelo.
const startMarker = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"';
const endMarker = ".then(function () { window.__bootDumDum(); });\n  </script>";
const a = tpl.indexOf(startMarker);
const b = tpl.indexOf(endMarker);
if (a === -1 || b === -1) throw new Error("No encuentro el bloque de arranque a reemplazar");
const boot = `<script src="/${reactName}" integrity="${reactSri}" crossorigin="anonymous"></script>
  <script src="/${reactDomName}" integrity="${reactDomSri}" crossorigin="anonymous"></script>

  <!-- Arranque sin Babel y ROBUSTO ante datos lentos/colgados (conexión mala):
       · La CARTA manda: en cuanto menu.json llega (o expira a los ~5s), montamos
         la app. Así /menu (2/3 del tráfico, móvil en el local) NO espera nunca
         por galerias.json ni eventos.json, y la web nunca se queda en blanco.
       · galerias.json y eventos.json van en 2º plano; al llegar avisamos a los
         componentes, que ya escuchan el evento "focus" para recargar sus datos.
       · Cada fetch lleva AbortController con timeout, para no colgarse jamás. -->
  <script>
    (function () {
      var TIMEOUT = 5000;
      function grab(url) {
        var ctrl = ("AbortController" in window) ? new AbortController() : null;
        var t = ctrl ? setTimeout(function () { ctrl.abort(); }, TIMEOUT) : null;
        return fetch(url, ctrl ? { signal: ctrl.signal } : undefined)
          .then(function (r) { return r.ok ? r.json() : null; })
          .catch(function () { return null; })
          .then(function (d) { if (t) clearTimeout(t); return d; });
      }
      var mounted = false;
      function mount() {
        if (mounted) return; mounted = true;
        var s = document.createElement("script");
        s.src = "/${appName}";
        document.body.appendChild(s);
      }
      // 1) menu.json → montar (pase lo que pase con las otras dos peticiones).
      grab("/menu.json?v=${dataVer.menu}").then(function (d) {
        if (d && d.sections) window.PUBLISHED_MENU = d;
        mount();
      });
      // Doble red de seguridad: montar igualmente si algo impidiera el then de arriba.
      setTimeout(mount, TIMEOUT + 500);
      // 2) galerías y textos de eventos en 2º plano; al llegar, avisar (si ya
      //    está montado) con "focus", que es lo que recargan los componentes.
      grab("/galerias.json?v=${dataVer.gal}").then(function (d) {
        if (d) { window.PUBLISHED_GALLERY = d; if (mounted) window.dispatchEvent(new Event("focus")); }
      });
      grab("/eventos.json?v=${dataVer.ev}").then(function (d) {
        if (d) { window.PUBLISHED_EVENTOS = d; if (mounted) window.dispatchEvent(new Event("focus")); }
      });
    })();
  </script>`;
tpl = tpl.slice(0, a) + boot + tpl.slice(b + endMarker.length);

// 5d) <noscript> con lo esencial (para quien no ejecuta JS).
const NOSCRIPT = `
  <noscript>
    <div style="max-width:680px;margin:0 auto;padding:24px;font-family:system-ui,sans-serif;line-height:1.5">
      <h1>DUM DUM™ — Dumplings &amp; Desobediencia</h1>
      <p>Dumplings caseros en Madrid. Abiertos todos los días.</p>
      <p><strong>Horario:</strong> 13.00–15.39 y 20.00–22.39.</p>
      <p><strong>Chamberí:</strong> Blasco de Garay, 10 · 28015 Madrid · <a href="tel:+34624560181">+34 624 56 01 81</a></p>
      <p><strong>Bernabéu:</strong> Infanta Mercedes, 17 · 28020 Madrid · <a href="tel:+34614167317">+34 614 16 73 17</a></p>
      <p><a href="/menu">Ver la carta</a> · <a href="/locales">Locales y reservas</a> · <a href="/eventos">Eventos</a> · <a href="/contacto">Contacto</a></p>
      <p><a href="https://www.instagram.com/dumdum.plings">Instagram @dumdum.plings</a></p>
    </div>
  </noscript>`;
tpl = tpl.replace('<div id="root"></div>', '<div id="root"></div>' + NOSCRIPT);

// ── 6) Escribir index.html + una HTML por ruta (OG estático) ─
// Los textos SEO NO se duplican aquí: se leen de la MISMA fuente que usa el
// runtime (window.__ROUTES_SEO en index.html). Así el OG estático (lo que ven
// los rastreadores sociales) y el runtime (lo que ve Google) no pueden divergir.
function extractRoutesSeo(html) {
  const m = html.match(/window\.__ROUTES_SEO\s*=\s*(\[[\s\S]*?\]);/);
  if (!m) throw new Error("No encuentro window.__ROUTES_SEO en index.html (¿cambió el formato?)");
  let arr;
  try { arr = new Function("return (" + m[1] + ")")(); } // literal de nuestro propio HTML de confianza
  catch (e) { throw new Error("No puedo evaluar window.__ROUTES_SEO: " + e.message); }
  if (!Array.isArray(arr) || arr.length === 0) throw new Error("window.__ROUTES_SEO vacío o inválido");
  return arr;
}
const ROUTES_SEO = extractRoutesSeo(rd("index.html"));
const FILE_FOR = { "/": "index.html", "/menu": "menu.html", "/locales": "locales.html", "/eventos": "eventos.html", "/contacto": "contacto.html" };
const ROUTES = Object.keys(FILE_FOR).map((p) => {
  const s = ROUTES_SEO.find((r) => r.p === p);
  if (!s) throw new Error("Falta la ruta " + p + " en window.__ROUTES_SEO");
  if (!s.t || s.d == null) throw new Error("Ruta " + p + " sin título/description en window.__ROUTES_SEO");
  return { p, file: FILE_FOR[p], t: s.t, d: s.d };
});

const ORIGIN = "https://dum-dum.es";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Reemplazo que FALLA RUIDOSAMENTE si el patrón no casa (p. ej. porque cambió el
// formato de los <meta> en index.html): así el OG por ruta nunca se queda con el
// de la home en silencio. Usa función de reemplazo para no interpretar "$" del texto.
function replaceOrThrow(str, re, fn, label) {
  if (!re.test(str)) throw new Error("Reemplazo NO aplicado en index.html: '" + label + "'. ¿Cambió el formato?");
  return str.replace(re, fn);
}
function renderRouteHtml(base, route) {
  const url = ORIGIN + (route.p === "/" ? "/" : route.p);
  let h = base;
  h = replaceOrThrow(h, /<title>[\s\S]*?<\/title>/, () => `<title>${esc(route.t)}</title>`, "title");
  h = replaceOrThrow(h, /(<meta name="description" content=")[^"]*(")/, (m, p1, p2) => p1 + esc(route.d) + p2, "description");
  h = replaceOrThrow(h, /(<link rel="canonical" href=")[^"]*(")/, (m, p1, p2) => p1 + esc(url) + p2, "canonical");
  const setMeta = (attr, name, val, label) => {
    const re = new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(")`);
    h = replaceOrThrow(h, re, (m, p1, p2) => p1 + esc(val) + p2, label);
  };
  setMeta("property", "og:title", route.t, "og:title");
  setMeta("property", "og:description", route.d, "og:description");
  setMeta("property", "og:url", url, "og:url");
  setMeta("name", "twitter:title", route.t, "twitter:title");
  setMeta("name", "twitter:description", route.d, "twitter:description");
  return h;
}
for (const route of ROUTES) {
  fs.writeFileSync(path.join(DIST, route.file), renderRouteHtml(tpl, route));
}
// 404 real: base con el título/estado de "no encontrado".
const notFound = renderRouteHtml(tpl, {
  p: "/404", t: "DUM DUM™ — Página no encontrada",
  d: "Por aquí no hay carta. Vuelve al inicio.",
});
fs.writeFileSync(path.join(DIST, "404.html"), notFound);

// ── 7) Copiar estáticos de la raíz ───────────────────────────
const copyFile = (rel) => fs.copyFileSync(path.join(ROOT, rel), path.join(DIST, rel));
const copyDir = (rel) => fs.cpSync(path.join(ROOT, rel), path.join(DIST, rel), { recursive: true });
// Datos + ficheros sueltos de raíz habituales (se copian los que existan).
const ROOT_FILES = [
  "menu.json", "galerias.json", "eventos.json", "robots.txt", "sitemap.xml",
  "favicon.ico", "site.webmanifest", "manifest.json", "browserconfig.xml",
];
for (const f of ROOT_FILES) {
  if (fs.existsSync(path.join(ROOT, f))) copyFile(f);
}
// Directorios de assets estáticos (img incluye favicons y og-image; admin = CMS).
for (const d of ["img", "admin"]) {
  if (fs.existsSync(path.join(ROOT, d))) copyDir(d);
}

// ── 7b) Verificar que NINGÚN recurso local del <head> falta en dist/ ──
// Recorre el HTML final y exige que cada recurso local con extensión de archivo
// (favicons, og-image, css, js, json…) exista ya en dist/. Si falta alguno,
// aborta el build en vez de dejar un 404 silencioso en producción.
(function verifyAssets() {
  const refs = new Set();
  // href/src/content="/ruta.ext"
  const reLocal = /(?:href|src|content)="(\/[^"?#]+\.[a-z0-9]+)(?:[?#][^"]*)?"/gi;
  // content="https://dum-dum.es/ruta.ext"  (p. ej. og:image)
  const reAbs = /(?:href|src|content)="https:\/\/dum-dum\.es(\/[^"?#]+\.[a-z0-9]+)(?:[?#][^"]*)?"/gi;
  let m;
  while ((m = reLocal.exec(tpl))) refs.add(m[1]);
  while ((m = reAbs.exec(tpl))) refs.add(m[1]);
  const missing = [...refs].filter((u) => !fs.existsSync(path.join(DIST, u.replace(/^\//, ""))));
  if (missing.length) {
    throw new Error("Recursos referenciados en el <head> que NO están en dist/:\n  " + missing.join("\n  "));
  }
  console.log("  verificados " + refs.size + " recursos del HTML (sin faltas)");
})();

// ── 8) _redirects ────────────────────────────────────────────
// IMPORTANTE — NO añadir rewrites "/ruta -> /ruta.html 200" ni un catch-all
// "/* -> /404.html 404":
//  · Cloudflare Pages YA sirve las URLs limpias desde los .html de dist/
//    (/menu ← menu.html) y redirige /menu.html -> /menu por su cuenta.
//    Un rewrite "/menu -> /menu.html 200" creaba un BUCLE INFINITO
//    (ERR_TOO_MANY_REDIRECTS): Cloudflare redirigía /menu.html -> /menu y el
//    rewrite lo devolvía a /menu.html, sin fin. (La home se salvaba porque la
//    URL limpia de index.html es "/", que no se redirige a sí misma.)
//  · Para lo inexistente, Cloudflare Pages sirve 404.html AUTOMÁTICAMENTE con
//    estado 404 (existe en dist/), así que el catch-all sobra y solo podía
//    interferir. Los estáticos existentes se sirven antes que cualquier splat.
// Solo dejamos redirecciones REALES (no rewrites a .html):
fs.writeFileSync(path.join(DIST, "_redirects"), `# Generado por build.mjs — NO editar a mano (edita build.mjs).
# Solo redirecciones reales. Las 5 rutas (/, /menu, /locales, /eventos,
# /contacto) las sirve Cloudflare Pages por URLs limpias desde sus .html; lo
# inexistente cae a 404.html (automático). NO poner "/ruta -> /ruta.html 200"
# (bucle infinito con la redirección .html->limpia de Cloudflare) ni "/* 404".
/menu_eng    /menu    301

# URL fantasma /embed (soft-404 histórico): a la home.
/embed       /    301
/embed/*     /    301

# Normalización de barra final → URL canónica sin barra (protege el QR si
# apunta a /menu/). Redirige HACIA la limpia, que Cloudflare sirve (no vuelve
# a redirigir), así que no hay bucle.
/menu/       /menu       301
/locales/    /locales    301
/eventos/    /eventos    301
/contacto/   /contacto   301

# CMS Sveltia (carpeta estática).
/admin/*     /admin/:splat    200
`);

// ── 9) _headers (caché real; sustituye a los <meta http-equiv>) ─
fs.writeFileSync(path.join(DIST, "_headers"), `# Generado por build.mjs.
# HTML siempre fresco (contiene los ?v y las URLs con hash). Cloudflare Pages
# sirve las rutas como URLs LIMPIAS (/menu, no /menu.html), que no matchean
# "/*.html"; por eso hay que listar cada ruta limpia explícitamente, o su HTML
# quedaría con la caché por defecto y podría pedir un asset con hash ya
# inexistente tras un redeploy (pantalla en blanco).
/*.html
  Cache-Control: no-cache
/
  Cache-Control: no-cache
/menu
  Cache-Control: no-cache
/locales
  Cache-Control: no-cache
/eventos
  Cache-Control: no-cache
/contacto
  Cache-Control: no-cache
/admin/
  Cache-Control: no-cache

# Assets con hash en el nombre: inmutables y cacheables un año.
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# Datos del CMS: cacheables cortos (además el ?v los versiona).
/menu.json
  Cache-Control: public, max-age=300
/galerias.json
  Cache-Control: public, max-age=300
/eventos.json
  Cache-Control: public, max-age=300
`);

// ── Resumen ──────────────────────────────────────────────────
const kb = (b) => (b.length / 1024).toFixed(1) + "kB";
console.log("BUILD OK → dist/");
console.log("  " + appName + " (" + kb(appBuf) + ")");
console.log("  " + cssName + " (" + kb(cssBuf) + ")");
console.log("  vendor React+ReactDOM (SRI ok)");
console.log("  HTML: " + ROUTES.map((r) => r.file).join(", ") + ", 404.html");
console.log("  datos ?v: menu=" + dataVer.menu + " gal=" + dataVer.gal + " ev=" + dataVer.ev);
