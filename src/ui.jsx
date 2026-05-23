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
// Cálculo de apertura propio (autosuficiente, no depende de pages.jsx),
// usando SIEMPRE la hora de Madrid.
function calcAperturaTopbar(tramos) {
  let min;
  try {
    const partes = new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", hour12: false
    }).formatToParts(new Date());
    const h = parseInt(partes.find((p) => p.type === "hour").value, 10);
    const m = parseInt(partes.find((p) => p.type === "minute").value, 10);
    min = (h % 24) * 60 + m;
  } catch (e) {
    const now = new Date();
    min = now.getHours() * 60 + now.getMinutes();
  }
  const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}.${String(m % 60).padStart(2, "0")}`;
  for (let i = 0; i < tramos.length; i++) {
    if (min >= tramos[i][0] && min < tramos[i][1]) {
      return { abierto: true, hora: fmt(tramos[i][1]) };
    }
  }
  for (let i = 0; i < tramos.length; i++) {
    if (min < tramos[i][0]) {
      return { abierto: false, hora: fmt(tramos[i][0]) };
    }
  }
  return { abierto: false, hora: fmt(tramos[0][0]) };
}

function TopBar({ route }) {
  const links = [
  { p: "/menu", label: "Carta" },
  { p: "/locales", label: "Locales" },
  { p: "/eventos", label: "Eventos" },
  { p: "/contacto", label: "Contacto" }];

  // Estado de apertura, recalculado cada minuto
  const TRAMOS = [[780, 939], [1200, 1359]];
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);
  const est = calcAperturaTopbar(TRAMOS);

  // Menú hamburguesa (solo móvil): abierto/cerrado
  const [menuOpen, setMenuOpen] = React.useState(false);
  // Al cambiar de página, cerramos el menú
  React.useEffect(() => { setMenuOpen(false); }, [route]);

  return (
    <header className={`topbar ${menuOpen ? "menu-open" : ""}`} data-screen-label="top-bar">
      <a href="#/" className="brand">DUM DUM<span className="brand-tm">™</span></a>
      <nav className="nav">
        {links.map((l) =>
        <a key={l.p} href={`#${l.p}`} className={route === l.p ? "active" : ""}>
            {l.label}
          </a>
        )}
      </nav>
      <div className="right">
        <span className="row gap-s">
          {est.abierto ?
          <React.Fragment><span className="dot dot-live" /> Abierto hasta las {est.hora}h</React.Fragment> :
          <React.Fragment><span className="dot dot-closed" /> Cerrado. Nos vemos a las {est.hora}h</React.Fragment>}
        </span>
      </div>
      <button
        className="topbar-burger"
        aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}>
        <span /><span /><span />
      </button>
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