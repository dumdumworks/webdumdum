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
      desc: "Dumplings & Desobediencia en Madrid. Chamberí y Tetuán. Todos los días 13.00–15.39 y 20.00–22.39." },
    { prefix: "/menu",     exact: false, component: "Menu",
      title: "DUM DUM™ — La carta",
      desc: "La carta de DUM DUM: dumplings que rompen las normas. Cheese Burger, Carbonara, Gamba K-Pop y más." },
    { prefix: "/locales",  exact: false, component: "Locales",
      title: "DUM DUM™ — Locales",
      desc: "Nuestros dos locales en Madrid: Chamberí (Blasco de Garay, 10) y Tetuán (Infanta Mercedes, 17)." },
    { prefix: "/eventos",  exact: false, component: "Eventos",
      title: "DUM DUM™ — Eventos",
      desc: "Un espacio con identidad para tu evento en Madrid. 55 m², cocina abierta, hasta 35 personas." },
    { prefix: "/contacto", exact: false, component: "Contacto",
      title: "DUM DUM™ — Contacto",
      desc: "Contacta con DUM DUM. Reservas, eventos y consultas." },
    { prefix: "/admin",    exact: false, component: "Admin",
      title: "DUM DUM™ — Admin", desc: "" }
    // Futuras páginas: añade aquí { prefix, exact, component, title, desc }.
  ];
}

// Actualiza <title> y <meta name="description"> según la ruta (SEO por página).
function applyHeadMeta(matched) {
  if (typeof document === "undefined") return;
  const def = "DUM DUM™ — Dumplings & Desobediencia";
  document.title = (matched && matched.title) ? matched.title : def;
  if (matched && matched.desc != null) {
    let m = document.querySelector('meta[name="description"]');
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute("name", "description");
      document.head.appendChild(m);
    }
    m.setAttribute("content", matched.desc);
  }
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
    applyHeadMeta(matchRoute(route));
  }, [route]);

  const matched = matchRoute(route);
  const isAdmin = !!matched && matched.component === "Admin";

  return (
    <React.Fragment>
      {!loaded && <Loader onDone={() => setLoaded(true)} />}

      {!isAdmin && <TopBar route={route} />}

      <main>
        {renderRoute(route)}
      </main>

      {!isAdmin && <Footer />}
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
