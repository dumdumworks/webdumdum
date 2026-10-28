// Enlaces que bajan a una sección de la propia página (data-ir). Como la web
// lleva <base href="/">, un href="#id" suelto te saca a la portada: el enlace
// lleva su ruta completa (/comidas-empresa#id), que sin JS salta de golpe, y aquí
// se convierte en un scroll suave que deja la sección justo bajo la barra superior.
import { $, $$ } from "./nucleo.js";

export function ir() {
  $$("a[data-ir]").forEach((a) => {
    const objetivo = document.getElementById(a.hash.slice(1));
    if (!objetivo) return;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const topbar = $(".topbar");
      objetivo.style.scrollMarginTop = (topbar ? topbar.offsetHeight : 0) + 24 + "px";
      const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
      objetivo.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "start" });
    });
  });
}
