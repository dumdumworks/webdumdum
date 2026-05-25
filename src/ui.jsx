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

// ─── Sistema de idioma (ES / EN) ──────────────────────────────
// Estado global simple: se guarda en localStorage y notifica a los
// componentes suscritos para que se re-rendericen al cambiar.
const LANG_KEY = "dumdum.lang";
const _langListeners = new Set();
function getLang() {
  try { return localStorage.getItem(LANG_KEY) === "en" ? "en" : "es"; }
  catch (e) { return "es"; }
}
function setLang(l) {
  try { localStorage.setItem(LANG_KEY, l === "en" ? "en" : "es"); } catch (e) {}
  document.documentElement.lang = l;
  _langListeners.forEach((fn) => fn());
}
// Hook: devuelve el idioma actual y re-renderiza cuando cambia.
function useLang() {
  const [, force] = React.useState(0);
  React.useEffect(() => {
    const fn = () => force((n) => n + 1);
    _langListeners.add(fn);
    return () => _langListeners.delete(fn);
  }, []);
  return getLang();
}
// Helper de traducción: t(textoES, textoEN). Si falta EN, cae a ES.
function t(es, en) {
  return getLang() === "en" ? (en || es) : es;
}
// Auto-traducción de texto que viene del editor (Sveltia) en modo EN:
//  · "DOSMIL26" → "TWENTY26"  (mayúsculas o minúsculas)
//  · meses en español → inglés (Mayo → May, etc.)
const _MESES_EN = {
  "enero": "January", "febrero": "February", "marzo": "March", "abril": "April",
  "mayo": "May", "junio": "June", "julio": "July", "agosto": "August",
  "septiembre": "September", "setiembre": "September", "octubre": "October",
  "noviembre": "November", "diciembre": "December"
};
function autoLocalize(text) {
  if (getLang() !== "en" || text == null) return text;
  let out = String(text);
  // DOSMIL(num) → TWENTY(num), preservando mayúsc/minúsc del original
  out = out.replace(/dosmil/gi, (m) => (m === m.toLowerCase() ? "twenty" : "TWENTY"));
  // Meses: respeta la capitalización de la primera letra (Mayo→May, MAYO→MAY)
  out = out.replace(/\b([A-Za-zÁÉÍÓÚáéíóúÑñ]+)\b/g, (w) => {
    const en = _MESES_EN[w.toLowerCase()];
    if (!en) return w;
    if (w === w.toUpperCase()) return en.toUpperCase();
    if (w[0] === w[0].toUpperCase()) return en;
    return en.toLowerCase();
  });
  // "IVA incluido" → "VAT included" (respeta la capitalización del original)
  out = out.replace(/\bIVA\s+incluido\b/gi, (m) => {
    if (m === m.toUpperCase()) return "VAT INCLUDED";
    if (m[0] === m[0].toUpperCase()) return "VAT included";
    return "vat included";
  });
  return out;
}
// ─── Textos de la sección Eventos (editables en Sveltia → eventos.json) ──
// Lee un campo de eventos.json según idioma. En EN usa "<key>_en"; si está
// vacío, cae al español. Si eventos.json no se cargó o falta la clave,
// devuelve "" y el componente usa su texto de respaldo escrito en el código.
function ev(key) {
  const data = (typeof window !== "undefined" && window.PUBLISHED_EVENTOS) || null;
  if (!data) return "";
  if (getLang() === "en") {
    const en = data[key + "_en"];
    if (en != null && String(en).trim() !== "") return String(en);
  }
  const es = data[key];
  return es != null ? String(es) : "";
}
// Convierte el mini-markdown de los textos de Eventos en JSX:
//  · **texto**  → <strong>texto</strong>  (negrita, la del botón de Sveltia)
//  · " / "       → salto de línea <br/>     (saltos fijos de los títulos)
// Devuelve un React.Fragment con las partes. Si text está vacío, null.
function mdToJsx(text) {
  if (text == null || String(text).trim() === "") return null;
  const lines = String(text).split(/\s*\/\s*/);
  const out = [];
  lines.forEach((line, li) => {
    // Partir por **negrita** conservando los delimitadores
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    parts.forEach((part, pi) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        out.push(React.createElement("strong", { key: li + "-" + pi }, part.slice(2, -2)));
      } else if (part !== "") {
        out.push(part);
      }
    });
    if (li < lines.length - 1) out.push(React.createElement("br", { key: "br-" + li }));
  });
  return React.createElement(React.Fragment, null, out);
}
// Exponer global para que pages.jsx / app.jsx lo usen.
window.i18n = { getLang, setLang, useLang, t, autoLocalize, ev, mdToJsx };

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

// ─── Selector de idioma ES / EN ───────────────────────────────
function LangToggle() {
  const lang = useLang();
  return (
    <button
      type="button"
      className="lang-toggle"
      onClick={() => setLang(lang === "es" ? "en" : "es")}
      aria-label={lang === "es" ? "Switch to English" : "Cambiar a español"}>
      <span className={lang === "es" ? "on" : ""}>ES</span>
      <span className="sep">/</span>
      <span className={lang === "en" ? "on" : ""}>EN</span>
    </button>);

}

function TopBar({ route }) {
  const lang = useLang();
  const UBER_URL = "https://www.ubereats.com/es/store/dum-dum-%7C-chamberi/7NGxIIg1XVmNEz9mAkgI7Q?diningMode=DELIVERY";
  const SPOTIFY_URL = "https://open.spotify.com/playlist/75oqGRFz3CXErzrfBQTuVd?si=62f669c4e6674ff1";

  // Menú móvil (hamburguesa): los 9 destinos de la rejilla de la home.
  const mobileLinks = [
  { p: "/menu", label: t("La carta", "Menu") },
  { href: UBER_URL, label: "Uber Eats", ext: true },
  { href: UBER_URL, label: "Take Away", ext: true },
  { p: "/locales", label: t("Locales", "Locations") },
  { p: "/eventos", label: t("Eventos", "Events") },
  { p: "/contacto", label: t("Contacto", "Contact") },
  { href: "https://www.instagram.com/dumdum.plings", label: "Instagram", ext: true },
  { href: SPOTIFY_URL, label: "DD*Radio", ext: true },
  { href: "#", label: "DD*Mer®ch", ext: true }];

  // Nav de DESKTOP: solo los principales (sin redes/tienda).
  const deskLinks = [
  { p: "/menu", label: t("La carta", "Menu") },
  { p: "/locales", label: t("Locales", "Locations") },
  { p: "/eventos", label: t("Eventos", "Events") },
  { p: "/contacto", label: t("Contacto", "Contact") }];

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

      {/* Nav DESKTOP centrado en la página */}
      <nav className="nav nav-desktop">
        {deskLinks.map((l) =>
        <a key={l.p} href={`#${l.p}`} className={route === l.p ? "active" : ""}>
            {l.label}
          </a>
        )}
      </nav>

      {/* Derecha (desktop): estado abierto/cerrado + Reservar + idioma */}
      <div className="right">
        <span className="row gap-s">
          {est.abierto ?
          <React.Fragment><span className="dot dot-live" /> {t("Abierto hasta las", "Open until")} {est.hora}h</React.Fragment> :
          <React.Fragment><span className="dot dot-closed" /> {t("Cerrado. Nos vemos a las", "Closed. See you at")} {est.hora}h</React.Fragment>}
        </span>
        <a href="#/locales" className="topbar-reservar">{t("Reservar", "Book")} →</a>
        <LangToggle />
      </div>

      {/* Nav MÓVIL: panel desplegable con los 9 */}
      <nav className="nav nav-mobile">
        {mobileLinks.map((l, i) =>
        l.ext ?
        <a key={i} href={l.href} target="_blank" rel="noreferrer">{l.label}</a> :
        <a key={i} href={`#${l.p}`} className={route === l.p ? "active" : ""}>{l.label}</a>
        )}
      </nav>

      {/* Grupo derecho MÓVIL: idioma + Reservar permanente + hamburguesa */}
      <div className="topbar-mobile-right">
        <LangToggle />
        <a href="#/locales" className="topbar-reservar topbar-reservar-mobile">{t("Reservar", "Book")} →</a>
        <button
          className="topbar-burger"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}>
          <span /><span /><span />
        </button>
      </div>
    </header>);

}

// ─── Footer ───────────────────────────────────────────────────
function Footer() {
  const lang = useLang();
  return (
    <footer className="foot" data-screen-label="footer">
      <div className="foot-word">DUM DUM<span className="tm">™</span></div>

      <div className="foot-grid">
        <div>
          <b>Chamberí</b>
          <div>Blasco de Garay, 10</div>
          <div>28015 Madrid</div>
          <div style={{ marginTop: 8, color: 'var(--red)' }}>{t("Sin reserva", "No booking")}</div>
        </div>
        <div>
          <b>Tetuán</b>
          <div>Infanta Mercedes, 17</div>
          <div>28020 Madrid</div>
          <div style={{ marginTop: 8 }}><a href="#/locales" className="link-hover">{t("Reservar", "Book")} →</a></div>
        </div>
        <div>
          <b>{t("Horarios", "Hours")}</b>
          <div>13.00 — 15.39</div>
          <div>20.00 — 22.39</div>
          <div style={{ marginTop: 8 }}>{t("Todos los días", "Every day")}</div>
        </div>
        <div>
          <b>{t("Redes", "Social")}</b>
          <div><a href="https://www.instagram.com/dumdum.plings" target="_blank" rel="noreferrer" className="link-hover">Instagram</a></div>
          <div><a href="#" className="link-hover"></a></div>
          <div><a href="#" className="link-hover">Uber Eats</a></div>
        </div>
      </div>

      <div className="foot-bot">
        <div>© DUM DUM™ · Dumplings &amp; {t("Desobediencia", "Disobedience")} · Madrid</div>
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
    <div className={`loader loader-bare ${out ? "out" : ""}`}>
      <div className="loader-mid">
        <div className="loader-count-big">{String(pct).padStart(3, "0")}<span className="loader-pct">%</span></div>
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