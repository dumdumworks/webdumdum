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
function getRoutesTable() {
  return [
    { prefix: "/",         exact: true,  component: "Home",
      title: "DUM DUM™ — Dumplings & Desobediencia",
      desc: "Dumplings & Desobediencia en Madrid. Chamberí y Bernabéu. Todos los días 13.00–15.39 y 20.00–22.39." },
    { prefix: "/menu",     exact: false, component: "Menu",
      title: "DUM DUM™ — La carta",
      desc: "La carta de DUM DUM: dumplings que rompen las normas. Cheese Burger, Carbonara, Gamba K-Pop y más." },
    { prefix: "/locales",  exact: false, component: "Locales",
      title: "DUM DUM™ — Locales",
      desc: "Nuestros dos locales en Madrid: Chamberí (Blasco de Garay, 10) y Bernabéu (Infanta Mercedes, 17)." },
    { prefix: "/eventos",  exact: false, component: "Eventos",
      title: "DUM DUM™ — Eventos",
      desc: "Un espacio con identidad para tu evento en Madrid. 55 m², cocina abierta, hasta 35 personas." },
    { prefix: "/contacto", exact: false, component: "Contacto",
      title: "DUM DUM™ — Contacto",
      desc: "Contacta con DUM DUM. Reservas, eventos y consultas." }
    // Nota: /admin/ se sirve como carpeta estática (Sveltia CMS), no como ruta
    // de esta SPA. El _redirects de la raíz tiene una regla "/admin/* 200" antes
    // del catch-all para que Cloudflare Pages sirva los archivos de /admin/.
    // Futuras páginas: añade aquí { prefix, exact, component, title, desc }.
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

function App() {
  const route = useRoute();
  const [loaded, setLoaded] = React.useState(false);

  // Scroll arriba + actualizar título/descripción SEO al cambiar de ruta
  React.useEffect(() => {
    window.scrollTo(0, 0);
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
  return (
    <section style={{padding:'18vh var(--gutter)', textAlign:'left'}}>
      <div className="tiny muted">[404]</div>
      <h1 className="h-display" style={{marginTop:16}}>{window.i18n.t("Por aquí", "Nothing on")}<br/>{window.i18n.t("no hay carta.", "the menu here.")}</h1>
      <a href="/" className="btn red" style={{marginTop:32}}>{window.i18n.t("Volver al inicio", "Back home")} →</a>
    </section>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
