// ─────────────────────────────────────────────────────────────
// Avisos: botón flotante redondo a la izquierda, con la cara de DUM DUM como foto de perfil, un
// aro verde (el de «mejores amigos» de Instagram) y el número de avisos como una notificación. Despliega una tarjeta
// con un aviso: imagen o vídeo y un botón. Con varios avisos, la tarjeta se comporta como las
// stories de Instagram (ver «historias» más abajo).
// Es un bundle APARTE (assets/avisos.<hash>.js, con su CSS): no va en el de las islas. Lo carga
// islas/avisos-carga.js, ya con los avisos activos en window.dumdumAvisos, así que aquí no hay
// que leer ni filtrar nada: solo pintar.
// La imagen o el vídeo NO se piden hasta que alguien abre la tarjeta.
// ─────────────────────────────────────────────────────────────
import { atenuarAlScroll } from "./nucleo.js";
import { INSTAGRAM_URL } from "../html/enlaces.mjs";

const EN = document.documentElement.lang === "en";
const t = (es, en) => (EN && en ? en : es);

// La foto de perfil es el favicon de la web (ya está en el repo; no añade ningún archivo).
const AVATAR = "/favicon-192x192.png";
// El nombre que firma cada aviso, como el de una story: lleva al Instagram de DUM DUM.
const PERFIL = "dumdum.plings";
// Lo último que ha visto este navegador (los ids de los avisos): hasta que cambien, el aro va en
// gris y sin número, como una story ya vista.
const VISTO = "dumdum.avisos";
// Ya ha salido el botón en esta visita: en las demás páginas aparece sin esperas ni rebote ("1").
const ENTRADA = "dumdum.entrada";
// Vídeos guardados en el navegador (Cache API): tras verlos una vez se reproducen sin red, también al
// cambiar de página o volver otro día (Safari no reutiliza el vídeo por su caché normal).
const CACHE = "dumdum-avisos";
const absoluta = (src) => new URL(src, location.href).href;
async function enCache(src) {
  try {
    const r = await (await caches.open(CACHE)).match(src);
    return r ? URL.createObjectURL(await r.blob()) : "";
  } catch (e) { return ""; }
}
async function guardarEnCache(src) {
  try {
    const c = await caches.open(CACHE);
    if (await c.match(src)) return;
    const r = await fetch(src);   // entero (un 206 no cabe en la Cache API)
    if (r.status === 200) await c.put(src, r);
  } catch (e) { /* sin Cache API o sin sitio: se vuelve a bajar */ }
}
// Fuera lo guardado de avisos que ya no están activos.
async function limpiarCache(vigentes) {
  try {
    const c = await caches.open(CACHE), ok = vigentes.map(absoluta);
    for (const k of await c.keys()) if (!ok.includes(k.url)) await c.delete(k);
  } catch (e) { /* idem */ }
}
// Si ha silenciado los vídeos, se recuerda mientras dure la visita ("0" = silenciado).
const SONIDO = "dumdum.sonido";
const ICO_SON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/></svg>';
const ICO_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 3l18 18M21 3L3 21"/></svg>';
const ICO_MUDO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>';

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
// `mudo`: los vídeos suenan (la tarjeta se abre con un toque, así que el navegador lo permite) salvo que
// quien la ve los haya silenciado con el botón del altavoz.
function medio(m, bucle, mudo, local) {
  if (m.tipo === "video") {
    const v = document.createElement("video");
    v.muted = mudo; v.loop = bucle; v.playsInline = true; v.preload = "auto";
    if (m.poster) v.poster = m.poster;
    v.src = local || m.src;
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
const IMAGEN_MS = 5000, RETENER_MS = 200, UMBRAL_PX = 8;
// Empujar la tarjeta: lo que hay que apartarla (px) o la rapidez del gesto (px/ms) para que salga volando,
// la ventana de tiempo (ms) con la que se mide esa rapidez y lo que dura la salida (ms).
const CIERRE_PX = 90, CIERRE_V = 0.5, VENTANA_V = 100, SALIDA_MS = 320;
const sinMovimiento = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function pintar(avisos, sinEntrada) {
  // En las páginas siguientes de la visita el HTML ya trae el botón puesto (html/shell.mjs, botonAvisos):
  // se adopta tal cual, sin recrearlo, para que no parpadee. Si no, se crea con el mismo marcado.
  const puesto = document.querySelector(".cierto-fab");
  const boton = puesto || document.createElement("button");
  let ico, txt, num;
  if (puesto) {
    ico = boton.querySelector(".cierto-avatar"); txt = boton.querySelector(".sr-only"); num = boton.querySelector(".cierto-num");
  } else {
    boton.type = "button";
    boton.className = "fab cierto-fab";
    boton.setAttribute("aria-expanded", "false");
    boton.setAttribute("aria-controls", "cierto-card");
    ico = document.createElement("span");
    ico.className = "fab-ico cierto-avatar"; ico.setAttribute("aria-hidden", "true");
    const foto = avatar;   // ya descargada y decodificada (ver el final del archivo)
    foto.alt = ""; foto.width = foto.height = 36;
    ico.append(foto);
    // El botón no lleva texto visible; esto es lo que lee un lector de pantalla.
    txt = document.createElement("span");
    txt.className = "sr-only";
    txt.textContent = t("Novedades de DUM DUM", "News from DUM DUM");
    // Como la notificación de una app: cuántos avisos hay, hasta que se abren.
    num = document.createElement("span");
    num.className = "cierto-num"; num.setAttribute("aria-hidden", "true");
    boton.append(ico, txt, num);
  }
  num.textContent = avisos.length;
  const huella = avisos.map((a) => a.id).join(",");
  const marcarVisto = () => { try { localStorage.setItem(VISTO, huella); } catch (e) { /* sin almacenamiento: se vuelve a ver */ } };
  let visto = false;
  try { visto = localStorage.getItem(VISTO) === huella; } catch (e) { /* idem */ }
  boton.classList.toggle("is-visto", visto);

  const tarjeta = document.createElement("aside");
  tarjeta.id = "cierto-card"; tarjeta.className = "cierto-card";
  tarjeta.setAttribute("aria-label", txt.textContent); tarjeta.tabIndex = -1; tarjeta.inert = true;
  const cerrar = document.createElement("button");
  cerrar.type = "button"; cerrar.className = "cierto-x"; cerrar.innerHTML = ICO_X;
  cerrar.setAttribute("aria-label", t("Cerrar", "Close"));
  // Historias: con varios avisos, la tarjeta se porta como las stories de Instagram. Barritas de
  // progreso arriba; avanza sola (IMAGEN_MS por imagen, lo que dure el vídeo); un toque a la derecha
  // pasa a la siguiente y uno en el primer tercio vuelve a la anterior; mantener pulsado pausa y
  // esconde la interfaz; empujarla en cualquier dirección la cierra; al acabar la última, se cierra. Con un solo aviso
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
  dentro.append(pista);
  // Altavoz: solo si algún aviso es un vídeo, y solo visible mientras se ve uno.
  let son = null, sonido = true;
  try { sonido = sessionStorage.getItem(SONIDO) !== "0"; } catch (e) { /* sin almacenamiento: suena */ }
  if (avisos.some((a) => a.media.tipo === "video")) {
    son = document.createElement("button");
    son.type = "button"; son.className = "cierto-son";
  }
  // Cabecera como la de una story, bajo las barras: la foto y el nombre a la izquierda (enlace al
  // Instagram) y, a la derecha, el altavoz (si hay vídeo) y la ✕.
  const cab = document.createElement("div"); cab.className = "cierto-cab";
  const perfil = document.createElement("a");
  perfil.className = "cierto-perfil"; perfil.href = INSTAGRAM_URL; perfil.target = "_blank"; perfil.rel = "noreferrer";
  const fotoPerfil = new Image();
  fotoPerfil.src = AVATAR; fotoPerfil.alt = ""; fotoPerfil.width = fotoPerfil.height = 32;
  perfil.append(fotoPerfil, PERFIL);
  const acciones = document.createElement("div"); acciones.className = "cierto-acciones";
  acciones.append(...(son ? [son, cerrar] : [cerrar]));
  cab.append(perfil, acciones);
  dentro.append(cab);
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
  if (!puesto) document.body.append(boton);
  document.body.append(tarjeta);
  if (sinEntrada) boton.classList.add("sin-entrada");
  try { sessionStorage.setItem(ENTRADA, "1"); } catch (e) { /* idem */ }
  // Vídeos ya guardados en este navegador, listos para usarse sin red; y limpieza de los que sobran.
  diapositivas.forEach((d) => { if (d.a.media.tipo === "video") enCache(d.a.media.src).then((u) => { d.local = u; }); });
  limpiarCache(avisos.filter((a) => a.media.tipo === "video").map((a) => a.media.src));
  atenuarAlScroll(boton);
  // Ya salió en esta visita: queda puesto de entrada, como «Pide ya» (sin fundido ni rebote).
  if (!puesto) { if (sinEntrada) boton.classList.add("is-on"); else requestAnimationFrame(() => boton.classList.add("is-on")); }
  // Si al comprobar el JSON ya no hay avisos activos (avisos-carga.js), se retira todo lo pintado.
  window.dumdumAvisosQuitar = () => { boton.remove(); tarjeta.remove(); };

  let abierta = false, animando = false, actual = 0;
  let sostenido = false, arrastrando = false, foco = false;   // lo que detiene la historia
  diapositivas.forEach((d, k) => { d.el.inert = k !== 0; });   // solo la visible entra en el orden de tabulación

  // El archivo de cada historia no se pide hasta que hace falta: la visible y la siguiente, al abrir
  // (así quien solo abre y cierra no descarga el resto).
  const cargar = (i) => {
    const d = diapositivas[i];
    if (!d || d.media.firstChild) return;
    const m = medio(d.a.media, !avanza, !sonido, d.local);
    if (avanza && m.tagName === "VIDEO") m.addEventListener("ended", () => { if (actual === i) siguiente(); });
    // Con el vídeo ya listo para verse entero, se guarda para las próximas veces (si no estaba guardado).
    if (m.tagName === "VIDEO" && !d.local) m.addEventListener("canplaythrough", () => guardarEnCache(d.a.media.src), { once: true });
    d.media.append(m);
  };
  // El vídeo arranca ya durante la animación de apertura: así el play() cae dentro del toque que abre la
  // tarjeta, y Safari (que solo deja sonar lo que empieza con un gesto) no lo silencia.
  const pausado = () => !abierta || sostenido || arrastrando || foco || document.hidden;
  const pintarSonido = () => {
    if (!son) return;
    son.innerHTML = sonido ? ICO_SON : ICO_MUDO;
    son.setAttribute("aria-label", sonido ? t("Silenciar", "Mute") : t("Activar el sonido", "Turn sound on"));
  };
  // Si el navegador no deja sonar un vídeo (NotAllowedError: autoplay con sonido), sigue mudo y el
  // altavoz lo indica: un toque en él ya es un gesto y lo activa. Cualquier otro error se ignora.
  function reproducir(v) {
    v.play().catch((e) => {
      if (v.muted || !e || e.name !== "NotAllowedError") return;
      v.muted = true; sonido = false; pintarSonido();
      v.play().catch(() => {});
    });
  }
  // Reproduce o detiene el vídeo visible según el estado, y esconde la interfaz mientras se mantiene pulsado.
  function aplicar() {
    tarjeta.classList.toggle("is-pausado", sostenido);
    diapositivas.forEach((d, i) => {
      const v = d.media.querySelector("video");
      if (!v) return;
      v.muted = !sonido;
      if (i === actual && !pausado()) reproducir(v); else v.pause();
      // Cerrada la tarjeta, cada vídeo vuelve a su primer fotograma: al reabrirla ya está listo y
      // cargado, sin póster ni espera.
      if (!abierta && v.currentTime > 0) v.currentTime = 0;
    });
  }
  if (son) son.addEventListener("click", () => {
    sonido = !sonido; pintarSonido();
    try { sessionStorage.setItem(SONIDO, sonido ? "1" : "0"); } catch (e) { /* idem */ }
    aplicar();
  });
  function mostrar(i) {
    actual = i; avance = 0;
    diapositivas.forEach((d, k) => { d.el.inert = k !== i; });
    barras.forEach((f, k) => { f.style.transform = k < i || (k === i && n > 1 && !avanza) ? "scaleX(1)" : "scaleX(0)"; });
    cargar(i); if (n > 1) cargar(i + 1);
    const v = diapositivas[i].media.querySelector("video");
    if (v) v.currentTime = 0;   // cada vez que se ve, empieza desde el principio
    if (son) { son.hidden = !v; pintarSonido(); }
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

  // Gesto sobre la imagen: toque (pasa), mantener pulsado (pausa) y empujar en cualquier dirección: la
  // tarjeta sigue al dedo y, si se la aparta lo bastante o se la lanza con ganas, sale volando de la pantalla
  // en esa dirección y deja el botón redondo en su sitio; si no, vuelve. El botón de la tarjeta queda fuera:
  // es un enlace normal.
  let dedo = null;
  // Cuánto se ha apartado y la escala que lo acompaña: la tarjeta se encoge un poco al alejarse, como si se
  // la empujara hacia dentro de la pantalla.
  const empuje = (dx, dy) => "translate(" + dx + "px," + dy + "px) scale(" + (1 - Math.min(Math.hypot(dx, dy) / 900, 0.12)) + ")";
  pista.addEventListener("pointerdown", (e) => {
    if (!abierta || animando || dedo || e.button > 0 || e.target.closest(".cierto-ir")) return;
    dedo = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, dy: 0, muestras: [] };
    dedo.espera = setTimeout(() => { dedo.retenido = true; sostenido = true; aplicar(); }, RETENER_MS);
    pista.setPointerCapture(e.pointerId);
  });
  pista.addEventListener("pointermove", (e) => {
    if (!dedo || e.pointerId !== dedo.id) return;
    const dx = e.clientX - dedo.x, dy = e.clientY - dedo.y;
    if (!dedo.arrastre && Math.hypot(dx, dy) > UMBRAL_PX) {
      dedo.arrastre = true; clearTimeout(dedo.espera);
      sostenido = false; arrastrando = true; aplicar();
    }
    if (!dedo.arrastre) return;
    dedo.dx = dx; dedo.dy = dy;
    tarjeta.style.transform = empuje(dx, dy);
    dedo.muestras.push({ x: e.clientX, y: e.clientY, t: e.timeStamp });
  });
  const soltar = (e) => {
    if (!dedo || e.pointerId !== dedo.id) return;
    const d = dedo; dedo = null;
    clearTimeout(d.espera);
    const cancelado = e.type === "pointercancel";
    sostenido = arrastrando = false;
    if (d.arrastre) {
      // La rapidez es la de los últimos instantes (no la media del gesto): un dedo que se para antes de soltar no lanza nada.
      const m = d.muestras.filter((q) => q.t > e.timeStamp - VENTANA_V);
      const dt = m.length > 1 ? m[m.length - 1].t - m[0].t : 0;
      const vx = dt ? (m[m.length - 1].x - m[0].x) / dt : 0, vy = dt ? (m[m.length - 1].y - m[0].y) / dt : 0;
      const v = Math.hypot(vx, vy), lejos = Math.hypot(d.dx, d.dy);
      const haciaFuera = vx * d.dx + vy * d.dy >= 0;   // un tirón de vuelta hacia donde estaba cancela el empuje
      if (!cancelado && ((lejos > CIERRE_PX && (v < CIERRE_V || haciaFuera)) || (v > CIERRE_V && haciaFuera))) {
        // Sale en la dirección en que iba el dedo; si apenas se movía, en la del desplazamiento.
        const ux = v > CIERRE_V ? vx / v : d.dx / lejos, uy = v > CIERRE_V ? vy / v : d.dy / lejos;
        return expulsar(d.dx, d.dy, ux, uy);
      }
      // Sin llegar al umbral, la tarjeta vuelve a su sitio con el mismo frenado que el resto.
      tarjeta.style.transition = "transform .3s " + EASE;
      tarjeta.style.transform = "";
      setTimeout(() => { tarjeta.style.transition = ""; }, 300);
    } else if (!cancelado && !d.retenido) {
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
  // Cierre por empuje: la tarjeta sigue su camino en la dirección (ux, uy) desde donde la soltó el dedo
  // (dx, dy), encogiéndose y desvaneciéndose hasta salir de la pantalla; entonces el botón vuelve.
  function expulsar(dx, dy, ux, uy) {
    animando = true; abierta = false;
    parar();
    boton.setAttribute("aria-expanded", "false");
    const fuera = () => {
      tarjeta.classList.remove("is-open"); tarjeta.inert = true; tarjeta.style.transform = "";
      boton.style.visibility = "";
      animando = false;
      aplicar();
    };
    if (sinMovimiento()) return fuera();
    const recorrido = Math.hypot(innerWidth, innerHeight);   // la diagonal: más que de sobra para salir por cualquier lado
    const a = tarjeta.animate([
      { transform: empuje(dx, dy), opacity: 1 },
      { transform: "translate(" + (dx + ux * recorrido) + "px," + (dy + uy * recorrido) + "px) scale(0.8)", opacity: 0 },
    ], { duration: SALIDA_MS, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "both" });
    a.onfinish = () => {
      // Se oculta ANTES de soltar la animación: si no, parpadea en su sitio.
      fuera();
      a.cancel();
      boton.animate({ opacity: [0, 1] }, { duration: 250, easing: "ease" });
    };
  }
  const alternar = (e) => { if (!animando) mover(!abierta, e.detail === 0); };
  boton.addEventListener("click", alternar);
  cerrar.addEventListener("click", (e) => { if (!animando && abierta) mover(false, e.detail === 0); });
  // Cierre SIN animación (el botón de la tarjeta te lleva «de una»: nada de enseñar el botón redondo en medio).
  function cerrarYa() {
    abierta = sostenido = arrastrando = false;
    parar();
    boton.setAttribute("aria-expanded", "false");
    tarjeta.classList.remove("is-open"); tarjeta.inert = true; tarjeta.style.transform = "";
    boton.style.visibility = "";
    aplicar();
  }
  // El botón de la tarjeta: si va a OTRA página, la tarjeta se queda tal cual hasta que cambie la página;
  // si abre un modal o salta a un ancla de ESTA página, se esconde de golpe para no quedar delante.
  diapositivas.forEach((d) => d.ir.addEventListener("click", (e) => {
    if (animando || !abierta || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const otraPagina = !d.a.boton.accion && new URL(d.ir.href, location.href).pathname !== location.pathname;
    if (!otraPagina) cerrarYa();
  }));
  // Volver con «atrás» puede traer la página de la caché con la tarjeta aún abierta.
  addEventListener("pageshow", (e) => { if (e.persisted && abierta && !animando) cerrarYa(); });
  document.addEventListener("keydown", (e) => {
    if (!abierta || animando) return;
    if (e.key === "Escape") mover(false, true);
    else if (e.key === "ArrowRight" && actual < n - 1) siguiente();
    else if (e.key === "ArrowLeft") anterior();
  });
}

// El botón no sale antes de los 2 s de la visita (con la página recién cargada no hay prisa), pero en las
// demás páginas de la misma visita aparece enseguida y sin el rebote de entrada. Antes de pintarlo se
// espera a la foto de perfil: que no salga un círculo vacío y luego aparezca el favicon.
const ENTRADA_MS = 2000;
let yaSalio = false;
try { yaSalio = sessionStorage.getItem(ENTRADA) === "1"; } catch (e) { /* sin almacenamiento: con entrada */ }
const avatar = new Image();
avatar.src = AVATAR;
new Promise((ok) => setTimeout(ok, yaSalio ? 0 : Math.max(0, ENTRADA_MS - performance.now())))
  .then(esperarSinAviso)
  .then(() => avatar.decode().catch(() => {}))
  .then(() => { if (window.dumdumAvisos.length) pintar(window.dumdumAvisos, yaSalio); });
