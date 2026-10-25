// ─────────────────────────────────────────────────────────────
// Avisos: botón flotante redondo a la izquierda, con la cara de DUM DUM como foto de perfil, un
// aro verde (el de «mejores amigos» de Instagram) y el número de avisos como una notificación. Despliega una tarjeta
// con un aviso: imagen o vídeo y un botón. Con varios avisos, la tarjeta se comporta como las
// stories de Instagram (ver «historias» más abajo).
// Lee /por-cierto.json (functions/por-cierto.json.js): si no responde o no hay ningún aviso activo para
// esta página, no hace nada (ni pinta ni pide nada más).
// La imagen o el vídeo NO se piden hasta que alguien abre la tarjeta.
// ─────────────────────────────────────────────────────────────
import { atenuarAlScroll } from "./nucleo.js";

const EN = document.documentElement.lang === "en";
const t = (es, en) => (EN && en ? en : es);
// Ruta neutra de la página (sin /en ni barra final), la misma que usa el selector de páginas.
const ruta = () => location.pathname.replace(/^\/en(?=\/|$)/, "").replace(/\/+$/, "") || "/";

// La foto de perfil es el favicon de la web (ya está en el repo; no añade ningún archivo).
const AVATAR = "/favicon-192x192.png";
// Lo último que ha visto este navegador (los ids de los avisos): hasta que cambien, el aro va en
// gris y sin número, como una story ya vista.
const VISTO = "dumdum.avisos";

// El aviso de cookies de la primera visita ocupa el mismo rincón: esperar a que se cierre.
const avisoCookiesAbierto = () => {
  const d = document.getElementById("CybotCookiebotDialog");
  return !!d && getComputedStyle(d).display !== "none" && d.getBoundingClientRect().height > 0;
};
const esperarSinAviso = () => new Promise((ok) => {
  const mirar = () => (avisoCookiesAbierto() ? setTimeout(mirar, 500) : ok());
  mirar();
});

// `bucle`: un vídeo suelto se repite; en una historia que avanza sola, al acabar pasa a la siguiente.
function medio(m, bucle) {
  if (m.tipo === "video") {
    const v = document.createElement("video");
    v.muted = true; v.loop = bucle; v.playsInline = true; v.preload = "none";
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
// Historias: lo que dura una imagen, lo que hay que mantener para pausar y los umbrales del gesto.
const IMAGEN_MS = 5000, RETENER_MS = 200, UMBRAL_PX = 8, CIERRE_PX = 90;
const sinMovimiento = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function pintar(avisos) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "fab cierto-fab";
  boton.setAttribute("aria-expanded", "false");
  boton.setAttribute("aria-controls", "cierto-card");
  const ico = document.createElement("span");
  ico.className = "fab-ico cierto-avatar"; ico.setAttribute("aria-hidden", "true");
  const foto = new Image();
  foto.src = AVATAR; foto.alt = ""; foto.width = foto.height = 36;
  ico.append(foto);
  // El botón no lleva texto visible; esto es lo que lee un lector de pantalla.
  const txt = document.createElement("span");
  txt.className = "sr-only";
  txt.textContent = t("Novedades de DUM DUM", "News from DUM DUM");
  boton.append(ico, txt);
  // Como la notificación de una app: cuántos avisos hay, hasta que se abren.
  const huella = avisos.map((a) => a.id).join(",");
  const marcarVisto = () => { try { localStorage.setItem(VISTO, huella); } catch (e) { /* sin almacenamiento: se vuelve a ver */ } };
  let visto = false;
  try { visto = localStorage.getItem(VISTO) === huella; } catch (e) { /* idem */ }
  const num = document.createElement("span");
  num.className = "cierto-num"; num.setAttribute("aria-hidden", "true"); num.textContent = avisos.length;
  boton.append(num);
  if (visto) boton.classList.add("is-visto");

  const tarjeta = document.createElement("aside");
  tarjeta.id = "cierto-card"; tarjeta.className = "cierto-card";
  tarjeta.setAttribute("aria-label", txt.textContent); tarjeta.tabIndex = -1; tarjeta.inert = true;
  const cerrar = document.createElement("button");
  cerrar.type = "button"; cerrar.className = "cierto-x"; cerrar.textContent = "✕";
  cerrar.setAttribute("aria-label", t("Cerrar", "Close"));
  // Historias: con varios avisos, la tarjeta se porta como las stories de Instagram. Barritas de
  // progreso arriba; avanza sola (IMAGEN_MS por imagen, lo que dure el vídeo); un toque a la derecha
  // pasa a la siguiente y uno en el primer tercio vuelve a la anterior; mantener pulsado pausa y
  // esconde la interfaz; deslizar hacia abajo cierra; al acabar la última, se cierra. Con un solo aviso
  // no hay barras ni avance: queda la tarjeta fija de siempre.
  const n = avisos.length;
  const avanza = n > 1 && !sinMovimiento();   // con «reducir movimiento» no hay avance automático
  const diapositivas = avisos.map((a) => {
    const media = document.createElement("div"); media.className = "cierto-media";
    const ir = document.createElement("a");
    ir.className = "btn cierto-ir" + (a.boton.color === "blanco" ? "" : " red");
    // Una acción ("pide", "reservar") abre el modal de la web con el escuchador de modales.js;
    // una página va a su ruta en el idioma de la que se está viendo.
    if (a.boton.accion) { ir.href = "#"; ir.setAttribute("data-" + a.boton.accion, ""); }
    else ir.href = (EN ? "/en" : "") + a.boton.url;
    ir.textContent = t(a.boton.texto, a.boton.texto_en) + " →";
    const el = document.createElement("div"); el.className = "cierto-slide";
    el.append(media, ir);
    return { a, media, ir, el };
  });
  const pista = document.createElement("div"); pista.className = "cierto-pista";
  pista.append(...diapositivas.map((d) => d.el));
  const dentro = document.createElement("div"); dentro.className = "cierto-in";
  dentro.append(cerrar, pista);
  const barras = [];
  if (n > 1) {
    const bs = document.createElement("div"); bs.className = "cierto-bars"; bs.setAttribute("aria-hidden", "true");
    diapositivas.forEach(() => {
      const b = document.createElement("span"), f = document.createElement("span");
      b.className = "cierto-bar"; b.append(f); bs.append(b); barras.push(f);
    });
    dentro.append(bs);
    // Las zonas de toque son botones de verdad: así también se navega con teclado y lector de pantalla.
    // El toque con puntero lo resuelve el gesto de abajo; el clic nativo (detail 0) es el del teclado.
    [["ant", t("Anterior", "Previous"), () => anterior()], ["sig", t("Siguiente", "Next"), () => siguiente()]].forEach(([c, nombre, accion]) => {
      const z = document.createElement("button");
      z.type = "button"; z.className = "cierto-zona cierto-zona-" + c; z.setAttribute("aria-label", nombre);
      z.addEventListener("click", (e) => { if (e.detail === 0) accion(); });
      pista.append(z);
    });
  }
  // Copia del contenido de la pastilla: es lo que se ve en la tarjeta al empezar y al terminar.
  const pre = document.createElement("div"); pre.className = "cierto-pre"; pre.setAttribute("aria-hidden", "true");
  pre.append(ico.cloneNode(true));
  tarjeta.append(dentro, pre);
  document.body.append(boton, tarjeta);
  atenuarAlScroll(boton);
  requestAnimationFrame(() => boton.classList.add("is-on"));

  let abierta = false, animando = false, actual = 0;
  let sostenido = false, arrastrando = false, foco = false;   // lo que detiene la historia
  diapositivas.forEach((d, k) => { d.el.inert = k !== 0; });   // solo la visible entra en el orden de tabulación

  // El archivo de cada historia no se pide hasta que hace falta: la visible y la siguiente, al abrir
  // (así quien solo abre y cierra no descarga el resto).
  const cargar = (i) => {
    const d = diapositivas[i];
    if (!d || d.media.firstChild) return;
    const m = medio(d.a.media, !avanza);
    if (avanza && m.tagName === "VIDEO") m.addEventListener("ended", () => { if (actual === i) siguiente(); });
    d.media.append(m);
  };
  const pausado = () => !abierta || animando || sostenido || arrastrando || foco || document.hidden;
  // Reproduce o detiene el vídeo visible según el estado, y esconde la interfaz mientras se mantiene pulsado.
  function aplicar() {
    tarjeta.classList.toggle("is-pausado", sostenido);
    diapositivas.forEach((d, i) => {
      const v = d.media.querySelector("video");
      if (v) { if (i === actual && !pausado()) v.play().catch(() => {}); else v.pause(); }
    });
  }
  function mostrar(i) {
    actual = i; avance = 0;
    diapositivas.forEach((d, k) => { d.el.inert = k !== i; });
    barras.forEach((f, k) => { f.style.transform = k < i || (k === i && n > 1 && !avanza) ? "scaleX(1)" : "scaleX(0)"; });
    cargar(i); if (n > 1) cargar(i + 1);
    const v = diapositivas[i].media.querySelector("video");
    if (v) v.currentTime = 0;   // cada vez que se ve, empieza desde el principio
    aplicar();
  }
  // Primera historia: «anterior» la reinicia. Última: «siguiente» cierra la tarjeta.
  function anterior() { if (n > 1) mostrar(Math.max(actual - 1, 0)); }
  function siguiente() {
    if (n < 2) return;
    if (actual < n - 1) mostrar(actual + 1); else mover(false, false);
  }

  // Avance: un solo bucle mientras la tarjeta está abierta. La imagen cuenta tiempo cuando ya ha
  // cargado (como Instagram, no corre mientras no se ve); el vídeo manda con su propio reloj, así que
  // si se atasca por la red la barra también se queda quieta.
  let avance = 0, previo = 0, bucle = 0;
  function pulso(ahora) {
    bucle = requestAnimationFrame(pulso);
    const dt = ahora - previo; previo = ahora;
    if (pausado()) return;
    const m = diapositivas[actual].media.firstChild;
    const video = m && m.tagName === "VIDEO";
    if (!video && m && m.complete) avance += dt;
    const p = video ? (m.duration ? m.currentTime / m.duration : 0) : avance / IMAGEN_MS;
    barras[actual].style.transform = "scaleX(" + Math.min(p, 1) + ")";
    if (!video && p >= 1) siguiente();
  }
  const arrancar = () => { if (avanza) { previo = performance.now(); bucle = requestAnimationFrame(pulso); } };
  const parar = () => cancelAnimationFrame(bucle);

  // Gesto sobre la imagen: toque (pasa), mantener pulsado (pausa), deslizar hacia abajo (cierra).
  // El botón de la tarjeta queda fuera: es un enlace normal.
  let dedo = null;
  pista.addEventListener("pointerdown", (e) => {
    if (!abierta || animando || dedo || e.button > 0 || e.target.closest(".cierto-ir")) return;
    dedo = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp, dy: 0 };
    dedo.espera = setTimeout(() => { dedo.retenido = true; sostenido = true; aplicar(); }, RETENER_MS);
    pista.setPointerCapture(e.pointerId);
  });
  pista.addEventListener("pointermove", (e) => {
    if (!dedo || e.pointerId !== dedo.id) return;
    const dx = e.clientX - dedo.x, dy = e.clientY - dedo.y;
    if (!dedo.arrastre && dy > UMBRAL_PX && dy > Math.abs(dx)) {
      dedo.arrastre = true; clearTimeout(dedo.espera);
      sostenido = false; arrastrando = true; aplicar();
    }
    if (dedo.arrastre) { dedo.dy = Math.max(dy, 0); tarjeta.style.transform = "translateY(" + dedo.dy + "px)"; }
    else if (Math.hypot(dx, dy) > UMBRAL_PX) dedo.movido = true;
  });
  const soltar = (e) => {
    if (!dedo || e.pointerId !== dedo.id) return;
    const d = dedo; dedo = null;
    clearTimeout(d.espera);
    const cancelado = e.type === "pointercancel";
    sostenido = arrastrando = false;
    if (d.arrastre) {
      if (!cancelado && (d.dy > CIERRE_PX || d.dy / (e.timeStamp - d.t) > 0.5)) return mover(false, false);
      // Sin llegar al umbral, la tarjeta vuelve a su sitio con el mismo frenado que el resto.
      tarjeta.style.transition = "transform .3s " + EASE;
      tarjeta.style.transform = "";
      setTimeout(() => { tarjeta.style.transition = ""; }, 300);
    } else if (!cancelado && !d.movido && !d.retenido) {
      const r = pista.getBoundingClientRect();
      if (e.clientX - r.left < r.width / 3) anterior(); else siguiente();
    }
    aplicar();
  };
  pista.addEventListener("pointerup", soltar);
  pista.addEventListener("pointercancel", soltar);
  pista.addEventListener("contextmenu", (e) => e.preventDefault());   // pulsación larga en Android
  // Con el foco del teclado en el botón o la ✕ la historia espera (WCAG 2.2.2); la propia tarjeta no cuenta.
  tarjeta.addEventListener("focusin", (e) => { foco = e.target !== tarjeta && e.target.matches(":focus-visible"); aplicar(); });
  tarjeta.addEventListener("focusout", () => { foco = false; aplicar(); });
  document.addEventListener("visibilitychange", aplicar);

  // Anima la tarjeta entre el botón redondo y su sitio final. `teclado`: el foco solo se mueve si
  // se usó el teclado (en táctil, un foco programático pinta el anillo en iOS).
  function mover(abriendo, teclado) {
    animando = true;
    abierta = abriendo;
    boton.setAttribute("aria-expanded", String(abriendo));
    const p = boton.getBoundingClientRect();
    const aro = getComputedStyle(boton).borderColor;   // verde si hay avisos sin ver, gris si ya se vieron
    if (abriendo) {
      tarjeta.classList.add("is-open"); tarjeta.inert = false;   // ya está en su sitio final, aún sin pintarse
      mostrar(0);                                                  // siempre desde la primera; ahora sí se pide el archivo
      boton.classList.add("is-visto"); marcarVisto();            // aro gris y sin número, hasta que haya avisos nuevos
    }
    if (!abriendo) parar();
    const c = tarjeta.getBoundingClientRect();
    tarjeta.style.transform = "";   // si se cierra deslizando, la animación parte de donde está la tarjeta (c ya lo recoge)
    const fin = () => {
      if (abriendo) {
        arrancar();
        if (teclado) tarjeta.focus({ preventScroll: true });
      } else {
        tarjeta.classList.remove("is-open"); tarjeta.inert = true;
        boton.style.visibility = "";
        if (teclado) boton.focus({ preventScroll: true });
      }
      animando = false;
      aplicar();
    };
    if (sinMovimiento()) {   // sin animación: cambio directo
      boton.style.visibility = abriendo ? "hidden" : "";
      return fin();
    }
    const rojo = getComputedStyle(document.documentElement).getPropertyValue("--red").trim();
    const caja = (r, radio, borde, sombra) => ({
      left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px",
      right: "auto", bottom: "auto", maxHeight: "none", borderRadius: radio, borderWidth: borde, boxShadow: sombra,
    });
    // El botón es un círculo crema con aro de 2,5px; la tarjeta es crema con filete de 1px. El aro
    // pasa a rojo (o de vuelta) mientras la caja crece.
    const deBoton = caja(p, p.width / 2 + "px", "2.5px", getComputedStyle(boton).boxShadow);
    const deTarjeta = caja(c, "20px", "1px", getComputedStyle(tarjeta).boxShadow);
    const colores = [{ borderColor: abriendo ? aro : rojo }, { borderColor: abriendo ? rojo : aro }];
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
  // Al abrir un modal (o saltar al formulario de la misma página) la tarjeta se recoge: no queda detrás.
  diapositivas.forEach((d) => d.ir.addEventListener("click", () => { if (!animando && abierta) mover(false, false); }));
  document.addEventListener("keydown", (e) => {
    if (!abierta || animando) return;
    if (e.key === "Escape") mover(false, true);
    else if (e.key === "ArrowRight" && actual < n - 1) siguiente();
    else if (e.key === "ArrowLeft") anterior();
  });
}

// Un aviso sale solo si está activo, tiene medio y botón, y la página figura en «Dónde sale».
// Cualquier dato que falte o falle (404, JSON roto, lista vacía) deja la página sin botón.
const sale = (a) => a && a.activo === true && a.media && a.media.src && a.boton &&
  Array.isArray(a.paginas) && a.paginas.includes(ruta());

export async function porCierto() {
  let datos;
  try {
    const r = await fetch("/por-cierto.json");
    if (!r.ok) return;
    datos = await r.json();
  } catch (e) { return; }
  const aqui = Array.isArray(datos && datos.avisos) ? datos.avisos.filter(sale) : [];
  // Con varios activos, galería (por defecto) o solo el primero, según el interruptor del editor.
  const avisos = datos.galeria === false ? aqui.slice(0, 1) : aqui;
  if (avisos.length) esperarSinAviso().then(() => pintar(avisos));
}
