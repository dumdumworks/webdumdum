// Hamburguesa de la topbar (solo móvil): despliega el panel de enlaces.
import { $ } from "./nucleo.js";

export function menuMovil() {
  const btn = $("[data-burger]");
  const barra = btn && btn.closest(".topbar");
  if (!barra) return;
  btn.addEventListener("click", () => {
    const abierto = barra.classList.toggle("menu-open");
    btn.setAttribute("aria-expanded", String(abierto));
    btn.setAttribute("aria-label", abierto ? btn.dataset.cerrar : btn.dataset.abrir);
  });
}
