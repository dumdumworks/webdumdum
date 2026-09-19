// Vídeos de YouTube (Eventos → Universo). La página lleva la miniatura con un
// botón de play (sin nada de YouTube) y el reproductor real se incrusta cuando
// el vídeo se ACERCA a la pantalla, sin autoplay: así, al llegar, el toque cae
// dentro del reproductor y arranca a la primera. Crearlo justo al tocar (con
// autoplay) obligaba en iOS a un segundo toque: el gesto no llega a una ventana
// que aún no existía. Si alguien toca la miniatura antes del relevo (scroll muy
// rápido), se incrusta al momento con autoplay, que es lo mejor que se puede.
import { $$ } from "./nucleo.js";

const MARGEN = "800px 0px";

function reproductor(b, autoplay) {
  const f = document.createElement("iframe");
  f.src = `https://www.youtube.com/embed/${b.dataset.youtube}${autoplay ? "?autoplay=1&playsinline=1" : "?playsinline=1"}`;
  f.title = b.getAttribute("aria-label");
  f.style.cssText = "width:100%;height:100%;border:0;display:block";
  f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  f.allowFullscreen = true;
  f.setAttribute("data-cookieconsent", "ignore");
  b.replaceWith(f);
}

export function embeds() {
  const facades = $$("[data-youtube]");
  if (!facades.length) return;
  facades.forEach((b) => b.addEventListener("click", () => reproductor(b, true)));
  if (typeof IntersectionObserver === "undefined") return;
  const io = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      // Solo el que está a la vista de su slider; los escondidos, al mostrarse.
      if (!e.target.closest(".ev-slider-slot").hidden) reproductor(e.target, false);
    });
  }, { rootMargin: MARGEN });
  facades.forEach((b) => io.observe(b));
}
