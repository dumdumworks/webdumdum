// La home: la flecha del hero baja una pantalla con el ease-out de la web, y
// la celda de Merch enseña el aviso "Próximamente" cinco segundos.
import { $, desplazarA } from "./nucleo.js";

export function home() {
  const bajar = $("[data-bajar]");
  if (bajar) bajar.addEventListener("click", () => desplazarA(window.scrollY + window.innerHeight * 1.05, 900));
  const toast = $(".home-toast"), celda = $("[data-toast]");
  if (!toast || !celda) return;
  let timer = null;
  celda.addEventListener("click", (e) => {
    e.preventDefault();
    toast.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(() => { toast.hidden = true; }, 5000);
  });
}
