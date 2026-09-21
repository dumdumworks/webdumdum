// Utilidades mínimas que comparten las islas. Sin dependencias.
export const $ = (sel, raiz = document) => raiz.querySelector(sel);
export const $$ = (sel, raiz = document) => Array.prototype.slice.call(raiz.querySelectorAll(sel));
export const emitir = (nombre, detail) => window.dispatchEvent(new CustomEvent(nombre, { detail }));

// Atrapa el foco dentro de un diálogo: lo lleva al propio diálogo (no al primer
// control: en iOS eso pintaba el anillo azul de foco sobre la X al abrir con el
// dedo), mantiene Tab/Shift+Tab dentro y, al soltar, devuelve el foco a quien
// lo tenía. Con Tab se entra al primer control como siempre.
const ENFOCABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';
export function atraparFoco(cont) {
  const previo = document.activeElement;
  const enfocables = () => $$(ENFOCABLE, cont)
    .filter((el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement);
  if (!cont.hasAttribute("tabindex")) cont.setAttribute("tabindex", "-1");
  try { cont.focus({ preventScroll: true }); } catch (e) {}
  const onKey = (e) => {
    if (e.key !== "Tab") return;
    const items = enfocables();
    if (!items.length) { e.preventDefault(); return; }
    const ini = items[0], fin = items[items.length - 1];
    const activo = document.activeElement;
    const fuera = !cont.contains(activo);
    // Desde el propio diálogo, Shift+Tab iría al elemento anterior de la página.
    if (e.shiftKey ? (activo === ini || activo === cont || fuera) : (activo === fin || fuera)) {
      e.preventDefault();
      (e.shiftKey ? fin : ini).focus();
    }
  };
  document.addEventListener("keydown", onKey, true);
  return () => {
    document.removeEventListener("keydown", onKey, true);
    if (previo && previo.focus) { try { previo.focus(); } catch (e) {} }
  };
}

// Bloquea el scroll del fondo mientras hay un visor abierto SIN que la página
// salte: compensa el ancho de la barra de scroll con padding. Devuelve la
// función que lo deshace.
export function bloquearScroll() {
  const barra = window.innerWidth - document.documentElement.clientWidth;
  const previo = { overflow: document.body.style.overflow, padding: document.body.style.paddingRight };
  document.body.style.overflow = "hidden";
  if (barra > 0) document.body.style.paddingRight = barra + "px";
  return () => {
    document.body.style.overflow = previo.overflow;
    document.body.style.paddingRight = previo.padding;
  };
}

// Deslizar con el dedo (visores): el eje se decide al superar 8px y solo el
// horizontal arrastra el elemento; al soltar, si pasó del 20% del ancho de la
// pantalla, avisa con -1 (atrás) o 1 (adelante) y el elemento vuelve animado.
// alSoltar puede devolver una promesa (la foto nueva terminando de decodificar):
// se espera antes de animar la vuelta, si no, la foto vieja se queda pintada
// esos milisegundos y la animación "adelanta" a un cambio que aún no ha
// pasado — se ve como si volviera atrás y luego, de golpe, cambiase.
export function deslizar(el, alSoltar) {
  let x0 = null, y0 = null, eje = null, dx = 0;
  el.addEventListener("touchstart", (e) => {
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; eje = null; dx = 0;
    el.style.transition = "none";
  }, { passive: true });
  el.addEventListener("touchmove", (e) => {
    if (x0 === null) return;
    dx = e.touches[0].clientX - x0;
    const dy = e.touches[0].clientY - y0;
    if (eje === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) eje = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    if (eje === "x") el.style.transform = `translateX(${dx}px)`;
  }, { passive: true });
  el.addEventListener("touchend", async () => {
    if (eje === "x") {
      const umbral = window.innerWidth * 0.2;
      if (dx <= -umbral) await alSoltar(1); else if (dx >= umbral) await alSoltar(-1);
    }
    el.style.transition = "transform 0.25s cubic-bezier(0.16,1,0.3,1)";
    el.style.transform = "translateX(0)";
    x0 = null; eje = null;
  });
}

// Teclado de un visor: Escape cierra, flechas navegan. Devuelve el que lo quita.
export function tecladoVisor(cerrar, ir) {
  const onKey = (e) => {
    if (e.key === "Escape") cerrar();
    else if (e.key === "ArrowLeft") ir(-1);
    else if (e.key === "ArrowRight") ir(1);
  };
  document.addEventListener("keydown", onKey);
  return () => document.removeEventListener("keydown", onKey);
}

// Scroll animado de la página hasta `hasta` (px), con el mismo ease-out cúbico
// que el resto de la web: arranca con ritmo y llega frenando.
export function desplazarA(hasta, duracion, cont = window) {
  const desde = cont === window ? window.scrollY : cont.scrollTop;
  const dist = hasta - desde;
  if (Math.abs(dist) < 2) return;
  const t0 = performance.now();
  const ease = (x) => 1 - Math.pow(1 - x, 3);
  const paso = (ahora) => {
    const p = Math.min((ahora - t0) / duracion, 1);
    const y = desde + dist * ease(p);
    if (cont === window) window.scrollTo(0, y); else cont.scrollTop = y;
    if (p < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}
