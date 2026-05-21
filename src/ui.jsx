// ─────────────────────────────────────────────────────────────
// Componentes compartidos: TopBar, Footer, Loader, helpers
// ─────────────────────────────────────────────────────────────

function useRoute() {
  const [route, setRoute] = React.useState(
    window.location.hash.slice(1) || "/"
  );
  React.useEffect(() => {
    const onHash = () =>
    setRoute(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

function nav(path) {
  window.location.hash = path;
}

// ─── Top bar ──────────────────────────────────────────────────
function TopBar({ route }) {
  const links = [
  { p: "/menu", label: "Carta" },
  { p: "/locales", label: "Locales" },
  { p: "/eventos", label: "Eventos" },
  { p: "/contacto", label: "Contacto" }];

  return (
    <header className="topbar" data-screen-label="top-bar">
      <a href="#/" className="brand">DUM DUM<sup style={{ fontSize: '0.55em', marginLeft: '2px' }}>™</sup></a>
      <nav className="nav">
        {links.map((l) =>
        <a key={l.p} href={`#${l.p}`} className={route === l.p ? "active" : ""}>
            {l.label}
          </a>
        )}
      </nav>
      <div className="right">
        <span className="row gap-s">
          <span className="dot green" /> Abierto · 13.00–15.39
        </span>
      </div>
    </header>);

}

// ─── Footer ───────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="foot" data-screen-label="footer">
      <div className="foot-word">DUM DUM<span className="tm">™</span></div>

      <div className="foot-grid">
        <div>
          <b>Chamberí</b>
          <div>Blasco de Garay, 10</div>
          <div>28015 Madrid</div>
          <div style={{ marginTop: 8, color: 'var(--red)' }}>Sin reserva</div>
        </div>
        <div>
          <b>Tetuán</b>
          <div>Infanta Mercedes, 17</div>
          <div>28020 Madrid</div>
          <div style={{ marginTop: 8 }}><a href="#" className="link-hover">Reservar →</a></div>
        </div>
        <div>
          <b>Horarios</b>
          <div>13.00 — 15.39</div>
          <div>20.00 — 22.39</div>
          <div style={{ marginTop: 8 }}>Todos los días</div>
        </div>
        <div>
          <b>Redes</b>
          <div><a href="#" className="link-hover">Instagram</a></div>
          <div><a href="#" className="link-hover"></a></div>
          <div><a href="#" className="link-hover">Uber Eats</a></div>
        </div>
      </div>

      <div className="foot-bot">
        <div>© DUM DUM™ · Dumplings &amp; Desobediencia · Madrid</div>
        <div></div>
      </div>
    </footer>);

}

// ─── Loader ───────────────────────────────────────────────────
function Loader({ onDone }) {
  const [count, setCount] = React.useState(0);
  const [out, setOut] = React.useState(false);

  React.useEffect(() => {
    if (sessionStorage.getItem("dumdum.loaded")) {
      setOut(true);
      const t = setTimeout(onDone, 50);
      return () => clearTimeout(t);
    }
    let n = 0;
    const id = setInterval(() => {
      n += Math.max(1, Math.round((100 - n) / 12));
      if (n >= 100) {
        n = 100;
        clearInterval(id);
        setCount(100);
        setTimeout(() => {
          setOut(true);
          sessionStorage.setItem("dumdum.loaded", "1");
          setTimeout(onDone, 650);
        }, 360);
      } else {
        setCount(n);
      }
    }, 60);
    return () => clearInterval(id);
  }, []);

  const pct = count;
  return (
    <div className={`loader ${out ? "out" : ""}`}>
      <div className="loader-top">
        <span>DUM DUM™ · Madrid · DOSMIL24 →</span>
        <span>Specimen No. 04 / 26</span>
      </div>

      <div className="loader-mid">
        <div className="loader-word">DUMPLINGS</div>
        <div className="loader-word"><span className="amp">&amp;</span></div>
        <div className="loader-word">DESOBEDIENCIA</div>
      </div>

      <div>
        <div className="loader-bar"><i style={{ width: pct + "%" }} /></div>
        <div className="loader-bot">
          <span>Cargando carta · {String(pct).padStart(3, "0")}</span>
          <span>Sin reserva · 13.00 / 20.00</span>
        </div>
      </div>
    </div>);

}

// ─── Reveal-on-scroll wrapper ─────────────────────────────────
function Reveal({ children, delay = 0 }) {
  const ref = React.useRef(null);
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => setShown(true), delay);
            io.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${shown ? "in" : ""}`}>
      {children}
    </div>);

}

// ─── Logo renderer (preset SVG, uploaded img, file path, or null) ─
function DishLogo({ logo }) {
  if (!logo) return null;
  // uploaded image (data URL)
  if (typeof logo === "string" && logo.startsWith("data:")) {
    return (
      <div className="logo-slot">
        <img src={logo} alt="" />
      </div>);

  }
  // file path (e.g. "img/dumplings/gamba-label.svg")
  if (typeof logo === "string" && /^(img|assets|\/)/.test(logo)) {
    const isSvg = /\.svg(\?|$)/i.test(logo);
    return (
      <div className={`logo-slot ${isSvg ? "is-wide" : ""}`}>
        <img src={logo} alt="" />
      </div>);

  }
  const preset = window.DumDumData.PRESET_LOGOS[logo];
  if (preset) {
    return (
      <div className="logo-slot" dangerouslySetInnerHTML={{ __html: preset }} />);

  }
  return null;
}

Object.assign(window, { useRoute, nav, TopBar, Footer, Loader, Reveal, DishLogo });