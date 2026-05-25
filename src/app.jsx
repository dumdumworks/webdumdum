// ─────────────────────────────────────────────────────────────
// App root: router por hash + loader inicial
// ─────────────────────────────────────────────────────────────

function App() {
  const route = useRoute();
  const [loaded, setLoaded] = React.useState(false);

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  // En /admin no se muestra el chrome público (topbar + footer)
  const isAdmin = route.startsWith("/admin");

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
  if (route === "/" || route === "") return <Home />;
  if (route.startsWith("/menu")) return <Menu />;
  if (route.startsWith("/locales")) return <Locales />;
  if (route.startsWith("/eventos")) return <Eventos />;
  if (route.startsWith("/contacto")) return <Contacto />;
  if (route.startsWith("/admin")) return <Admin />;
  return <NotFound />;
}

function NotFound() {
  return (
    <section style={{padding:'18vh var(--gutter)', textAlign:'left'}}>
      <div className="tiny muted">[404]</div>
      <h1 className="h-display" style={{marginTop:16}}>{window.i18n.t("Por aquí", "Nothing on")}<br/>{window.i18n.t("no hay carta.", "the menu here.")}</h1>
      <a href="#/" className="btn red" style={{marginTop:32}}>{window.i18n.t("Volver al inicio", "Back home")} →</a>
    </section>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
