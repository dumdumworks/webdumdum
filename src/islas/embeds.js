// Vídeos de YouTube (Eventos → Universo): la página lleva la miniatura con un
// botón de play; al pulsar, se cambia por el reproductor con autoplay. Así el
// JS de YouTube solo se carga si alguien quiere ver el vídeo.
import { $$ } from "./nucleo.js";

export function embeds() {
  $$("[data-youtube]").forEach((b) => b.addEventListener("click", () => {
    const f = document.createElement("iframe");
    f.src = `https://www.youtube.com/embed/${b.dataset.youtube}?autoplay=1`;
    f.title = b.getAttribute("aria-label");
    f.style.cssText = "width:100%;height:100%;border:0;display:block";
    f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    f.allowFullscreen = true;
    b.replaceWith(f);
  }));
}
