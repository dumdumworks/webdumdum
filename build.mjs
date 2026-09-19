// ─────────────────────────────────────────────────────────────
// Build DUM DUM — web HTML.
//  · Genera una página HTML por ruta e idioma desde src/html/ (plantillas en
//    Node): /ruta y /en/ruta, con title/description/canónica/hreflang/OG y
//    JSON-LD. 404.html y en/404.html se sirven con estado 404 real.
//  · La carta (/menu) no se escribe aquí: la pinta functions/menu.js en cada
//    petición con la carta viva de KV, usando la misma plantilla empaquetada
//    en functions/_generado/carta.js.
//  · Une styles.css + styles-2.css en un CSS con hash y las islas (src/islas/)
//    en un JS con hash.
//  · Copia estáticos (img, panel, favicons…) y escribe _redirects y
//    _headers.
// Salida: dist/  (directorio de publicación en Cloudflare Pages).
// ─────────────────────────────────────────────────────────────
import { execFileSync } from "node:child_process";
import esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { idioma, documento, archivoDe, ORIGIN } from "./src/html/plantilla.mjs";
import { LOCALES } from "./src/html/locales.mjs";
import { ROUTES_SEO } from "./src/html/seo.mjs";
import { local, RUTA_LOCAL } from "./src/html/paginas/local.mjs";
import { RUTA as RUTA_MENU } from "./src/html/paginas/menu.mjs";
import { locales as paginaLocales, RUTA as RUTA_LOCALES } from "./src/html/paginas/locales.mjs";
import { contacto, RUTA as RUTA_CONTACTO } from "./src/html/paginas/contacto.mjs";
import { eventos, RUTA as RUTA_EVENTOS } from "./src/html/paginas/eventos.mjs";
import { home, RUTA as RUTA_HOME } from "./src/html/paginas/home.mjs";
import { noEncontrada, RUTA as RUTA_404 } from "./src/html/paginas/404.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, "dist");
// CF_PAGES solo existe en el build de Cloudflare: lo que dependa de esLocal no se publica.
const esLocal = !process.env.CF_PAGES;
const rd = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const hash8 = (buf) => crypto.createHash("sha256").update(buf).digest("hex").slice(0, 8);

// ── Limpiar dist ─────────────────────────────────────────────
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, "assets"), { recursive: true });

// ── 1) Islas (src/islas/) ────────────────────────────────────
// El poco JS de las páginas, unido y minificado por esbuild, con nombre por
// hash para cachearlo un año (_headers, /assets/*).
const islasRes = await esbuild.build({
  entryPoints: [path.join(ROOT, "src/islas/islas.js")],
  bundle: true, minify: true, format: "iife", target: ["es2018"], write: false,
  logLevel: "silent",
});
if (islasRes.warnings.length) {
  throw new Error("Islas con avisos: " + islasRes.warnings.map((w) => w.text).join("; "));
}
const islasBuf = Buffer.from(islasRes.outputFiles[0].contents);
const islasName = `assets/islas.${hash8(islasBuf)}.js`;
fs.writeFileSync(path.join(DIST, islasName), islasBuf);

// ── 2) CSS unido y MINIFICADO (styles.css sin el @import + styles-2.css) ──
// Orden IMPORTANTE: styles-2 primero, replicando la cascada del @import original.
// Se minifica con esbuild antes de hashear, para que el hash refleje el contenido
// realmente publicado. Solo minifica (espacios/colores/sintaxis): no reescribe las
// url(...) relativas, que siguen resolviendo desde /assets/ igual que antes.
const css2 = rd("src/styles-2.css");
const css1 = rd("src/styles.css").replace(/@import\s+url\(["']styles-2\.css["']\);\s*/i, "");
const cssMin = await esbuild.transform(css2 + "\n" + css1, { loader: "css", minify: true });
const cssBuf = Buffer.from(cssMin.code, "utf8");
const cssName = `assets/dumdum.${hash8(cssBuf)}.css`;
fs.writeFileSync(path.join(DIST, cssName), cssBuf);

// Aviso ruidoso mientras algún local tenga texto de relleno. No aborta el build
// (se quiere poder desplegar la ficha con los datos buenos y la historia luego),
// pero queda en el log de cada despliegue para que no se olvide.
{
  const pendientes = Object.values(LOCALES).filter((L) => L.borrador).map((L) => L.nombre);
  if (pendientes.length) {
    console.log("  ⚠ OJO: texto de relleno sin sustituir en " + pendientes.join(", ") +
                " (DUMDUM_LOCALES.borrador). No se publica en el HTML ni en el JSON-LD.");
  }
}

// ── 3) Páginas HTML ──────────────────────────────────────────
// Cada página sale de su plantilla de src/html/paginas/, una vez por idioma
// (/ruta y /en/ruta). Para añadir una: plantilla + entrada en PAGINAS_HTML +
// título/descripción en src/html/seo.mjs (ver COMO-ANADIR-PAGINAS.md).
// El bloque Consent Mode → Cookiebot → GA va tal cual en cada <head>.
const ANALITICA = rd("src/html/analitica.html").trimEnd();
const DATOS_HTML = {
  locales: LOCALES, seo: ROUTES_SEO, raiz: ROOT,
  galerias: JSON.parse(rd("galerias.json")), eventos: JSON.parse(rd("eventos.json")), carta: JSON.parse(rd("menu.json")),
  ldGlobal: JSON.parse(rd("src/html/ld-global.json")),
};
function escribirPaginaHtml(render, ruta, lang, rutasEn) {
  const i = idioma(lang, rutasEn);
  const html = documento({
    i, ruta, ...render(i, DATOS_HTML),
    analitica: ANALITICA, css: cssName, islas: islasName,
  });
  // Ninguna imagen de la página puede faltar (img/ se copia entero a dist/ en el paso 7).
  const faltan = [...html.matchAll(/(?:src|srcset|data-src|data-srcset)="([^"]+)"/g)]
    .flatMap((m) => m[1].split(",").map((s) => s.trim().split(" ")[0]))
    .filter((u) => u.startsWith("img/") && !fs.existsSync(path.join(ROOT, u)));
  if (faltan.length) throw new Error("Imágenes que faltan en " + ruta + ":\n  " + faltan.join("\n  "));
  const file = path.join(DIST, archivoDe(ruta, lang));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}
// Páginas ya migradas: ruta → plantilla. Cada una se escribe en los dos idiomas.
// Cloudflare Pages sirve dist/locales/chamberi.html en /locales/chamberi y
// dist/en/locales/chamberi.html en /en/locales/chamberi, sin conflicto con
// locales.html → /locales (comprobado).
const PAGINAS_HTML = {
  [RUTA_HOME]: home,
  [RUTA_LOCALES]: paginaLocales,
  [RUTA_LOCAL("chamberi")]: local("chamberi"),
  [RUTA_LOCAL("bernabeu")]: local("bernabeu"),
  [RUTA_EVENTOS]: eventos,
  [RUTA_CONTACTO]: contacto,
};
// Páginas que se pintan en el edge en cada petición (functions/), con la misma
// capa de plantillas: la carta, que tiene que salir con lo que edita el panel.
const RUTAS_EDGE = [RUTA_MENU];
const RUTAS_HTML = [...Object.keys(PAGINAS_HTML), ...RUTAS_EDGE];

// ── 3b) Fechas para el sitemap ───────────────────────────────
// El <lastmod> de cada ruta es la fecha del último commit que tocó su CONTENIDO
// (plantilla y datos propios), no el shell ni el CSS: Google desconfía de un
// lastmod que cambia en cada deploy. La carta la fecha el panel (KV `updated`)
// en functions/sitemap.xml.js y aquí solo lleva el respaldo. Sin git (o sin
// historial en el build), la ruta va sin fecha antes que con una inventada.
const FUENTES_SITEMAP = {
  [RUTA_HOME]: ["src/html/paginas/home.mjs"],
  [RUTA_LOCALES]: ["src/html/paginas/locales.mjs", "src/html/locales.mjs"],
  [RUTA_LOCAL("chamberi")]: ["src/html/paginas/local.mjs", "src/html/locales.mjs", "galerias.json"],
  [RUTA_LOCAL("bernabeu")]: ["src/html/paginas/local.mjs", "src/html/locales.mjs", "galerias.json"],
  [RUTA_EVENTOS]: ["src/html/paginas/eventos.mjs", "eventos.json", "galerias.json"],
  [RUTA_CONTACTO]: ["src/html/paginas/contacto.mjs", "src/html/locales.mjs"],
  [RUTA_MENU]: ["src/html/paginas/menu.mjs", "src/html/carta.mjs", "menu.json"],
};
const fechaGit = (fuentes) => {
  try {
    const f = execFileSync("git", ["log", "-1", "--format=%cs", "--", ...fuentes], { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(f) ? f : null;
  } catch { return null; }
};
const SITEMAP = RUTAS_HTML.map((ruta) => {
  if (!FUENTES_SITEMAP[ruta]) throw new Error("Falta la ruta en FUENTES_SITEMAP: " + ruta);
  return { ruta, lastmod: fechaGit(FUENTES_SITEMAP[ruta]) };
});

// ── 4) La carta para el edge ─────────────────────────────────
// Se empaqueta la plantilla de la carta (documento + shell + platos) con sus
// constantes ya resueltas en functions/_generado/carta.js, que importa
// functions/_lib/carta.js. Pages empaqueta functions/ DESPUÉS de este build,
// así que el archivo siempre existe cuando hace falta. No se versiona.
{
  const define = {
    __ANALITICA__: JSON.stringify(ANALITICA), __CSS__: JSON.stringify(cssName),
    __ISLAS__: JSON.stringify(islasName), __LOCALES__: JSON.stringify(LOCALES),
    __SEO__: JSON.stringify(ROUTES_SEO), __RUTAS_HTML__: JSON.stringify(RUTAS_HTML),
  };
  const res = await esbuild.build({
    entryPoints: [path.join(ROOT, "src/html/carta-edge.mjs")],
    bundle: true, format: "esm", target: ["es2022"], write: false, define, logLevel: "silent",
  });
  if (res.warnings.length) throw new Error("Carta edge con avisos: " + res.warnings.map((w) => w.text).join("; "));
  fs.mkdirSync(path.join(ROOT, "functions/_generado"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "functions/_generado/carta.js"),
    "// GENERADO por build.mjs desde src/html/carta-edge.mjs. No editar.\n" + res.outputFiles[0].text);
  // Rutas y fechas para functions/sitemap.xml.js (mismo mecanismo, misma carpeta).
  fs.writeFileSync(path.join(ROOT, "functions/_generado/sitemap.js"),
    "// GENERADO por build.mjs. No editar.\nexport const ORIGIN = " + JSON.stringify(ORIGIN)
    + ";\nexport const SITEMAP = " + JSON.stringify(SITEMAP) + ";\n");
}

for (const [ruta, render] of Object.entries(PAGINAS_HTML)) {
  for (const lang of ["es", "en"]) escribirPaginaHtml(render, ruta, lang, RUTAS_HTML);
}
// 404 real: Cloudflare Pages sirve 404.html (y en/404.html bajo /en/) con estado 404.
for (const lang of ["es", "en"]) escribirPaginaHtml(noEncontrada, RUTA_404, lang, RUTAS_HTML);

// ── 5) Copiar estáticos de la raíz ───────────────────────────
const copyFile = (rel) => fs.copyFileSync(path.join(ROOT, rel), path.join(DIST, rel));
const copyDir = (rel) => fs.cpSync(path.join(ROOT, rel), path.join(DIST, rel), { recursive: true });
// Datos + ficheros sueltos de raíz habituales (se copian los que existan).
const ROOT_FILES = [
  "robots.txt",
  "favicon.ico",
  "favicon-48x48.png",
  "favicon-192x192.png",
  "apple-touch-icon.png",
  "og-image.png",
  "site.webmanifest", "manifest.json", "browserconfig.xml",
];
for (const f of ROOT_FILES) {
  if (fs.existsSync(path.join(ROOT, f))) copyFile(f);
}
// Copia de la carta con nombre distinto: es el RESPALDO que sirve
// functions/menu.json.js cuando la carta en vivo (Cloudflare KV) no está
// disponible (aún sin configurar, o error). Ruta distinta de /menu.json para
// que la función no se re-entre a sí misma al pedir el fallback.
if (fs.existsSync(path.join(ROOT, "menu.json"))) {
  fs.copyFileSync(path.join(ROOT, "menu.json"), path.join(DIST, "menu.base.json"));
}
// Directorios de assets estáticos (img incluye favicons y og-image; panel =
// editor de carta, protegido por Cloudflare Access).
for (const d of ["img", "panel"]) {
  if (fs.existsSync(path.join(ROOT, d))) copyDir(d);
}

// ── 5b) Verificar que NINGÚN recurso local del <head> falta en dist/ ──
// Recorre la home generada y exige que cada recurso local con extensión de
// archivo (favicons, og-image, css, js…) exista ya en dist/. Si falta alguno,
// aborta el build en vez de dejar un 404 silencioso en producción.
(function verifyAssets() {
  const home = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
  const refs = new Set();
  // href/src/content="/ruta.ext"
  const reLocal = /(?:href|src|content)="(\/[^"?#]+\.[a-z0-9]+)(?:[?#][^"]*)?"/gi;
  // content="https://dum-dum.es/ruta.ext"  (p. ej. og:image)
  const reAbs = /(?:href|src|content)="https:\/\/dum-dum\.es(\/[^"?#]+\.[a-z0-9]+)(?:[?#][^"]*)?"/gi;
  let m;
  while ((m = reLocal.exec(home))) refs.add(m[1]);
  while ((m = reAbs.exec(home))) refs.add(m[1]);
  const missing = [...refs].filter((u) => !fs.existsSync(path.join(DIST, u.replace(/^\//, ""))));
  if (missing.length) {
    throw new Error("Recursos referenciados en el <head> que NO están en dist/:\n  " + missing.join("\n  "));
  }
  console.log("  verificados " + refs.size + " recursos del HTML (sin faltas)");
})();

// Todas las URLs limpias que sirve la web, en sus dos idiomas. Las usan
// _redirects (barra final) y _headers (HTML sin caché).
const RUTAS_LIMPIAS = RUTAS_HTML.flatMap((p) => [p, idioma("en", RUTAS_HTML).ruta(p)]);

// ── 6) _redirects ────────────────────────────────────────────
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
${RUTAS_LIMPIAS.filter((p) => !p.endsWith("/")).map((p) => p + "/    " + p + "    301").join("\n")}
`);

// ── 7) _headers (caché real) ─────────────────────────────────
fs.writeFileSync(path.join(DIST, "_headers"), `# Generado por build.mjs.
# HTML siempre fresco (contiene los ?v y las URLs con hash). Cloudflare Pages
# sirve las rutas como URLs LIMPIAS (/menu, no /menu.html), que no matchean
# "/*.html"; por eso hay que listar cada ruta limpia explícitamente, o su HTML
# quedaría con la caché por defecto y podría pedir un asset con hash ya
# inexistente tras un redeploy (pantalla en blanco).
/*.html
  Cache-Control: no-cache
${RUTAS_LIMPIAS.map((p) => p + "\n  Cache-Control: no-cache").join("\n")}

# Assets con hash en el nombre: inmutables y cacheables un año.
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# Datos del CMS: cacheables cortos (además el ?v los versiona).
/menu.json
  Cache-Control: public, max-age=300

# ── Seguridad ────────────────────────────────────────────────
# Se aplican a TODO: una sola regla evita cabeceras duplicadas y
# contradictorias, que Cloudflare resolvería de forma ambigua.
#
# NO se declaran aquí X-Content-Type-Options ni Referrer-Policy: Cloudflare ya
# los envía (nosniff y strict-origin-when-cross-origin). Duplicarlos no aporta.
#
# HSTS sin includeSubDomains ni preload A PROPÓSITO: ambos son compromisos
# difíciles de revertir (un subdominio que algún día sirva HTTP dejaría de
# cargar, y preload exige darse de baja de una lista externa). max-age de un año
# ya cubre el dominio donde vive la web. Para endurecerlo: confirmar que TODOS
# los subdominios van por HTTPS y añadir "; includeSubDomains".
#
# Anti-clickjacking por partida doble (X-Frame-Options para navegadores viejos,
# frame-ancestors para los modernos). SAMEORIGIN/'self', no DENY/'none': bloquea
# igual el ataque real (que un tercero nos incruste) y deja margen a un iframe
# propio. Ojo: esto NO afecta a los iframes que la web INCRUSTA (DISH,
# Instagram, YouTube, Cookiebot) — eso sería frame-src.
#
# La CSP contiene SOLO frame-ancestors. Una CSP completa exigiría 'unsafe-inline'
# o hashes para los 7 scripts inline (Consent Mode, boot, SEO, GA…) y una lista
# de orígenes que es un blanco móvil: Google Analytics resuelve a endpoints
# regionalizados (region1.google-analytics.com y equivalentes según el país) y
# Cookiebot, en blockingmode auto, reescribe e inyecta scripts en caliente.
# Romper el consentimiento o las reservas no compensa para una web sin logins ni
# pagos. frame-ancestors es inmune a todo eso: no restringe scripts.
#
# Ninguna de las cuatro afecta a las ventanas emergentes ni a los iframes que
# incrustamos. COOP en su variante same-origin-allow-popups: conserva la relación
# con las emergentes que abre la página (el login de Cloudflare Access del panel
# no las usa, pero no cuesta nada dejar el margen).
/*
  Strict-Transport-Security: max-age=31536000
  X-Frame-Options: SAMEORIGIN
  Content-Security-Policy: frame-ancestors 'self'
  Cross-Origin-Opener-Policy: same-origin-allow-popups
/locales
  Cross-Origin-Opener-Policy: same-origin-allow-popups
/eventos
  Cross-Origin-Opener-Policy: same-origin-allow-popups
/contacto
  Cross-Origin-Opener-Policy: same-origin-allow-popups
`);

// ── Herramientas de revisión (SOLO en local) ─────────────────
// dev/ tiene el visor de móvil (marco.html). Se copia a dist/ para poder
// abrirlo en el servidor de pruebas, pero NUNCA en el build de Cloudflare: no
// pinta nada en producción. CF_PAGES solo existe allí.
// Antes vivía suelto en dist/, que este mismo script borra al empezar, así que
// desaparecía en cada compilación.
let devCopiados = 0;
if (esLocal && fs.existsSync(path.join(ROOT, "dev"))) {
  for (const f of fs.readdirSync(path.join(ROOT, "dev"))) {
    if (!f.endsWith(".html")) continue;
    fs.copyFileSync(path.join(ROOT, "dev", f), path.join(DIST, f));
    devCopiados++;
  }
}

// ── Resumen ──────────────────────────────────────────────────
const kb = (b) => (b.length / 1024).toFixed(1) + "kB";
console.log("BUILD OK → dist/");
if (devCopiados) console.log(`  dev/ → ${devCopiados} herramienta(s) de revisión (no se publican)`);
console.log("  " + cssName + " (" + kb(cssBuf) + ")");
console.log("  " + islasName + " (" + kb(islasBuf) + ") · islas");
console.log("  páginas: " + RUTAS_HTML.map((p) => p + " (+ /en" + p + ")").join(", ") + " · la carta se pinta en el edge (functions/_generado/carta.js)");
console.log("  404.html y en/404.html");
