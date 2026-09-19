// ─────────────────────────────────────────────────────────────
// Esqueleto común de todas las páginas HTML: topbar, flotante "Pide ya",
// modales (pedir y reservar), footer y el pie de especificaciones. Es el
// marcado de TopBar/Footer de src/ui.jsx con las MISMAS clases, para que el
// CSS del sitio se aplique sin cambiar una línea. La lógica (abrir, cerrar,
// estado del local, arrastrar el flotante) vive en src/islas/.
// ─────────────────────────────────────────────────────────────
import { esc, idioma } from "./plantilla.mjs";
import * as E from "./enlaces.mjs";

// Una página entera: cabecera, contenido y pie. `main` es el HTML propio de la
// página; `ruta` la neutra (sin /en), para marcar el enlace activo.
export function esqueleto(i, ruta, locales, main) {
  return [
    topbar(i, ruta),
    // En la carta (a la que se llega por el QR de la mesa) no hay flotante:
    // no queremos inducir a pedir online estando sentado.
    ruta === "/menu" ? "" : flotante(i),
    modales(i, locales),
    "<main>\n" + main + "\n</main>",
    footer(i, locales),
  ].filter(Boolean).join("\n\n");
}

const enlaceExterno = (href, label) =>
  `<a href="${esc(href)}" target="_blank" rel="noreferrer">${esc(label)}</a>`;

export function topbar(i, ruta) {
  const { t, lang } = i;
  const principales = [
    ["/menu", t("La carta", "Menu")],
    ["/locales", t("Locales", "Locations")],
    ["/eventos", t("Eventos", "Events")],
    ["/contacto", t("Contacto", "Contact")],
  ];
  const enlace = ([p, label]) =>
    `<a href="${i.ruta(p)}"${ruta === p ? ' class="active"' : ""}>${esc(label)}</a>`;
  // Menú móvil: los mismos destinos que la rejilla de la home, en su orden.
  const movil = [
    enlace(principales[0]),
    enlaceExterno(E.UBER_CHAMBERI, "Uber Eats"),
    enlaceExterno(E.TAKEAWAY_URL, "Take Away"),
    enlace(principales[1]), enlace(principales[2]), enlace(principales[3]),
    enlaceExterno(E.INSTAGRAM_URL, "Instagram"),
    enlaceExterno(E.SPOTIFY_URL, "DD*Radio"),
  ];
  const reservar = (extra) =>
    `<button type="button" class="topbar-reservar${extra || ""}" data-reservar>${esc(t("Reservar", "Book"))} →</button>`;
  return `<header class="topbar" data-screen-label="top-bar">
  <div class="topbar-left">
    <a href="${i.ruta("/")}" class="brand">DUM DUM<span class="brand-tm">™</span></a>
    <nav class="nav nav-desktop">
      ${principales.map(enlace).join("\n      ")}
    </nav>
  </div>

  <div class="right">
    <span class="row gap-s topbar-status" data-estado data-tramos="${E.TRAMOS.map((x) => x.join("-")).join(",")}"
      data-abierto="${esc(t("Abierto hasta las {h}h", "Open until {h}h"))}"
      data-cerrado="${esc(t("Cerrado. Nos vemos a las {h}h", "Closed. See you at {h}h"))}"></span>
    ${reservar()}
    <button type="button" class="topbar-pide" data-pide>${esc(t("Pide ya!", "Order now!"))} →</button>
    ${selectorIdioma(i, ruta)}
  </div>

  <nav class="nav nav-mobile">
    ${movil.join("\n    ")}
  </nav>

  <div class="topbar-mobile-right">
    ${selectorIdioma(i, ruta)}
    ${reservar(" topbar-reservar-mobile")}
    <button type="button" class="topbar-burger" data-burger aria-expanded="false"
      aria-label="${esc(t("Abrir menú", "Open menu"))}"
      data-abrir="${esc(t("Abrir menú", "Open menu"))}" data-cerrar="${esc(t("Cerrar menú", "Close menu"))}">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>`;
}

// El otro idioma es otra URL, así que el selector es un enlace de verdad
// (funciona sin JS y lo siguen los rastreadores).
function selectorIdioma(i, ruta) {
  const otro = i.lang === "es" ? "en" : "es";
  // "on" es la lengua actual; "otro", la que se va a cargar (la que se subraya).
  const cl = (l) => (i.lang === l ? "on" : "otro");
  return `<a class="lang-toggle" href="${idioma(otro, [ruta]).ruta(ruta)}" hreflang="${otro}" lang="${otro}" data-idioma="${otro}"`
    + ` aria-label="${otro === "en" ? "Switch to English" : "Cambiar a español"}">`
    + `<span class="${cl("es")}">ES</span><span class="sep">/</span><span class="${cl("en")}">EN</span></a>`;
}

export function flotante(i) {
  const { t } = i;
  // Bolsa de pedido, gemela del icono del flotante de alérgenos de la carta
  // (misma caja óptica, trazo 1.45 porque va claro sobre negro).
  return `<button type="button" class="fab pide-fab" data-fab data-pide aria-label="${esc(t("Pide ya", "Order now"))}">
  <span class="fab-ico" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3.9 7.6h16.2l-1.1 12a1.6 1.6 0 0 1-1.6 1.4H6.6a1.6 1.6 0 0 1-1.6-1.4L3.9 7.6Z"></path>
      <path d="M8.7 7.6V6a3.3 3.3 0 0 1 6.6 0v1.6"></path>
    </svg>
  </span>
  <span>${esc(t("Pide ya!", "Order now!"))}</span>
</button>`;
}

// Tarjeta de un modal: <a> si lleva href, <button> si lleva data-*.
const tarjeta = (attrs, label, sub) =>
  `<${attrs.href ? "a" : 'button type="button"'} class="pide-card"${Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${esc(v)}"`).join("")}>`
  + `<span class="pide-card-label">${esc(label)}</span><span class="pide-card-sub">${sub}</span>`
  + `</${attrs.href ? "a" : "button"}>`;
const cerrarBarra = (cls) =>
  `<div class="${cls}-closebar"><button type="button" class="${cls}-close" aria-label="Cerrar" data-cerrar>×</button></div>`;

export function modales(i, locales) {
  const { t, lang } = i;
  const L = [locales.chamberi, locales.bernabeu];
  const ext = { target: "_blank", rel: "noreferrer" };
  const tarjetasLocal = (attrs) => L.map((l) =>
    tarjeta({ ...attrs(l), "data-nombre": l.nombre }, l.nombre, esc(l.dir))).join("\n        ");
  // Datos que necesita la isla para montar el widget de DISH de cada local.
  const dish = {};
  for (const l of L) dish[l.slug] = { nombre: l.nombre, eid: l.eid };
  const aviso = lang === "en"
    ? "If you book at <strong>3:30pm or 10:30pm</strong>, don't cut it too close: <strong>the kitchen closes at :39</strong> and we really want to feed you 😉"
    : "Si reservas a las <strong>15:30 o 22:30</strong>, no apures mucho con la hora, que <strong>a y 39 cerramos la cocina</strong> y os queremos dar de comer 😉";
  return `<div class="pide-overlay" data-modal="pide" hidden>
  <div class="pide-modal" role="dialog" aria-modal="true" aria-label="${esc(t("Cómo quieres pedir", "How would you like to order"))}">
    ${cerrarBarra("pide")}
    <div data-paso="inicio">
      <h3 class="pide-title">${esc(t("¿Cómo quieres pedir?", "How would you like to order?"))}</h3>
      <div class="pide-options">
        ${tarjeta({ href: E.TAKEAWAY_URL, ...ext }, t("Recoger", "Pickup"), esc(t("te ahorras el envío", "skip the delivery fee")))}
        ${tarjeta({ "data-ir": "domicilio" }, t("Domicilio", "Delivery"), esc(t("Uber Eats o Glovo", "Uber Eats or Glovo")))}
      </div>
    </div>
    <div data-paso="domicilio" hidden>
      <h3 class="pide-title">${esc(t("¿Desde qué local?", "From which spot?"))}</h3>
      <div class="pide-options">
        ${tarjetasLocal((l) => ({ "data-ir": "plataforma", "data-local": l.slug }))}
      </div>
      <button type="button" class="pide-volver" data-ir="inicio">← ${esc(t("Volver", "Back"))}</button>
    </div>
    <div data-paso="plataforma" hidden>
      <h3 class="pide-title">${esc(t("¿Con qué app?", "Which app?"))}</h3>
      <div class="pide-options">
        ${tarjeta({ href: E.UBER_CHAMBERI, ...ext, "data-uber": "", "data-href-chamberi": E.UBER_CHAMBERI, "data-href-bernabeu": E.UBER_BERNABEU }, "Uber Eats", '<span data-local-nombre></span>')}
        ${tarjeta({ href: E.GLOVO_URL, ...ext }, "Glovo", '<span data-local-nombre></span>')}
      </div>
      <button type="button" class="pide-volver" data-ir="domicilio">← ${esc(t("Volver", "Back"))}</button>
    </div>
  </div>
</div>

<div class="pide-overlay" data-modal="reservar" hidden>
  <div class="pide-modal" role="dialog" aria-modal="true" aria-label="${esc(t("En qué local reservar", "Which location to book"))}">
    ${cerrarBarra("pide")}
    <h3 class="pide-title">${esc(t("¿En qué local?", "Which location?"))}</h3>
    <div class="pide-options">
      ${tarjetasLocal((l) => ({ "data-reservar": l.slug }))}
    </div>
  </div>
</div>

<div class="alerg-overlay" data-modal="dish" hidden>
  <div class="alerg-modal reserve-modal" role="dialog" aria-modal="true" aria-label="${esc(t("Reservar mesa", "Book a table"))}">
    ${cerrarBarra("alerg")}
    <div class="alerg-scroll">
      <h3 class="alerg-title">${esc(t("A reservar mesa", "Let's book you a table!"))} · <span data-local-nombre></span></h3>
      <button type="button" class="reserve-cambiar" data-reservar>← ${esc(t("Cambiar de local", "Change location"))}</button>
      <div class="reserve-widget-wrap" data-dish='${esc(JSON.stringify(dish))}'></div>
      <hr class="alerg-sep">
      <h3 class="alerg-title">${esc(t("*Un tema!", "*One thing!"))}</h3>
      <p class="alerg-intro">${aviso}</p>
    </div>
  </div>
</div>`;
}

export function footer(i, locales) {
  const { t } = i;
  const local = (l) => `<div>
      <b>${esc(l.nombre)}</b>
      <div>${esc(l.dirLineas.join(" "))}</div>
      <div>${esc(l.cp)} Madrid</div>
      <div class="foot-mas"><a href="#" class="link-hover" data-reservar="${l.slug}">${esc(t("Reservar", "Book"))} →</a></div>
    </div>`;
  return `<footer class="foot" data-screen-label="footer">
  <div class="foot-word">DUM DUM<span class="tm">™</span></div>

  <div class="foot-grid">
    ${local(locales.chamberi)}
    ${local(locales.bernabeu)}
    <div>
      <b>${esc(t("Horarios", "Hours"))}</b>
      <div>13.00 — 15.39</div>
      <div>20.00 — 22.39</div>
      <div class="foot-mas">${esc(t("Todos los días", "Every day"))}</div>
    </div>
    <div>
      <b>${esc(t("Redes", "Social"))}</b>
      <div><a href="${E.INSTAGRAM_URL}" target="_blank" rel="noreferrer" class="link-hover">Instagram</a></div>
      <div><a href="${E.SPOTIFY_URL}" target="_blank" rel="noreferrer" class="link-hover">DD*Radio</a></div>
      <div><a href="#" class="link-hover" data-pide="domicilio">${esc(t("A domicilio", "Delivery"))}</a></div>
    </div>
  </div>

  <div class="foot-bot">
    <div>© DUM DUM™ · Dumplings &amp; ${esc(t("Desobediencia", "Disobedience"))} · Madrid</div>
    <div></div>
  </div>
</footer>`;
}

// Pie de especificaciones de cada página: [etiqueta, contenido HTML ya escapado].
export function specFoot(celdas, id) {
  return `<section class="spec-foot"${id ? ` id="${id}"` : ""}>
${celdas.map(([b, html]) => `  <div><b>${esc(b)}</b>${html}</div>`).join("\n")}
</section>`;
}
