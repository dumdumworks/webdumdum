// ─────────────────────────────────────────────────────────────
// Capa de plantillas de la web HTML: idioma, rutas y el documento entero
// (<head> + <body>). Es código de Node: lo ejecuta build.mjs, no el navegador.
// ─────────────────────────────────────────────────────────────
export const ORIGIN = "https://dum-dum.es";
// También la comilla simple: hay atributos con JSON entre comillas simples
// (data-textos, data-dish…) y un apóstrofo inglés ("Couldn't") los cortaba.
export const esc = (s) => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

// Las dos lenguas son RUTAS distintas (/menu y /en/menu), así que cada página se
// renderiza una vez por idioma con su propio `i`.
//   t(es, en)  → el texto en el idioma de la página (cae al español si falta EN)
//   ruta(p)    → la URL de la ruta p en este idioma. Solo las rutas que YA
//                existen en inglés (rutasEn) van bajo /en/; el resto sigue en
//                la URL de siempre, donde React mostrará el inglés por su cuenta.
//                Así, mientras convivan las dos webs, ningún enlace apunta a
//                una página que aún no existe.
export function idioma(lang, rutasEn = []) {
  const en = lang === "en";
  return {
    lang: en ? "en" : "es",
    t: (es, enTxt) => (en ? (enTxt || es) : es),
    ruta: (p) => (en && rutasEn.includes(p) ? "/en" + (p === "/" ? "/" : p) : p),
  };
}

// Archivo de dist/ que sirve una ruta: "/menu" → "menu.html",
// "/locales/chamberi" → "locales/chamberi.html"; en inglés, lo mismo bajo en/.
export function archivoDe(p, lang) {
  const base = p === "/" ? "index.html" : p.slice(1) + ".html";
  return lang === "en" ? "en/" + base : base;
}

// Idioma preferido. Quien ya eligió idioma (el selector lo guarda en
// localStorage, igual que React) aterriza siempre en su versión, venga por la
// URL que venga. Sin preferencia guardada no se toca nada: la URL manda, que
// es lo que necesitan los enlaces compartidos y los rastreadores. Va el PRIMERO
// del <head> para que, si hay salto, no dé tiempo ni a cargar Cookiebot.
const PREFERENCIA = '(function(){try{var v=localStorage.getItem("dumdum.lang");if(!v)return;'
  + 'var p=location.pathname,en=p==="/en"||p.indexOf("/en/")===0,q=location.search+location.hash;'
  + 'if(v==="en"&&!en)location.replace("/en"+(p==="/"?"/":p)+q);'
  + 'else if(v!=="en"&&en)location.replace((p.slice(3)||"/")+q)}catch(e){}})();';

// Documento completo de una página.
//   i        → idioma()      ruta → ruta neutra ("/menu"), sin /en
//   titulo, desc, cuerpo (HTML del <body>), ld (JSON-LD o null)
//   analitica → src/html/analitica.html; el banner de Cookiebot sale en el
//               idioma de la página (data-culture), no en el del navegador
//   css, islas → rutas en dist/ (con hash)
export function documento({ i, ruta, titulo, desc, cuerpo, ld, analitica, css, islas }) {
  const urlEs = ORIGIN + ruta;
  const urlEn = ORIGIN + "/en" + (ruta === "/" ? "/" : ruta);
  const url = i.lang === "en" ? urlEn : urlEs;
  // "</" no puede aparecer dentro de un <script>: se escapa el "<".
  const jsonLd = ld ? JSON.stringify(ld, null, 2).replace(/</g, "\\u003c") : "";
  return `<!DOCTYPE html>
<html lang="${i.lang}">
<head>
  <meta charset="UTF-8">
  <script>${PREFERENCIA}</script>

  ${analitica.replace('id="Cookiebot"', `id="Cookiebot" data-culture="${i.lang.toUpperCase()}"`)}

  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(titulo)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${esc(url)}">
  <link rel="alternate" hreflang="es" href="${esc(urlEs)}">
  <link rel="alternate" hreflang="en" href="${esc(urlEn)}">
  <link rel="alternate" hreflang="x-default" href="${esc(urlEs)}">

  <link rel="icon" href="/favicon.ico?v=3" sizes="any">
  <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png?v=3">
  <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png?v=3">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="DUM DUM™">
  <meta property="og:title" content="${esc(titulo)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:image" content="${ORIGIN}/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="${i.lang === "en" ? "en_GB" : "es_ES"}">
  <meta property="og:locale:alternate" content="${i.lang === "en" ? "es_ES" : "en_GB"}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(titulo)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image" content="${ORIGIN}/og-image.png">
${ld ? `  <script type="application/ld+json">\n${jsonLd}\n  </script>\n` : ""}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/${css}">
  <script src="/${islas}" defer></script>
</head>
<body>
${cuerpo}
</body>
</html>
`;
}
