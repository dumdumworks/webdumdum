// Flotante "Pide ya" (solo móvil): se puede arrastrar; un toque lo abre. Pierde
// opacidad mientras se hace scroll y la recupera al parar.
import { $ } from "./nucleo.js";
import { abrirPide } from "./modales.js";

export function flotante() {
  const fab = $("[data-fab]");
  if (!fab) return;
  // El clic lo gestiona aquí el puntero (para distinguir toque de arrastre),
  // así que se anula el escuchador genérico de data-pide de modales.js.
  fab.addEventListener("click", (e) => e.stopImmediatePropagation(), true);

  let d = null; // arrastre en curso: { dx, dy, sx, sy, movido }
  fab.addEventListener("pointerdown", (e) => {
    const r = fab.getBoundingClientRect();
    d = { dx: e.clientX - r.left, dy: e.clientY - r.top, sx: e.clientX, sy: e.clientY, movido: false };
    fab.setPointerCapture(e.pointerId);
  });
  fab.addEventListener("pointermove", (e) => {
    if (!d) return;
    // Solo cuenta como arrastre si se mueve más de 6px (un toque normal no llega).
    if (Math.abs(e.clientX - d.sx) > 6 || Math.abs(e.clientY - d.sy) > 6) d.movido = true;
    if (!d.movido) return;
    const w = fab.offsetWidth, h = fab.offsetHeight;
    const x = Math.max(8, Math.min(e.clientX - d.dx, window.innerWidth - w - 8));
    const y = Math.max(8, Math.min(e.clientY - d.dy, window.innerHeight - h - 8));
    Object.assign(fab.style, { left: x + "px", top: y + "px", right: "auto", bottom: "auto" });
  });
  fab.addEventListener("pointerup", (e) => {
    const fueToque = d && !d.movido;
    d = null;
    fab.releasePointerCapture(e.pointerId);
    if (fueToque) abrirPide("inicio");
  });

  let timer = null;
  window.addEventListener("scroll", () => {
    fab.classList.add("is-scrolling");
    clearTimeout(timer);
    timer = setTimeout(() => fab.classList.remove("is-scrolling"), 600);
  }, { passive: true });
}
