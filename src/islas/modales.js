// Los tres diálogos de la topbar: "Pide ya" (recoger / a domicilio → local →
// app), el selector de local para reservar y el widget de reservas de DISH.
// El marcado ya está en la página (src/html/shell.mjs); aquí solo se muestra y
// se oculta con `hidden`, se atrapa el foco y se monta el widget de DISH.
//
// Cualquier elemento de la página abre los modales con dos atributos:
//   data-pide              → "Pide ya" desde el principio
//   data-pide="domicilio"  → directo al selector de local
//   data-reservar          → reservar: selector de local
//   data-reservar="slug"   → reservar directamente en ese local
import { $, $$, emitir, atraparFoco } from "./nucleo.js";
import { urlReserva } from "./reservas-url.js";

// Un modal es su overlay; la caja del diálogo es su primer hijo. Lo usan
// también las ventanas de otras islas (los alérgenos de la carta).
export function modal(sel) {
  const overlay = $(sel);
  if (!overlay) return null;
  let soltar = null;
  // `m` es lo que se devuelve, y quien lo usa (los alérgenos de la carta, el
  // widget de DISH) a veces reasigna m.cerrar para añadir su propia limpieza
  // al cerrar. Los listeners de aquí llaman a m.cerrar() — no a una `cerrar`
  // capturada — para que siempre disparen esa versión reasignada, venga el
  // cierre del fondo, del botón [data-cerrar] o de fuera (Escape).
  const m = {
    overlay,
    abrir() {
      if (!overlay.hidden) return;
      overlay.hidden = false;
      soltar = atraparFoco(overlay.firstElementChild);
      sincronizarFlotante();
    },
    cerrar() {
      if (overlay.hidden) return;
      overlay.hidden = true;
      if (soltar) soltar();
      soltar = null;
      sincronizarFlotante();
    },
  };
  overlay.addEventListener("click", (e) => { if (e.target === overlay) m.cerrar(); });
  $$("[data-cerrar]", overlay).forEach((b) => b.addEventListener("click", () => m.cerrar()));
  return m;
}

let pide, reservar, dish;
const abiertos = () => [pide, reservar, dish].some((m) => m && !m.overlay.hidden);

// El flotante "Pide ya" se esconde mientras haya un modal abierto: los
// overlays solo tiñen al 40% y, si no, el botón se sigue intuyendo debajo.
function sincronizarFlotante() {
  const fab = $("[data-fab]");
  if (fab) fab.hidden = abiertos();
}

// ── Pide ya ──────────────────────────────────────────────────
function irA(paso) {
  $$("[data-paso]", pide.overlay).forEach((p) => { p.hidden = p.dataset.paso !== paso; });
}
export function abrirPide(paso) {
  cerrarTodo();
  irA(paso || "inicio");
  pide.abrir();
}
function prepararPide() {
  pide = modal('[data-modal="pide"]');
  if (!pide) return;
  $$("[data-ir]", pide.overlay).forEach((b) => b.addEventListener("click", () => {
    // Al elegir local, las tarjetas de la última pantalla confirman cuál es y
    // Uber Eats apunta a la tienda de ESE local (Glovo tiene una para todo Madrid).
    if (b.dataset.local) {
      const uber = $("[data-uber]", pide.overlay);
      uber.href = uber.dataset["href" + b.dataset.local.charAt(0).toUpperCase() + b.dataset.local.slice(1)];
      $$("[data-local-nombre]", pide.overlay).forEach((s) => { s.textContent = b.dataset.nombre; });
    }
    irA(b.dataset.ir);
  }));
}

// ── Reservar ─────────────────────────────────────────────────
let scriptDish = null;
function montarDish(wrap, eid) {
  desmontarDish(wrap);
  const tagid = "hors-" + eid;
  const div = document.createElement("div");
  div.id = tagid;
  wrap.appendChild(div);
  // Configuración global que lee widget.js de DISH: ID del local + colores DUM DUM.
  window._hors = [
    ["eid", eid], ["tagid", tagid], ["width", "100%"], ["height", ""],
    ["foregroundColor", "#ff001e"], ["backgroundColor", "#fffaf3"],
    ["linkColor", "#ff001e"], ["errorColor", "#ff001e"],
    ["primaryButtonForegroundColor", "#fffaf3"], ["primaryButtonBackgroundColor", "#ff001e"],
    ["secondaryButtonForegroundColor", "#ff001e"], ["secondaryButtonBackgroundColor", "#fffaf3"],
  ];
  scriptDish = document.createElement("script");
  scriptDish.src = "https://reservation.dish.co/widget.js";
  scriptDish.async = true;
  document.body.appendChild(scriptDish);
}
function desmontarDish(wrap) {
  if (scriptDish) { try { scriptDish.remove(); } catch (e) {} scriptDish = null; }
  wrap.replaceChildren();
  wrap.classList.remove("reserve-widget-propio");
}
export function abrirReservar(slug) {
  cerrarTodo();
  // Cada apertura cuenta como conversión (es el evento marcado en Ads).
  emitir("dumdum:open-reserve", { local: slug || null });
  if (!slug) { reservar.abrir(); return; }
  const wrap = $("[data-dish]", dish.overlay);
  const local = JSON.parse(wrap.dataset.dish)[slug];
  if (!local) return;
  $$("[data-local-nombre]", dish.overlay).forEach((s) => { s.textContent = local.nombre; });
  if (local.reserva?.proveedor === "propio") {
    desmontarDish(wrap);
    wrap.classList.add("reserve-widget-propio");
    const idioma = document.documentElement.lang === "en" ? "en" : "es";
    const origen = new URLSearchParams(window.location.search).get("origen");
    const url = urlReserva(local.reserva.url, slug, idioma, origen);
    const iframe = document.createElement("iframe");
    iframe.src = url.href;
    iframe.title = `${idioma === "en" ? "Book" : "Reservar"} · ${local.nombre}`;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    const link = document.createElement("a");
    link.href = url.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = idioma === "en" ? "Open booking in a new tab" : "Abrir reservas en otra pestaña";
    wrap.append(iframe, link);
  } else montarDish(wrap, local.eid);
  dish.abrir();
}
function prepararReservar() {
  reservar = modal('[data-modal="reservar"]');
  dish = modal('[data-modal="dish"]');
  if (!dish) return;
  // Al cerrar, el widget se desmonta: la próxima apertura arranca de cero.
  const cerrarDish = dish.cerrar;
  dish.cerrar = () => { cerrarDish(); desmontarDish($("[data-dish]", dish.overlay)); };
}

function cerrarTodo() {
  [pide, reservar, dish].forEach((m) => m && m.cerrar());
}

export function modales() {
  prepararPide();
  prepararReservar();
  if (!pide && !reservar) return;
  // Un solo escuchador para todos los botones de la página, presentes o futuros.
  document.addEventListener("click", (e) => {
    const el = e.target.closest ? e.target.closest("[data-pide],[data-reservar]") : null;
    if (!el) return;
    e.preventDefault();
    if (el.hasAttribute("data-pide")) abrirPide(el.dataset.pide);
    else abrirReservar(el.dataset.reservar);
  });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarTodo(); });
  // Direct URLs for each Google Business location use the same booking entrypoint.
  const requested = new URLSearchParams(window.location.search).get("reservar");
  if (requested && dish) {
    const data = JSON.parse($("[data-dish]", dish.overlay).dataset.dish);
    if (Object.hasOwn(data, requested)) abrirReservar(requested);
  }
}
