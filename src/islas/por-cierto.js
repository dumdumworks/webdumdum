// ─────────────────────────────────────────────────────────────
// «Por cierto!»: pastilla flotante (gemela del botón de alérgenos, pero a la
// izquierda) que despliega una tarjeta con un aviso: imagen o vídeo y un botón
// «Ir a …». PROTOTIPO: lee /por-cierto.json; si no existe o no hay ningún aviso
// para esta página, no hace nada (ni pinta ni pide nada más).
// La imagen o el vídeo NO se piden hasta que alguien abre la tarjeta.
// ─────────────────────────────────────────────────────────────
import { $, atenuarAlScroll } from "./nucleo.js";

const EN = document.documentElement.lang === "en";
const t = (es, en) => (EN && en ? en : es);
// Ruta neutra de la página (sin /en ni barra final), la misma que usa el selector de páginas.
const ruta = () => location.pathname.replace(/^\/en(?=\/|$)/, "").replace(/\/+$/, "") || "/";

// Dos ojitos mirando de lado; las pupilas llevan su propia animación (ver el CSS).
const OJOS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'
  + '<circle cx="6.3" cy="12" r="4.2"></circle><circle cx="17.7" cy="12" r="4.2"></circle>'
  + '<circle class="cierto-pupila" cx="7.5" cy="12" r="1.8" fill="currentColor" stroke="none"></circle>'
  + '<circle class="cierto-pupila" cx="18.9" cy="12" r="1.8" fill="currentColor" stroke="none"></circle></svg>';

// El aviso de cookies de la primera visita ocupa el mismo rincón: esperar a que se cierre.
const avisoCookiesAbierto = () => {
  const d = document.getElementById("CybotCookiebotDialog");
  return !!d && getComputedStyle(d).display !== "none" && d.getBoundingClientRect().height > 0;
};
const esperarSinAviso = () => new Promise((ok) => {
  const mirar = () => (avisoCookiesAbierto() ? setTimeout(mirar, 500) : ok());
  mirar();
});

function medio(m) {
  if (m.tipo === "video") {
    const v = document.createElement("video");
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = "none";
    if (m.poster) v.poster = m.poster;
    v.src = m.src;
    return v;
  }
  const i = new Image();
  i.width = 1280; i.height = 720; i.alt = m.alt || ""; i.decoding = "async";
  i.src = m.src;
  return i;
}

function pintar(a) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "fab cierto-fab";
  boton.setAttribute("aria-expanded", "false");
  boton.setAttribute("aria-controls", "cierto-card");
  const ico = document.createElement("span");
  ico.className = "fab-ico"; ico.setAttribute("aria-hidden", "true"); ico.innerHTML = OJOS;
  const txt = document.createElement("span");
  txt.className = "cierto-txt";
  txt.textContent = t(a.etiqueta || "Por cierto!", a.etiqueta_en || "By the way!");
  boton.append(ico, txt);

  const tarjeta = document.createElement("aside");
  tarjeta.id = "cierto-card"; tarjeta.className = "cierto-card";
  tarjeta.setAttribute("aria-label", txt.textContent); tarjeta.inert = true;
  const cerrar = document.createElement("button");
  cerrar.type = "button"; cerrar.className = "cierto-x"; cerrar.textContent = "✕";
  cerrar.setAttribute("aria-label", t("Cerrar", "Close"));
  const media = document.createElement("div"); media.className = "cierto-media";
  const cuerpo = document.createElement("div"); cuerpo.className = "cierto-body";
  if (a.texto) {
    const p = document.createElement("p"); p.className = "cierto-texto";
    p.textContent = t(a.texto, a.texto_en); cuerpo.append(p);
  }
  const ir = document.createElement("a");
  ir.className = "btn red cierto-ir"; ir.href = a.boton.url;
  ir.textContent = t("Ir a ", "Go to ") + t(a.boton.texto, a.boton.texto_en) + " →";
  cuerpo.append(ir);
  tarjeta.append(cerrar, media, cuerpo);
  document.body.append(boton, tarjeta);
  atenuarAlScroll(boton);
  requestAnimationFrame(() => boton.classList.add("is-on"));

  let abierta = false;
  const poner = (si) => {
    abierta = si;
    boton.setAttribute("aria-expanded", String(si));
    tarjeta.classList.toggle("is-open", si);
    tarjeta.inert = !si;
    const v = media.querySelector("video");
    if (si) {
      if (!media.firstChild) media.append(medio(a.media));   // primera vez: ahora sí se pide el archivo
      boton.classList.add("is-visto");                       // las pupilas dejan de moverse
      const vid = media.querySelector("video"); if (vid && !matchMedia("(prefers-reduced-motion: reduce)").matches) vid.play().catch(() => {});
    } else if (v) v.pause();
  };
  boton.addEventListener("click", () => poner(!abierta));
  cerrar.addEventListener("click", () => { poner(false); boton.focus(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && abierta) { poner(false); boton.focus(); } });
}

export async function porCierto() {
  let datos;
  try { datos = await (await fetch("/por-cierto.json")).json(); } catch (e) { return; }
  const aviso = (datos.avisos || []).find((a) => a.activo !== false && (!a.paginas || a.paginas.includes(ruta())));
  if (aviso) esperarSinAviso().then(() => pintar(aviso));
}
