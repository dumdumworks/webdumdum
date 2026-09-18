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
    // Fijar el título ANTES de pushState: la "medición mejorada" de GA4 registra
    // la vista al cambiar el historial, y así toma el título de la página NUEVA
    // (no el de la anterior). applyHeadMeta lo vuelve a aplicar después (idempotente).
    try {
      const seo = window.__ROUTES_SEO || [];
      let clean = String(path).split("?")[0].split("#")[0];
      if (clean.length > 1 && clean.charAt(clean.length - 1) === "/") clean = clean.slice(0, -1);
      for (let i = 0; i < seo.length; i++) {
        const r = seo[i];
        const hit = r.p === "/" ? (clean === "/") : (clean === r.p || clean.indexOf(r.p + "/") === 0);
        if (hit) { document.title = r.t; break; }
      }
    } catch (e) {}
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
    // Las rutas que ya son páginas HTML (build.mjs las lista en __RUTAS_HTML)
    // no son de esta SPA: se cargan enteras, como cualquier página normal.
    var limpia = href.split("?")[0].split("#")[0];
    var estaticas = window.__RUTAS_HTML || [];
    for (var i = 0; i < estaticas.length; i++) {
      if (limpia === estaticas[i] || limpia.indexOf(estaticas[i] + "/") === 0) return;
    }
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
  // Salto de línea SOLO en " / " (barra con espacio a ambos lados). Así una
  // URL ("https://…"), "c/ Blasco de Garay" o "y/o" NO se parten por accidente.
  const lines = String(text).split(/\s+\/\s+/);
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
// Sanea HTML "inline" de confianza limitada (p. ej. el disclaimer editable):
// deja SOLO un puñado de etiquetas de formato sin atributos y descarta todo lo
// demás (scripts, <img onerror>, on*, etc.). Usa el parser del navegador —no
// regex— para no dejar huecos. Devuelve una cadena HTML segura.
// NOTA: hoy el disclaimer NO es editable en Sveltia (viene del código), por eso
// este saneador con allowlist es suficiente. Si en el futuro el disclaimer pasa
// a ser un campo editable en el CMS (entrada no confiable de verdad), conviene
// migrar a DOMPurify en lugar de mantener esta allowlist a mano.
const _ALLOWED_INLINE_TAGS = { STRONG: 1, B: 1, EM: 1, I: 1, BR: 1, SPAN: 1 };
function sanitizeInlineHTML(html) {
  if (html == null) return "";
  try {
    const tpl = document.createElement("template");
    tpl.innerHTML = String(html);
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 1) { // Element
          if (!_ALLOWED_INLINE_TAGS[child.tagName]) {
            // Etiqueta no permitida → la sustituimos por su texto (inerte).
            child.replaceWith(document.createTextNode(child.textContent || ""));
            return;
          }
          // Quitar TODOS los atributos (href, style, on*, etc.).
          Array.from(child.attributes).forEach((a) => child.removeAttribute(a.name));
          walk(child);
        } else if (child.nodeType !== 3) {
          // Comentarios y demás nodos: fuera.
          child.remove();
        }
      });
    };
    walk(tpl.content);
    return tpl.innerHTML;
  } catch (e) {
    // Ante cualquier fallo, degradar a texto plano (nunca HTML crudo).
    return String(html).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
  }
}
// Exponer global para que pages.jsx / app.jsx lo usen.
window.i18n = { getLang, setLang, useLang, t, autoLocalize, ev, mdToJsx, mdParas, sanitizeInlineHTML };

// ─── Focus trap para modales/lightbox (accesibilidad) ────────
// Devuelve un ref para el contenedor del diálogo. Cuando `active` es true:
//  · mueve el foco al primer elemento enfocable al abrir,
//  · atrapa Tab/Shift+Tab dentro del diálogo,
//  · restaura el foco al elemento que lo tenía al cerrar.
// El cierre por Esc y por clic en el overlay se mantiene en cada componente.
function useFocusTrap(active) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;
    const prevFocused = document.activeElement;
    const SEL = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';
    const focusables = () =>
      Array.prototype.slice.call(container.querySelectorAll(SEL))
        .filter((el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement);
    const first = focusables()[0];
    if (first) { try { first.focus(); } catch (e) {} }
    const onKey = (e) => {
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) { e.preventDefault(); return; }
      const firstEl = items[0], lastEl = items[items.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === firstEl || !container.contains(document.activeElement)) {
          e.preventDefault(); lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl || !container.contains(document.activeElement)) {
          e.preventDefault(); firstEl.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      if (prevFocused && prevFocused.focus) { try { prevFocused.focus(); } catch (e) {} }
    };
  }, [active]);
  return ref;
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

// ─── Selector de idioma ES / EN ───────────────────────────────
// Componente DishWidget: monta el widget de reservas de DISH dentro de un
// contenedor. DISH carga su widget.js, lee la configuración global _hors y
// rellena el div con el iframe del widget. Cada apertura se monta limpia.
function DishWidget({ eid }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!ref.current) return;
    const tagid = "hors-" + eid;
    // Crear el div contenedor con el ID que DISH espera
    const div = document.createElement("div");
    div.id = tagid;
    ref.current.appendChild(div);
    // Configuración global del widget: ID + colores DUM DUM
    window._hors = [
      ["eid", eid],
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
  }, [eid]);
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
  // Dos tiendas en Uber Eats, una por local.
  const UBER_CHAMBERI = "https://www.ubereats.com/es/store/dum-dum-%7C-chamberi/7NGxIIg1XVmNEz9mAkgI7Q?diningMode=DELIVERY&ps=1&sc=SEARCH_SUGGESTION";
  const UBER_BERNABEU = "https://www.ubereats.com/es/store/dum-dum-%7C-bernabeu/y9O2ciM5WRm9gGfszt8UDA?diningMode=DELIVERY&ps=1&sc=SEARCH_SUGGESTION";
  // El enlace del menú móvil sigue apuntando a Chamberí.
  const UBER_URL = UBER_CHAMBERI;
  // Take Away apunta a la tienda online de Square.
  // Glovo tiene UNA sola tienda para todo Madrid, así que no hay enlace por
  // local como en Uber Eats. El reparto sale igualmente del local más cercano a
  // la dirección del cliente: por eso la tarjeta muestra el local elegido, aunque
  // el enlace sea el mismo para los dos.
  const GLOVO_URL = "https://glovoapp.com/es/es/madrid/stores/dum-dum-madrid";
  const TAKEAWAY_URL = "https://dum-dumplings.square.site/";
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

  // Modal "Pide ya" (Recoger | Domicilio). Paso "inicio" = elegir método;
  // paso "domicilio" = elegir local para Uber Eats.
  const [pideOpen, setPideOpen] = React.useState(false);
  const [pideStep, setPideStep] = React.useState("inicio");
  // Local elegido en el paso "domicilio", para saber a qué tienda de Uber Eats
  // lleva el paso "plataforma".
  const [pideLocal, setPideLocal] = React.useState(null);
  const nombreLocalPide = pideLocal === "bernabeu" ? "Bernabéu" : "Chamberí";
  React.useEffect(() => { setPideOpen(false); }, [route]);
  // Abrir el modal: por defecto empieza en "inicio"; se puede pedir otro paso.
  // El local se limpia en cada apertura, para no arrastrar el de la vez anterior.
  const openPide = (step) => { setPideLocal(null); setPideStep(step || "inicio"); setPideOpen(true); };
  // Lo abren TODOS los botones "Pide ya" de la web (incluido el de la home)
  // disparando el evento global "dumdum:open-pide". Si el evento trae
  // detail.step = "domicilio", abre directo en el selector de local.
  React.useEffect(() => {
    const handler = (e) => openPide(e && e.detail && e.detail.step ? e.detail.step : "inicio");
    window.addEventListener("dumdum:open-pide", handler);
    return () => window.removeEventListener("dumdum:open-pide", handler);
  }, []);

  // Modal de RESERVAS (DISH). Lo abren TODOS los botones "Reservar" de la web
  // disparando el evento global "dumdum:open-reserve". Se cierra al pinchar
  // fuera, al pulsar la X, o al cambiar de página.
  const [reserveOpen, setReserveOpen] = React.useState(false);
  // Local elegido: null = mostrar selector "¿En qué local?"; si no, el objeto del local.
  const [reserveLocal, setReserveLocal] = React.useState(null);
  // Cambia en cada apertura para forzar que el widget de DISH se reconstruya de cero.
  const [reserveKey, setReserveKey] = React.useState(0);
  // Cierra y limpia, para que la próxima apertura empiece de cero.
  const closeReserve = React.useCallback(() => { setReserveOpen(false); setReserveLocal(null); }, []);
  React.useEffect(() => { closeReserve(); }, [route]);
  React.useEffect(() => {
    const handler = (e) => {
      const local = e && e.detail && e.detail.local ? e.detail.local : null;
      setReserveLocal(local);
      setReserveKey((k) => k + 1);
      setReserveOpen(true);
    };
    window.addEventListener("dumdum:open-reserve", handler);
    return () => window.removeEventListener("dumdum:open-reserve", handler);
  }, []);
  // Cerrar modales (reservas y pide ya) con la tecla ESC.
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { closeReserve(); setPideOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  // En la página de menú (a la que se llega por el QR de las mesas) ocultamos
  // "Pide ya" SOLO en móvil, para no inducir a pedir online estando en mesa.
  // Detecta la página de menú de forma tolerante (con o sin barra final).
  const enMenu = /^\/menu\/?$/.test(route);

  // Focus trap (accesibilidad) para los tres modales de la topbar.
  const pideTrapRef = useFocusTrap(pideOpen);
  const reserveSelTrapRef = useFocusTrap(reserveOpen && !reserveLocal);
  const reserveDishTrapRef = useFocusTrap(reserveOpen && !!reserveLocal);

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
    if (!d.moved) openPide("inicio"); // fue un tap, no un arrastre → abrir modal
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
        <button type="button" className="topbar-pide" onClick={() => openPide("inicio")}>{t("Pide ya!", "Order now!")} →</button>
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

    {/* Se desmonta con cualquiera de las dos ventanas abierta: los overlays solo
        tiñen al 40%, así que si no, el botón se sigue intuyendo por debajo.
        Mismo criterio que el flotante de alérgenos de la carta. */}
    {!enMenu && !pideOpen && !reserveOpen &&
    <button
      ref={fabRef}
      type="button"
      className={"fab pide-fab" + (fabScrolling ? " is-scrolling" : "")}
      onPointerDown={onFabDown}
      onPointerMove={onFabMove}
      onPointerUp={onFabUp}
      style={fabPos ? { left: fabPos.x + "px", top: fabPos.y + "px", right: "auto", bottom: "auto" } : undefined}
      aria-label={t("Pide ya", "Order now")}>
      {/* Bolsa de pedido, gemela del icono del flotante de alérgenos. Dos
          ajustes para que sean del mismo sistema y no dos dibujos sueltos:
          · llena la MISMA caja óptica que el círculo del otro (~15x15 dentro
            del viewBox de 24), o el hueco hasta la palabra no se lee igual;
          · trazo de 1.45 y no 1.6, porque aquí va claro sobre negro y por
            irradiación se percibe más grueso que el rojo sobre crema. */}
      <span className="fab-ico" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.9 7.6h16.2l-1.1 12a1.6 1.6 0 0 1-1.6 1.4H6.6a1.6 1.6 0 0 1-1.6-1.4L3.9 7.6Z" />
          <path d="M8.7 7.6V6a3.3 3.3 0 0 1 6.6 0v1.6" />
        </svg>
      </span>
      <span>{t("Pide ya!", "Order now!")}</span>
    </button>
    }

    {pideOpen &&
    <div className="pide-overlay" onClick={() => setPideOpen(false)}>
      <div className="pide-modal" onClick={(e) => e.stopPropagation()}
           ref={pideTrapRef} role="dialog" aria-modal="true"
           aria-label={t("Cómo quieres pedir", "How would you like to order")}>
        <div className="pide-closebar">
          <button className="pide-close" aria-label="Cerrar" onClick={() => setPideOpen(false)}>×</button>
        </div>
        {pideStep === "inicio" ?
        <React.Fragment>
          <h3 className="pide-title">{t("¿Cómo quieres pedir?", "How would you like to order?")}</h3>
          <div className="pide-options">
            <a className="pide-card" href={TAKEAWAY_URL} target="_blank" rel="noreferrer">
              <span className="pide-card-label">{t("Recoger", "Pickup")}</span>
              <span className="pide-card-sub">{t("te ahorras el envío", "skip the delivery fee")}</span>
            </a>
            <button type="button" className="pide-card" onClick={() => setPideStep("domicilio")}>
              <span className="pide-card-label">{t("Domicilio", "Delivery")}</span>
              <span className="pide-card-sub">{t("Uber Eats o Glovo", "Uber Eats or Glovo")}</span>
            </button>
          </div>
        </React.Fragment> :
        pideStep === "domicilio" ?
        <React.Fragment>
          <h3 className="pide-title">{t("¿Desde qué local?", "From which spot?")}</h3>
          <div className="pide-options">
            <button type="button" className="pide-card"
              onClick={() => { setPideLocal("chamberi"); setPideStep("plataforma"); }}>
              <span className="pide-card-label">Chamberí</span>
              <span className="pide-card-sub">c/ Blasco de Garay, 10</span>
            </button>
            <button type="button" className="pide-card"
              onClick={() => { setPideLocal("bernabeu"); setPideStep("plataforma"); }}>
              <span className="pide-card-label">Bernabéu</span>
              <span className="pide-card-sub">c/ Infanta Mercedes, 17</span>
            </button>
          </div>
          <button type="button" className="pide-volver" onClick={() => setPideStep("inicio")}>
            ← {t("Volver", "Back")}
          </button>
        </React.Fragment> :
        <React.Fragment>
          <h3 className="pide-title">{t("¿Con qué app?", "Which app?")}</h3>
          <div className="pide-options">
            {/* Las dos tarjetas confirman el local elegido. En Uber Eats lleva a
                su tienda; en Glovo el reparto sale igualmente del local más
                cercano al cliente, así que en la práctica coincide. */}
            <a className="pide-card" href={pideLocal === "bernabeu" ? UBER_BERNABEU : UBER_CHAMBERI}
              target="_blank" rel="noreferrer">
              <span className="pide-card-label">Uber Eats</span>
              <span className="pide-card-sub">{nombreLocalPide}</span>
            </a>
            <a className="pide-card" href={GLOVO_URL} target="_blank" rel="noreferrer">
              <span className="pide-card-label">Glovo</span>
              <span className="pide-card-sub">{nombreLocalPide}</span>
            </a>
          </div>
          <button type="button" className="pide-volver" onClick={() => setPideStep("domicilio")}>
            ← {t("Volver", "Back")}
          </button>
        </React.Fragment>
        }
      </div>
    </div>
    }

    {reserveOpen && !reserveLocal &&
    <div className="pide-overlay" onClick={() => closeReserve()}>
      <div className="pide-modal" onClick={(e) => e.stopPropagation()}
           ref={reserveSelTrapRef} role="dialog" aria-modal="true"
           aria-label={t("En qué local reservar", "Which location to book")}>
        <div className="pide-closebar">
          <button className="pide-close" aria-label="Cerrar" onClick={() => closeReserve()}>×</button>
        </div>
        <h3 className="pide-title">{t("¿En qué local?", "Which location?")}</h3>
        <div className="pide-options">
          <button type="button" className="pide-card" onClick={() => setReserveLocal(window.DUMDUM_LOCALES?.chamberi)}>
            <span className="pide-card-label">Chamberí</span>
            <span className="pide-card-sub">c/ Blasco de Garay, 10</span>
          </button>
          <button type="button" className="pide-card" onClick={() => setReserveLocal(window.DUMDUM_LOCALES?.bernabeu)}>
            <span className="pide-card-label">Bernabéu</span>
            <span className="pide-card-sub">c/ Infanta Mercedes, 17</span>
          </button>
        </div>
      </div>
    </div>
    }
    {reserveOpen && reserveLocal &&
    <div className="alerg-overlay" onClick={() => closeReserve()}>
      <div className="alerg-modal reserve-modal" onClick={(e) => e.stopPropagation()}
           ref={reserveDishTrapRef} role="dialog" aria-modal="true"
           aria-label={t("Reservar mesa", "Book a table")}>
        <div className="alerg-closebar">
          <button className="alerg-close" aria-label="Cerrar" onClick={() => closeReserve()}>×</button>
        </div>
        <div className="alerg-scroll">
          <h3 className="alerg-title">{t("A reservar mesa", "Let's book you a table!")} · {reserveLocal.nombre}</h3>
          <button
            type="button"
            onClick={() => setReserveLocal(null)}
            style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontFamily: "\"JetBrains Mono\", ui-monospace, monospace", fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, padding: '4px 0', marginBottom: 8 }}>
            ← {t("Cambiar de local", "Change location")}
          </button>
          <div className="reserve-widget-wrap">
            <DishWidget key={reserveKey} eid={reserveLocal.eid} />
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
          <div style={{ marginTop: 8 }}><a href="#" className="link-hover" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent("dumdum:open-reserve", { detail: { local: window.DUMDUM_LOCALES?.chamberi } })); }}>{t("Reservar", "Book")} →</a></div>
        </div>
        <div>
          <b>Bernabéu</b>
          <div>Infanta Mercedes, 17</div>
          <div>28020 Madrid</div>
          <div style={{ marginTop: 8 }}><a href="#" className="link-hover" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent("dumdum:open-reserve", { detail: { local: window.DUMDUM_LOCALES?.bernabeu } })); }}>{t("Reservar", "Book")} →</a></div>
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
          <div><a href="https://open.spotify.com/playlist/75oqGRFz3CXErzrfBQTuVd?si=62f669c4e6674ff1" target="_blank" rel="noreferrer" className="link-hover">DD*Radio</a></div>
          <div><a href="#" className="link-hover" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent("dumdum:open-pide", { detail: { step: "domicilio" } })); }}>{t("A domicilio", "Delivery")}</a></div>
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

  // sessionStorage puede LANZAR (no solo devolver null) si el navegador bloquea
  // el almacenamiento ("Block all cookies", ciertos webviews). Sin try/catch la
  // excepción tumbaba el árbol de React entero → pantalla en blanco. Degradamos:
  // si no se puede leer/escribir, el Loader funciona igual, solo que no recuerda
  // que ya se mostró (se verá en cada carga). Mismo patrón que getLang().
  const yaCargado = () => {
    try { return !!sessionStorage.getItem("dumdum.loaded"); } catch (e) { return false; }
  };
  const marcarCargado = () => {
    try { sessionStorage.setItem("dumdum.loaded", "1"); } catch (e) {}
  };

  React.useEffect(() => {
    if (yaCargado()) {
      setOut(true);
      const t = setTimeout(onDone, 50);
      return () => clearTimeout(t);
    }
    let n = 0;
    // Guardamos los timeouts anidados para poder cancelarlos si el Loader se
    // desmonta antes de que disparen (evita setState sobre componente muerto).
    let toOut = null, toDone = null;
    const id = setInterval(() => {
      n += Math.max(1, Math.round((100 - n) / 12));
      if (n >= 100) {
        n = 100;
        clearInterval(id);
        setCount(100);
        toOut = setTimeout(() => {
          setOut(true);
          marcarCargado();
          toDone = setTimeout(onDone, 650);
        }, 360);
      } else {
        setCount(n);
      }
    }, 60);
    return () => { clearInterval(id); if (toOut) clearTimeout(toOut); if (toDone) clearTimeout(toDone); };
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
  const preset = window.DumDumData && window.DumDumData.PRESET_LOGOS
    ? window.DumDumData.PRESET_LOGOS[logo] : null;
  if (preset) {
    return (
      <div className="logo-slot" dangerouslySetInnerHTML={{ __html: preset }} />);

  }
  return null;
}

// Datos de los dos locales para reservas (DISH). Fuente única de verdad:
// la usan el selector de reservas y los botones directos (Locales, footer, home).
// Datos de los dos locales. FUENTE ÚNICA: los usan el selector de reservas, los
// botones directos (Locales, footer, home), la ficha ampliada de cada local
// (/locales/chamberi y /locales/bernabeu) y el JSON-LD que build.mjs inyecta en
// esas dos páginas. Si un dato cambia, se cambia AQUÍ y en ningún sitio más.
//   slug     → su URL bajo /locales/
//   tramos   → horario en minutos desde medianoche, como lo espera estadoApertura()
//   galeria  → clave de galerias.json con las fotos de ESE local (null = aún no hay)
//   cerca    → punto de interés al lado. Como dirLineas, va partido en DOS
//              líneas: los tres datos del resumen deben ocupar lo mismo o la
//              retícula deja de cuadrar. El corte se decide aquí, no se deja
//              al azar del ancho de columna.
//   borrador → true mientras el texto sea de RELLENO. Mientras lo sea, la ficha
//              pinta un aviso bien visible y el texto NO entra en el JSON-LD.
//              Al escribir el texto de verdad, se quita el flag y ya está.
// OJO: build.mjs lee este objeto tal cual (igual que hace con __ROUTES_SEO) para
// prerenderizar las fichas y su JSON-LD. Tiene que seguir siendo un literal.
window.DUMDUM_LOCALES = {
  chamberi: {
    slug: "chamberi",
    nombre: "Chamberí",
    dir: "c/ Blasco de Garay, 10",
    calle: "Calle Blasco de Garay, 10",
    // Cómo se parte la dirección en el resumen: el corte se decide aquí y no
    // se deja al azar del ancho de columna.
    dirLineas: ["Blasco", "de Garay, 10"],
    cp: "28015",
    metro: "Argüelles · San Bernardo",
    // CONFIRMAR: minutos a pie desde la parada más cercana, sin verificar.
    metroTiempo: { es: "6 min a pie", en: "6 min walk" },
    aforo: { es: "~32 comensales", en: "~32 seats" },
    // Partido en dos como dirLineas: en la ficha de móvil va en una celda con
    // el resto de datos y todas tienen que ocupar las mismas líneas.
    aforoLineas: { es: ["~32", "comensales"], en: ["~32", "seats"] },
    desde: "2024",
    tel: "+34624560181",
    telHuman: "+34 624 56 01 81",
    tramos: [[780, 939], [1200, 1359]],
    mapa: "https://www.google.com/maps?q=DUM+DUM+Blasco+de+Garay+10+Madrid&output=embed",
    // CONFIRMAR: referencia y tiempo a pie sin verificar (la de Bernabéu sí
    // sale de eventos.json). Si no cuadra, se cambia aquí y ya.
    cerca: { es: ["Templo", "de Debod"], en: ["Templo", "de Debod"], tiempo: { es: "12 min a pie", en: "12 min walk" } },
    eid: "hydra-fcb7897f-acf9-48ce-a45b-4214fb3e8fc0",
    galeria: "chamberi",
    titular: { es: "El primero.", en: "The first one." },
    entradilla: {
      es: "Todo empezó en **Chamberí** en el **año 24**. No había mejor momento. Tampoco mejor lugar.",
      en: "It all started in **Chamberí** back in **'24**. There was no better moment. And no better place."
    },
    historia: {
      es: "Aquí nació DUM DUM™. Es un lugar pequeñín por eso, porque éramos unos recién nacidos. También por eso está tan mimado. Y quizá por todo esto el ambiente sea tan especial.\n\nEl barrio ayuda, la verdad. Chamberí. Es que es guay hasta decirlo. Y la gente que trabaja aquí es majísima. Casi tanto como la gente que viene a comer.\n\n**Vente un día. Te va a gustar.**",
      en: "This is where DUM DUM™ was born. It's a tiny little place for that reason, because we were newborns. That's also why it's so looked after. And maybe that's why the atmosphere is so special.\n\nThe neighbourhood helps, honestly. Chamberí. It's cool even to say it. And the people who work here are lovely. Almost as lovely as the people who come to eat.\n\n**Drop by one day. You'll like it.**"
    }
  },
  bernabeu: {
    slug: "bernabeu",
    nombre: "Bernabéu",
    dir: "c/ Infanta Mercedes, 17",
    calle: "Calle Infanta Mercedes, 17",
    dirLineas: ["Infanta", "Mercedes, 17"],
    cp: "28020",
    metro: "Tetuán · Estrecho",
    // CONFIRMAR: minutos a pie desde la parada más cercana, sin verificar.
    metroTiempo: { es: "5 min a pie", en: "5 min walk" },
    aforo: { es: "~40 sentados / 60 de pie", en: "~40 seated / 60 standing" },
    aforoLineas: { es: ["~40 sentados", "60 de pie"], en: ["~40 seated", "60 standing"] },
    desde: "2026",
    tel: "+34614167317",
    telHuman: "+34 614 16 73 17",
    tramos: [[780, 939], [1200, 1359]],
    mapa: "https://www.google.com/maps?q=DUM+DUM+Infanta+Mercedes+17+Madrid&output=embed",
    cerca: { es: ["Estadio Santiago", "Bernabéu"], en: ["Santiago Bernabéu", "Stadium"], tiempo: { es: "5 min a pie", en: "5 min walk" } },
    // En la celda de la ficha de móvil (163px) el nombre largo se parte en TRES
    // líneas y descuadra la fila entera. Ahí va el corto, que además es como lo
    // llama todo el mundo. Chamberí no lo necesita: "Templo / de Debod" cabe.
    cercaCorto: { es: ["Estadio", "Bernabéu"], en: ["Bernabéu", "Stadium"] },
    eid: "hydra-27342526-f07a-4354-bec7-c7b0ce5d7615",
    galeria: "bernabeu",
    titular: { es: "El segundo.", en: "The second one." },
    entradilla: {
      es: "Dimos un estirón en el **año 26**. Crecimos nosotros. / **Y creció el restaurante.**",
      en: "We had a growth spurt in **'26**. We grew. / **And so did the restaurant.**"
    },
    historia: {
      es: "Chamberí nos trajo hasta Tetuán y Tetuán nos ayudó a crecer. Más tamaño, sí, pero misma esencia y mismas formas, que es como mejor se crece.\n\nLa cocina y el restaurante no se separan y está guay. Se nos ve y se os ve. Mola. Mola porque vivimos lo mismo a la vez y nos dais el mejor feedback, que es vuestra cara.\n\n**Ambiente único. Lugar precioso. Gente top.**",
      en: "Chamberí brought us to Tetuán, and Tetuán helped us grow. Bigger, yes, but the same spirit and the same manners, which is the best way to grow.\n\nThe kitchen and the dining room aren't separated, and that's great. We see you and you see us. It's the best. The best because we go through the same thing at the same time, and you give us the finest feedback there is: your face.\n\n**Unique atmosphere. Beautiful place. Top people.**"
    }
  }
};

Object.assign(window, { useRoute, nav, TopBar, Footer, Loader, Reveal, DishLogo });