// ─────────────────────────────────────────────────────────────
// App root: router por hash + loader inicial
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// TABLA DE RUTAS — única fuente de verdad.
// Para añadir una página nueva en el futuro: crea su componente en
// pages.jsx, expónlo en window (Object.assign al final de pages.jsx) y
// añade UNA línea aquí. El router, el scroll y la navegación lo cogen solos.
//   prefix: la URL empieza por esto (ej. "/menu" cubre "/menu" y "/menu/")
//   exact:  true si debe coincidir exactamente (solo la home "/")
// El orden importa: se evalúa de arriba a abajo, primero el que encaje.
// ─────────────────────────────────────────────────────────────
// Títulos/descripciones por ruta: FUENTE ÚNICA en window.__ROUTES_SEO (definida
// en index.html, para que también las use el "pre-SEO" del primer pintado). Aquí
// solo mapeamos prefijo → componente y tomamos title/desc de esa fuente; los
// textos hardcodeados son solo respaldo por si __ROUTES_SEO no cargara.
function getRoutesTable() {
  const seo = (typeof window !== "undefined" && window.__ROUTES_SEO) || [];
  const seoFor = (p) => { for (let i = 0; i < seo.length; i++) if (seo[i].p === p) return seo[i]; return null; };
  const mk = (prefix, exact, component, fbTitle, fbDesc) => {
    const s = seoFor(prefix);
    return { prefix, exact, component, title: s ? s.t : fbTitle, desc: s ? s.d : fbDesc };
  };
  return [
    mk("/",         true,  "Home",
      "DUM DUM™ — Dumplings & Desobediencia",
      "Desobedecer es un derecho y una obligación. Los dumplings más diferentes y mejor valorados de España. Abiertos todos los días. Para tomar, para recoger y a domicilio."),
    mk("/menu",     false, "Menu",
      "DUM DUM™ — La carta",
      "Nueve dumplings, uno nuevo cada mes y ni uno convencional."),
    mk("/locales",  false, "Locales",
      "DUM DUM™ — Locales y reservas",
      "Puedes reservar en Chamberí o en Bernabéu. O en ambos :)."),
    mk("/eventos",  false, "Eventos",
      "DUM DUM™ — Eventos",
      "Espacios cool para eventos en Madrid."),
    mk("/contacto", false, "Contacto",
      "DUM DUM™ — Contacto",
      "dumdum@dum-dum.es / +34 614 746 065")
    // Nota: /admin/ se sirve como carpeta estática (Sveltia CMS), no como ruta
    // de esta SPA. El _redirects de la raíz tiene una regla "/admin/* 200" antes
    // del catch-all para que Cloudflare Pages sirva los archivos de /admin/.
    // Futuras páginas: añade su title/desc en window.__ROUTES_SEO (index.html)
    // y una línea mk(...) aquí.
  ];
}

// Actualiza title, description, canonical, Open Graph y Twitter según la ruta
// (SEO por página). Así cada página tiene su propia URL canónica y su propia
// previsualización al compartir, no la de la home.
const SITE_ORIGIN = "https://dum-dum.es";

// Crea o actualiza un <meta>/<link> del <head>. selector identifica el tag;
// si no existe, lo crea con los atributos de create.
function setHeadTag(selector, create, attr, value) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement(create.tag);
    for (const k in create.attrs) el.setAttribute(k, create.attrs[k]);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function applyHeadMeta(matched, route) {
  if (typeof document === "undefined") return;
  const def = "DUM DUM™ — Dumplings & Desobediencia";
  const title = (matched && matched.title) ? matched.title : def;
  const desc = (matched && matched.desc != null) ? matched.desc : "";
  // URL canónica de esta página (sin barra final salvo la home).
  let path = route || "/";
  if (path.length > 1 && path.charAt(path.length - 1) === "/") path = path.slice(0, -1);
  const url = SITE_ORIGIN + (path === "/" ? "/" : path);

  document.title = title;
  setHeadTag('meta[name="description"]',
    { tag: "meta", attrs: { name: "description" } }, "content", desc);
  // Canónica dinámica: cada ruta apunta a sí misma, no a la home.
  setHeadTag('link[rel="canonical"]',
    { tag: "link", attrs: { rel: "canonical" } }, "href", url);
  // Open Graph (WhatsApp, Facebook…) por página.
  setHeadTag('meta[property="og:title"]',
    { tag: "meta", attrs: { property: "og:title" } }, "content", title);
  setHeadTag('meta[property="og:description"]',
    { tag: "meta", attrs: { property: "og:description" } }, "content", desc);
  setHeadTag('meta[property="og:url"]',
    { tag: "meta", attrs: { property: "og:url" } }, "content", url);
  // Twitter Card por página.
  setHeadTag('meta[name="twitter:title"]',
    { tag: "meta", attrs: { name: "twitter:title" } }, "content", title);
  setHeadTag('meta[name="twitter:description"]',
    { tag: "meta", attrs: { name: "twitter:description" } }, "content", desc);
}

function matchRoute(route) {
  const r = route || "/";
  const table = getRoutesTable();
  for (let i = 0; i < table.length; i++) {
    const entry = table[i];
    if (entry.exact) {
      if (r === entry.prefix || r === "") return entry;
    } else {
      // Coincide solo si es exactamente la ruta, o la ruta + "/algo".
      // Así "/menu" cubre "/menu", "/menu/", "/menu_eng" y "/menu/x",
      // pero una futura "/menu-degustacion" NO colisiona por accidente.
      if (r === entry.prefix) return entry;
      if (r.indexOf(entry.prefix + "/") === 0) return entry;
      if (r.indexOf(entry.prefix + "_") === 0) return entry; // legado: /menu_eng
    }
  }
  return null;
}

// ─── Restauración de scroll ───────────────────────────────────
// Navegación NUEVA (pushState / clic en un enlace) → scroll arriba.
// Atrás/adelante del navegador (popstate) → restaurar la posición previa.
// Sin esto, volver atrás desde una página siempre aterrizaba al principio.
if (typeof history !== "undefined" && "scrollRestoration" in history) {
  // Desactivamos la nativa: la gestionamos nosotros de forma coherente con la SPA.
  history.scrollRestoration = "manual";
}
const _scrollByPath = {};
let _navKind = "push"; // "push" (nav nueva) | "pop" (atrás/adelante)
let _restoringScroll = false; // mientras restauramos, no sobrescribir lo guardado
if (typeof window !== "undefined") {
  // Guardar de forma continua la posición de scroll de la ruta actual (salvo
  // mientras estamos restaurando, para que el propio scrollTo no la pise).
  window.addEventListener("scroll", () => {
    if (_restoringScroll) return;
    _scrollByPath[window.location.pathname || "/"] = window.scrollY;
  }, { passive: true });
  window.addEventListener("popstate", () => { _navKind = "pop"; });
  window.addEventListener("dumdum:navigate", () => { _navKind = "push"; });
}

function App() {
  const route = useRoute();
  const [loaded, setLoaded] = React.useState(false);

  // Al cambiar de ruta: restaurar/subir scroll + actualizar SEO del <head>.
  React.useEffect(() => {
    if (_navKind === "pop") {
      // Atrás/adelante: restaurar la posición guardada. El contenido de la
      // nueva ruta puede tardar uno o varios frames en tener altura suficiente,
      // así que reintentamos hasta clavarla (o agotar unos pocos frames).
      const y = _scrollByPath[route] || 0;
      _restoringScroll = true;
      let tries = 0;
      const tryScroll = () => {
        window.scrollTo(0, y);
        tries += 1;
        // setTimeout (no rAF): sigue corriendo aunque la pestaña esté en 2º plano.
        if (tries < 8 && Math.abs(window.scrollY - y) > 2) {
          setTimeout(tryScroll, 40);
        } else {
          _restoringScroll = false;
        }
      };
      tryScroll(); // primer intento síncrono; reintenta si el contenido aún no tiene altura
    } else {
      window.scrollTo(0, 0);
    }
    _navKind = "push"; // por defecto la siguiente navegación es "nueva"
    applyHeadMeta(matchRoute(route), route);
  }, [route]);

  const matched = matchRoute(route);
  // matched se mantiene declarado aquí por si en el futuro se necesita
  // para condicionar layout, pero ahora mismo no se consulta.

  return (
    <React.Fragment>
      {!loaded && <Loader onDone={() => setLoaded(true)} />}

      <TopBar route={route} />

      <main>
        {renderRoute(route)}
      </main>

      <Footer />
    </React.Fragment>
  );
}

function renderRoute(route) {
  const matched = matchRoute(route);
  if (matched) {
    const Comp = window[matched.component];
    if (typeof Comp === "function") return <Comp />;
  }
  return <NotFound />;
}

function NotFound() {
  window.i18n.useLang(); // re-renderiza al cambiar ES/EN (usa t() más abajo)
  return (
    <section style={{padding:'18vh var(--gutter)', textAlign:'left'}}>
      <div className="tiny muted">[404]</div>
      <h1 className="h-display" style={{marginTop:16}}>{window.i18n.t("Por aquí", "Nothing on")}<br/>{window.i18n.t("no hay carta.", "the menu here.")}</h1>
      <a href="/" className="btn red" style={{marginTop:32}}>{window.i18n.t("Volver al inicio", "Back home")} →</a>
    </section>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
