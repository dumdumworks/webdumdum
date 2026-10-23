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

// La pastilla SE CONVIERTE en la tarjeta: la tarjeta arranca con el tamaño, la posición, el
// rojo y el filete de la pastilla (que desaparece en ese instante) y crece hasta su sitio
// mientras el rojo pasa a crema y las esquinas se suavizan. El texto de la pastilla se
// desvanece al empezar y el contenido aparece cuando ya hay hueco. Cerrar es lo mismo al revés.
// El contenido va maquetado SIEMPRE a su tamaño final (la caja que crece solo lo recorta):
// así no se reajusta ni se deforma durante el movimiento.
const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";   // arranca con decisión y frena largo y suave al llegar
const DURACION = 520;
const sinMovimiento = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  tarjeta.setAttribute("aria-label", txt.textContent); tarjeta.tabIndex = -1; tarjeta.inert = true;
  const cerrar = document.createElement("button");
  cerrar.type = "button"; cerrar.className = "cierto-x"; cerrar.textContent = "✕";
  cerrar.setAttribute("aria-label", t("Cerrar", "Close"));
  const media = document.createElement("div"); media.className = "cierto-media";
  const ir = document.createElement("a");
  ir.className = "btn red cierto-ir"; ir.href = a.boton.url;
  ir.textContent = t("Ir a ", "Go to ") + t(a.boton.texto, a.boton.texto_en) + " →";
  const dentro = document.createElement("div"); dentro.className = "cierto-in";
  dentro.append(cerrar, media, ir);
  // Copia del contenido de la pastilla: es lo que se ve en la tarjeta al empezar y al terminar.
  const pre = document.createElement("div"); pre.className = "cierto-pre"; pre.setAttribute("aria-hidden", "true");
  pre.append(ico.cloneNode(true), txt.cloneNode(true));
  tarjeta.append(dentro, pre);
  document.body.append(boton, tarjeta);
  atenuarAlScroll(boton);
  requestAnimationFrame(() => boton.classList.add("is-on"));

  let abierta = false, animando = false;

  // Anima la tarjeta entre la pastilla y su sitio final. `teclado`: el foco solo se mueve si
  // se usó el teclado (en táctil, un foco programático pinta el anillo en iOS).
  function mover(abriendo, teclado) {
    animando = true;
    abierta = abriendo;
    boton.setAttribute("aria-expanded", String(abriendo));
    const p = boton.getBoundingClientRect();
    if (abriendo) {
      tarjeta.classList.add("is-open"); tarjeta.inert = false;   // ya está en su sitio final, aún sin pintarse
      if (!media.firstChild) media.append(medio(a.media));        // primera vez: ahora sí se pide el archivo
      boton.classList.add("is-visto");                            // las pupilas dejan de moverse
    }
    const c = tarjeta.getBoundingClientRect();
    const fin = () => {
      if (abriendo) {
        const v = media.querySelector("video"); if (v) v.play().catch(() => {});
        if (teclado) tarjeta.focus({ preventScroll: true });
      } else {
        tarjeta.classList.remove("is-open"); tarjeta.inert = true;
        boton.style.visibility = "";
        const v = media.querySelector("video"); if (v) v.pause();
        if (teclado) boton.focus({ preventScroll: true });
      }
      animando = false;
    };
    if (sinMovimiento()) {   // sin animación: cambio directo
      boton.style.visibility = abriendo ? "hidden" : "";
      return fin();
    }
    const css = getComputedStyle(document.documentElement);
    const rojo = css.getPropertyValue("--red").trim(), crema = css.getPropertyValue("--bg").trim();
    const caja = (r, radio, sombra) => ({
      left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px",
      right: "auto", bottom: "auto", maxHeight: "none", borderRadius: radio, boxShadow: sombra,
    });
    const deBoton = caja(p, "22px", getComputedStyle(boton).boxShadow);
    const deTarjeta = caja(c, "20px", getComputedStyle(tarjeta).boxShadow);
    // El color va aparte: mezclar rojo y crema pasa por un rosa lavado. Se queda rojo (un botón
    // que crece) hasta un cuarto del recorrido y el cambio a crema llega ya con la caja casi hecha.
    const rojizo = { backgroundColor: rojo, borderColor: crema }, cremoso = { backgroundColor: crema, borderColor: rojo };
    const colores = abriendo
      ? [{ ...rojizo, offset: 0 }, { ...rojizo, offset: 0.25 }, { ...cremoso, offset: 1 }]
      : [{ ...cremoso, offset: 0 }, { ...rojizo, offset: 0.75 }, { ...rojizo, offset: 1 }];
    const dur = abriendo ? DURACION : DURACION * 0.85;
    tarjeta.style.overflow = "hidden";
    dentro.style.width = c.width - 2 + "px";   // el contenido se maqueta a su ancho final
    if (abriendo) boton.style.visibility = "hidden";
    const lineal = { duration: dur, easing: "linear", fill: "both" };
    const anims = [
      tarjeta.animate(abriendo ? [deBoton, deTarjeta] : [deTarjeta, deBoton], { duration: dur, easing: EASE, fill: "both" }),
      tarjeta.animate(colores, lineal),
      dentro.animate(abriendo ? [{ opacity: 0 }, { opacity: 0, offset: 0.4 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0, offset: 0.35 }, { opacity: 0 }], lineal),
      pre.animate(abriendo ? [{ opacity: 1 }, { opacity: 0, offset: 0.35 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 0, offset: 0.6 }, { opacity: 1 }], lineal),
    ];
    anims[0].onfinish = () => {
      // Al cerrar, la tarjeta se oculta ANTES de soltar la animación: si no, parpadea en su sitio final.
      if (!abriendo) { tarjeta.classList.remove("is-open"); tarjeta.inert = true; boton.style.visibility = ""; }
      anims.forEach((x) => x.cancel());
      tarjeta.style.overflow = ""; dentro.style.width = "";
      fin();
    };
  }
  const alternar = (e) => { if (!animando) mover(!abierta, e.detail === 0); };
  boton.addEventListener("click", alternar);
  cerrar.addEventListener("click", (e) => { if (!animando && abierta) mover(false, e.detail === 0); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && abierta && !animando) mover(false, true); });
}

export async function porCierto() {
  let datos;
  try { datos = await (await fetch("/por-cierto.json")).json(); } catch (e) { return; }
  const aviso = (datos.avisos || []).find((a) => a.activo !== false && (!a.paginas || a.paginas.includes(ruta())));
  if (aviso) esperarSinAviso().then(() => pintar(aviso));
}
