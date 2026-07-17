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
tpl = tpl.replace(
  /<link rel="stylesheet" href="src\/styles\.css\?v=[^"]*" \/>/,
  `<link rel="stylesheet" href="/${cssName}" />`
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

  <!-- Arranque sin Babel: datos en PARALELO y luego el bundle precompilado. -->
  <script>
    (function () {
      function grab(url, assign) {
        return fetch(url).then(function (r) { return r.ok ? r.json() : null; })
          .then(function (d) { if (d) assign(d); }).catch(function () {});
      }
      Promise.all([
        grab("/menu.json?v=${dataVer.menu}", function (d) { if (d && d.sections) window.PUBLISHED_MENU = d; }),
        grab("/galerias.json?v=${dataVer.gal}", function (d) { window.PUBLISHED_GALLERY = d; }),
        grab("/eventos.json?v=${dataVer.ev}", function (d) { window.PUBLISHED_EVENTOS = d; })
      ]).then(function () {
        var s = document.createElement("script");
        s.src = "/${appName}";
        document.body.appendChild(s);
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
const ROUTES = [
  { p: "/", file: "index.html", t: "DUM DUM™ — Dumplings & Desobediencia",
    d: "Desobedecer es un derecho y una obligación. Los dumplings más diferentes y mejor valorados de España. Abiertos todos los días. Para tomar, para recoger y a domicilio." },
  { p: "/menu", file: "menu.html", t: "DUM DUM™ — La carta",
    d: "Nueve dumplings, uno nuevo cada mes y ni uno convencional." },
  { p: "/locales", file: "locales.html", t: "DUM DUM™ — Locales y reservas",
    d: "Puedes reservar en Chamberí o en Bernabéu. O en ambos :)." },
  { p: "/eventos", file: "eventos.html", t: "DUM DUM™ — Eventos",
    d: "Espacios cool para eventos en Madrid." },
  { p: "/contacto", file: "contacto.html", t: "DUM DUM™ — Contacto",
    d: "dumdum@dum-dum.es / +34 614 746 065" },
];
const ORIGIN = "https://dum-dum.es";
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function renderRouteHtml(base, route) {
  const url = ORIGIN + (route.p === "/" ? "/" : route.p);
  let h = base;
  h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(route.t)}</title>`);
  const setMeta = (attr, name, val) => {
    const re = new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(")`);
    h = h.replace(re, `$1${esc(val)}$2`);
  };
  h = h.replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(route.d)}$2`);
  h = h.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${esc(url)}$2`);
  setMeta("property", "og:title", route.t);
  setMeta("property", "og:description", route.d);
  setMeta("property", "og:url", url);
  setMeta("name", "twitter:title", route.t);
  setMeta("name", "twitter:description", route.d);
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

// ── 7) Copiar estáticos ──────────────────────────────────────
const copyFile = (rel) => fs.copyFileSync(path.join(ROOT, rel), path.join(DIST, rel));
const copyDir = (rel) => fs.cpSync(path.join(ROOT, rel), path.join(DIST, rel), { recursive: true });
for (const f of ["menu.json", "galerias.json", "eventos.json", "robots.txt", "sitemap.xml", "favicon.ico"]) {
  if (fs.existsSync(path.join(ROOT, f))) copyFile(f);
}
for (const d of ["img", "admin"]) {
  if (fs.existsSync(path.join(ROOT, d))) copyDir(d);
}

// ── 8) _redirects (per-route HTML + 404 real) ────────────────
fs.writeFileSync(path.join(DIST, "_redirects"), `# Generado por build.mjs — NO editar a mano (edita build.mjs).
/menu_eng    /menu    301

# URL fantasma /embed (soft-404): a la home.
/embed       /    301
/embed/*     /    301

# Normalización de barra final.
/menu/       /menu       301
/locales/    /locales    301
/eventos/    /eventos    301
/contacto/   /contacto   301

# CMS Sveltia.
/admin/*     /admin/:splat    200

# Rutas de la SPA → su HTML prerenderizado (OG estático correcto).
/            /index.html      200
/menu        /menu.html       200
/locales     /locales.html    200
/eventos     /eventos.html    200
/contacto    /contacto.html   200

# Cualquier otra ruta: 404 REAL (no soft-404).
/*           /404.html        404
`);

// ── 9) _headers (caché real; sustituye a los <meta http-equiv>) ─
fs.writeFileSync(path.join(DIST, "_headers"), `# Generado por build.mjs.
# HTML siempre fresco (contiene los ?v y las URLs con hash).
/*.html
  Cache-Control: no-cache
/
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
