// ─────────────────────────────────────────────────────────────
// Componentes compartidos: TopBar, Footer, Loader, helpers
// ─────────────────────────────────────────────────────────────

function useRoute() {
  const [route, setRoute] = React.useState(
    window.location.pathname || "/"
  );
  React.useEffect(() => {
    const onNav = () =>
    setRoute(window.location.pathname || "/");
    // popstate cubre el botón atrás/adelante del navegador.
    window.addEventListener("popstate", onNav);
    // evento propio que dispara nav() al cambiar de ruta sin recargar.
    window.addEventListener("dumdum:navigate", onNav);
    return () => {
      window.removeEventListener("popstate", onNav);
      window.removeEventListener("dumdum:navigate", onNav);
    };
  }, []);
  return route;
}

function nav(path) {
  // Navegación sin recargar (URLs limpias, sin #).
  if (window.location.pathname !== path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("dumdum:navigate"));
  }
}

// Interceptor global: los clics en enlaces internos (href que empieza por "/")
// navegan sin recargar la página. Los externos (http, tel, mailto) y los que
// abren en pestaña nueva se dejan pasar con normalidad.
if (typeof window !== "undefined" && !window.__dumdumLinkHandler) {
  window.__dumdumLinkHandler = true;
  document.addEventListener("click", function (e) {
    // Respetar cmd/ctrl/click central (abrir en pestaña nueva).
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href) return;
    // Solo interceptar rutas internas absolutas ("/algo"), no externas ni anclas.
    if (href.charAt(0) !== "/" || href.indexOf("//") === 0) return;
    if (a.target === "_blank") return;
    e.preventDefault();
    nav(href);
  });
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
// Convierte una línea de mini-markdown en partes JSX inline:
//  · **texto**  → <strong>texto</strong>  (negrita, la del botón de Sveltia)
//  · " / "       → salto de línea <br/>     (saltos fijos dentro de un título)
function mdInline(text, keyPrefix) {
  const kp = keyPrefix == null ? "" : keyPrefix + "-";
  const lines = String(text).split(/\s*\/\s*/);
  const out = [];
  lines.forEach((line, li) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    parts.forEach((part, pi) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        out.push(React.createElement("strong", { key: kp + li + "-" + pi }, part.slice(2, -2)));
      } else if (part !== "") {
        out.push(part);
      }
    });
    if (li < lines.length - 1) out.push(React.createElement("br", { key: kp + "br-" + li }));
  });
  return out;
}
// Texto inline (títulos): devuelve un Fragment. Si vacío, null.
function mdToJsx(text) {
  if (text == null || String(text).trim() === "") return null;
  return React.createElement(React.Fragment, null, mdInline(text, "t"));
}
// Párrafos (campo único de Sveltia): separa por LÍNEAS EN BLANCO y devuelve
// un array de <p>, cada uno con su negrita. Así escribes todo seguido y la
// web reparte los párrafos sola, sin que calcules saltos. Si vacío, null.
//  · pProps: props base aplicadas a cada <p> (className, etc.)
//  · gap: separación (px) entre párrafos a partir del segundo (def. 16)
function mdParas(text, pProps, gap) {
  if (text == null || String(text).trim() === "") return null;
  const sep = (gap == null) ? 16 : gap;
  // Normalizar saltos y partir por una o más líneas en blanco.
  const blocks = String(text)
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n+/)
    .map((b) => b.trim())
    .filter((b) => b !== "");
  if (blocks.length === 0) return null;
  return blocks.map((block, bi) => {
    const base = Object.assign({ key: "p-" + bi }, pProps || {});
    // El primer párrafo conserva las props tal cual; los siguientes reciben
    // separación superior (replica el marginTop:16 que había entre párrafos).
    if (bi > 0) {
      base.style = Object.assign({}, (pProps && pProps.style) || {}, { marginTop: sep });
    }
    return React.createElement("p", base, mdInline(block, "b" + bi));
  });
}
// Exponer global para que pages.jsx / app.jsx lo usen.
window.i18n = { getLang, setLang, useLang, t, autoLocalize, ev, mdToJsx, mdParas };

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
// Componente DishWidget: monta el widget de reservas de DISH dentro de un
// contenedor. DISH carga su widget.js, lee la configuración global _hors y
// rellena el div con el iframe del widget. Cada apertura se monta limpia.
function DishWidget() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!ref.current) return;
    const tagid = "hors-hydra-27342526-f07a-4354-bec7-c7b0ce5d7615";
    // Crear el div contenedor con el ID que DISH espera
    const div = document.createElement("div");
    div.id = tagid;
    ref.current.appendChild(div);
    // Configuración global del widget: ID + colores DUM DUM
    window._hors = [
      ["eid", "hydra-27342526-f07a-4354-bec7-c7b0ce5d7615"],
      ["tagid", tagid],
      ["width", "100%"],
      ["height", ""],
      ["foregroundColor", "#ff001e"],          // rojo DUM DUM para textos clave
      ["backgroundColor", "#fffaf3"],          // crema DUM DUM
      ["linkColor", "#ff001e"],
      ["errorColor", "#ff001e"],
      ["primaryButtonForegroundColor", "#fffaf3"],
      ["primaryButtonBackgroundColor", "#ff001e"],
      ["secondaryButtonForegroundColor", "#ff001e"],
      ["secondaryButtonBackgroundColor", "#fffaf3"]
    ];
    // Cargar el script de DISH
    const s = document.createElement("script");
    s.src = "https://reservation.dish.co/widget.js";
    s.async = true;
    document.body.appendChild(s);
    return () => {
      // limpiar al desmontar (al cerrar el modal)
      try { document.body.removeChild(s); } catch (e) {}
      if (ref.current) ref.current.innerHTML = "";
    };
  }, []);
  return <div ref={ref} className="dish-widget-host" />;
}

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
  // Take Away ahora apunta al mismo destino que Uber Eats.
  const TAKEAWAY_URL = UBER_URL;
  const SPOTIFY_URL = "https://open.spotify.com/playlist/75oqGRFz3CXErzrfBQTuVd?si=62f669c4e6674ff1";

  // Menú móvil (hamburguesa): los 9 destinos de la rejilla de la home.
  const mobileLinks = [
  { p: "/menu", label: t("La carta", "Menu") },
  { href: UBER_URL, label: "Uber Eats", ext: true },
  { href: TAKEAWAY_URL, label: "Take Away", ext: true },
  { p: "/locales", label: t("Locales", "Locations") },
  { p: "/eventos", label: t("Eventos", "Events") },
  { p: "/contacto", label: t("Contacto", "Contact") },
  { href: "https://www.instagram.com/dumdum.plings", label: "Instagram", ext: true },
  { href: SPOTIFY_URL, label: "DD*Radio", ext: true }];

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

  // Modal "Pide ya" (Take Away | Uber Eats)
  const [pideOpen, setPideOpen] = React.useState(false);
  React.useEffect(() => { setPideOpen(false); }, [route]);

  // Modal de RESERVAS (DISH). Lo abren TODOS los botones "Reservar" de la web
  // disparando el evento global "dumdum:open-reserve". Se cierra al pinchar
  // fuera, al pulsar la X, o al cambiar de página.
  const [reserveOpen, setReserveOpen] = React.useState(false);
  React.useEffect(() => { setReserveOpen(false); }, [route]);
  React.useEffect(() => {
    const handler = () => setReserveOpen(true);
    window.addEventListener("dumdum:open-reserve", handler);
    return () => window.removeEventListener("dumdum:open-reserve", handler);
  }, []);
  // Cerrar modales (reservas y pide ya) con la tecla ESC.
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { setReserveOpen(false); setPideOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  // En la página de menú (a la que se llega por el QR de las mesas) ocultamos
  // "Pide ya" SOLO en móvil, para no inducir a pedir online estando en mesa.
  // Detecta la página de menú de forma tolerante (con o sin barra final).
  const enMenu = /^\/menu\/?$/.test(route);

  // FAB "Pide ya" (solo móvil): arrastrable. Posición null = esquina inferior
  // derecha por defecto; al arrastrar se guarda {x,y}. Distingue tap de drag.
  const [fabPos, setFabPos] = React.useState(null);
  const fabRef = React.useRef(null);
  const fabDrag = React.useRef({ active: false, moved: false, dx: 0, dy: 0, sx: 0, sy: 0 });
  const onFabDown = (e) => {
    const el = fabRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    fabDrag.current = { active: true, moved: false, dx: e.clientX - r.left, dy: e.clientY - r.top, sx: e.clientX, sy: e.clientY };
    el.setPointerCapture(e.pointerId);
  };
  const onFabMove = (e) => {
    const d = fabDrag.current; if (!d.active) return;
    // solo cuenta como arrastre si se mueve más de 6px (un tap normal no llega)
    if (Math.abs(e.clientX - d.sx) > 6 || Math.abs(e.clientY - d.sy) > 6) d.moved = true;
    if (!d.moved) return;
    const nx = e.clientX - d.dx, ny = e.clientY - d.dy;
    const el = fabRef.current; const w = el ? el.offsetWidth : 56; const h = el ? el.offsetHeight : 56;
    const maxX = window.innerWidth - w - 8, maxY = window.innerHeight - h - 8;
    setFabPos({ x: Math.max(8, Math.min(nx, maxX)), y: Math.max(8, Math.min(ny, maxY)) });
  };
  const onFabUp = (e) => {
    const d = fabDrag.current; d.active = false;
    const el = fabRef.current; if (el) el.releasePointerCapture(e.pointerId);
    if (!d.moved) setPideOpen(true); // fue un tap, no un arrastre → abrir modal
  };
  // El FAB pierde opacidad mientras se hace scroll y la recupera al parar.
  const [fabScrolling, setFabScrolling] = React.useState(false);
  React.useEffect(() => {
    let timer = null;
    const onScroll = () => {
      setFabScrolling(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setFabScrolling(false), 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (timer) clearTimeout(timer); };
  }, []);

  return (
    <React.Fragment>
    <header className={`topbar ${menuOpen ? "menu-open" : ""}`} data-screen-label="top-bar">
      <div className="topbar-left">
        <a href="/" className="brand">DUM DUM<span className="brand-tm">™</span></a>

        {/* Nav DESKTOP a la izquierda, junto al logo */}
        <nav className="nav nav-desktop">
          {deskLinks.map((l) =>
          <a key={l.p} href={l.p} className={route === l.p ? "active" : ""}>
              {l.label}
            </a>
          )}
        </nav>
      </div>

      {/* Derecha (desktop): estado abierto/cerrado + Reservar + idioma */}
      <div className="right">
        <span className="row gap-s topbar-status">
          {est.abierto ?
          <React.Fragment><span className="dot dot-live" /> {t("Abierto hasta las", "Open until")} {est.hora}h</React.Fragment> :
          <React.Fragment><span className="dot dot-closed" /> {t("Cerrado. Nos vemos a las", "Closed. See you at")} {est.hora}h</React.Fragment>}
        </span>
        <button type="button" className="topbar-reservar" onClick={() => setReserveOpen(true)}>{t("Reservar", "Book")} →</button>
        <button type="button" className="topbar-pide" onClick={() => setPideOpen(true)}>{t("Pide ya!", "Order now!")} →</button>
        <LangToggle />
      </div>

      {/* Nav MÓVIL: panel desplegable con los 9 */}
      <nav className="nav nav-mobile">
        {mobileLinks.map((l, i) =>
        l.ext ?
        <a key={i} href={l.href} target="_blank" rel="noreferrer">{l.label}</a> :
        <a key={i} href={l.p} className={route === l.p ? "active" : ""}>{l.label}</a>
        )}
      </nav>

      {/* Grupo derecho MÓVIL: idioma + Reservar permanente + hamburguesa */}
      <div className="topbar-mobile-right">
        <LangToggle />
        <button type="button" className="topbar-reservar topbar-reservar-mobile" onClick={() => setReserveOpen(true)}>{t("Reservar", "Book")} →</button>
        <button
          className="topbar-burger"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}>
          <span /><span /><span />
        </button>
      </div>
    </header>

    {!enMenu &&
    <button
      ref={fabRef}
      type="button"
      className={"pide-fab" + (fabScrolling ? " is-scrolling" : "")}
      onPointerDown={onFabDown}
      onPointerMove={onFabMove}
      onPointerUp={onFabUp}
      style={fabPos ? { left: fabPos.x + "px", top: fabPos.y + "px", right: "auto", bottom: "auto" } : undefined}
      aria-label={t("Pide ya", "Order now")}>
      {t("Pide ya!", "Order now!")} →
    </button>
    }

    {pideOpen &&
    <div className="pide-overlay" onClick={() => setPideOpen(false)}>
      <div className="pide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pide-closebar">
          <button className="pide-close" aria-label="Cerrar" onClick={() => setPideOpen(false)}>×</button>
        </div>
        <h3 className="pide-title">{t("¿Cómo quieres pedir?", "How would you like to order?")}</h3>
        <div className="pide-options">
          <a className="pide-card" href={TAKEAWAY_URL} target="_blank" rel="noreferrer">
            <span className="pide-card-label">Take Away</span>
            <span className="pide-card-sub">{t("Recoge en el local", "Pick up at the spot")}</span>
          </a>
          <a className="pide-card" href={UBER_URL} target="_blank" rel="noreferrer">
            <span className="pide-card-label">Uber Eats</span>
            <span className="pide-card-sub">{t("A domicilio", "Delivery")}</span>
          </a>
        </div>
      </div>
    </div>
    }

    {reserveOpen &&
    <div className="alerg-overlay" onClick={() => setReserveOpen(false)}>
      <div className="alerg-modal reserve-modal" onClick={(e) => e.stopPropagation()}>
        <div className="alerg-closebar">
          <button className="alerg-close" aria-label="Cerrar" onClick={() => setReserveOpen(false)}>×</button>
        </div>
        <div className="alerg-scroll">
          <h3 className="alerg-title">{t("A reservar mesa", "Let's book you a table!")}</h3>
          <p className="alerg-intro">{lang === "es"
            ? <React.Fragment>Solo por si: <strong>sólo hacemos reservas en el local de Bernabéu</strong> [Infanta Mercedes, 17] 🙃</React.Fragment>
            : <React.Fragment>Just so you know: <strong>we only take reservations at our Bernabéu spot</strong>, Infanta Mercedes, 17.</React.Fragment>}</p>
          <hr className="alerg-sep" />
          <div className="reserve-widget-wrap">
            <DishWidget />
          </div>
          <hr className="alerg-sep" />
          <h3 className="alerg-title">{t("*Un tema!", "*One thing!")}</h3>
          <p className="alerg-intro">{lang === "es"
            ? <React.Fragment>Si reservas a las <strong>15:30 o 22:30</strong>, no apures mucho con la hora, que <strong>a y 39 cerramos la cocina</strong> y os queremos dar de comer 😉</React.Fragment>
            : <React.Fragment>If you book at <strong>3:30pm or 10:30pm</strong>, don't cut it too close: <strong>the kitchen closes at :39</strong> and we really want to feed you 😉</React.Fragment>}</p>
        </div>
      </div>
    </div>
    }
    </React.Fragment>);

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
          <b>Bernabéu</b>
          <div>Infanta Mercedes, 17</div>
          <div>28020 Madrid</div>
          <div style={{ marginTop: 8 }}><a href="#" className="link-hover" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event("dumdum:open-reserve")); }}>{t("Reservar", "Book")} →</a></div>
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