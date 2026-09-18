// Galería de fotos (src/html/galeria.mjs): flechas, contador de posición,
// carga progresiva, rueda del ratón en escritorio y lightbox. Es la lógica del
// GallerySlider de pages.jsx sin React.
import { $, $$, atraparFoco, bloquearScroll, deslizar, tecladoVisor } from "./nucleo.js";

const MOVIL = "(max-width: 879px)";
const pad = (n) => String(n).padStart(2, "0");

export function galerias() {
  $$("[data-galeria]").forEach(montar);
}

function montar(raiz) {
  const pista = $("[data-galeria-pista]", raiz);
  const slots = $$(".ev-slider-slot", pista);
  const total = slots.length;
  const textos = JSON.parse(raiz.dataset.textos);
  // Datos de cada foto, salgan de la <img> ya montada o del hueco que la espera.
  const fotos = slots.map((s) => {
    const e = s.firstElementChild;
    return e.classList.contains("ev-slider-ph") ? null
      : { src: e.dataset.src || e.getAttribute("src"), alt: e.dataset.alt || e.alt, pos: e.dataset.pos || e.style.objectPosition };
  });

  // ── Carga progresiva: hasta dos fotos por delante de donde has llegado. El
  //    límite solo sube: desmontar las de atrás cancelaba descargas a medias.
  let hasta = 2;
  const montarHasta = (n) => {
    hasta = Math.max(hasta, n);
    slots.forEach((s, k) => {
      const e = s.firstElementChild;
      if (k > hasta || !e.classList.contains("ev-slider-espera")) return;
      const img = document.createElement("img");
      img.src = e.dataset.src; img.srcset = e.dataset.srcset; img.sizes = e.dataset.sizes;
      img.alt = e.dataset.alt; img.loading = "lazy"; img.decoding = "async";
      img.style.objectPosition = e.dataset.pos; img.style.cursor = "pointer";
      img.dataset.foto = e.dataset.foto;
      e.replaceWith(img);
    });
  };

  // ── Posición: lo que avanza una foto se mide del propio slot (en móvil ocupa
  //    la pista entera y en el carril de escritorio la mitad).
  let idx = 0;
  const paso = () => {
    const a = slots[0].getBoundingClientRect().width;
    return a + (parseFloat(getComputedStyle(pista).columnGap) || 0);
  };
  const irA = (i) => {
    animando = false;   // manda la flecha, no lo que quedara rodando
    destino = i * paso();
    pista.scrollTo({ left: destino, behavior: "smooth" });
  };
  $$("[data-galeria-ir]", raiz).forEach((b) => b.addEventListener("click", () => {
    irA(Math.max(0, Math.min(total - 1, idx + Number(b.dataset.galeriaIr))));
  }));
  pista.addEventListener("scroll", () => {
    // Solo se reengancha el destino cuando NO hay animación en curso; si no, la
    // propia animación lo igualaría a la posición actual y se frenaría sola.
    if (!animando) destino = pista.scrollLeft;
    idx = Math.max(0, Math.min(total - 1, Math.round(pista.scrollLeft / paso())));
    montarHasta(idx + 2);
  }, { passive: true });

  // ── Rueda (solo escritorio): el scroll vertical del ratón mueve las fotos.
  //    Se anima hacia un destino con rAF: un ratón de rueda salta de 100 en 100
  //    y sin esto iría a tirones; un trackpad ya va suave. Así van igual.
  let destino = 0, animando = false, ultimo = -1;
  const parar = () => { animando = false; ultimo = -1; };
  const avanzar = () => {
    // Si el scroll no está donde lo dejó el fotograma anterior, lo ha movido
    // otra cosa (flechas, arrastre) y manda ella: la animación se abandona.
    if (ultimo >= 0 && Math.abs(pista.scrollLeft - ultimo) > 2) { destino = pista.scrollLeft; parar(); return; }
    const dif = destino - pista.scrollLeft;
    if (Math.abs(dif) < 0.5) { pista.scrollLeft = destino; parar(); return; }
    pista.scrollLeft += dif * 0.18;
    ultimo = pista.scrollLeft;
    requestAnimationFrame(avanzar);
  };
  pista.addEventListener("wheel", (e) => {
    if (matchMedia(MOVIL).matches) return;
    const max = pista.scrollWidth - pista.clientWidth;
    if (max <= 0) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    // En los extremos NO se captura: el scroll sigue a la página. Atrapar la
    // rueda al final del carril convierte la galería en una trampa.
    if ((d < 0 && pista.scrollLeft <= 0) || (d > 0 && pista.scrollLeft >= max - 1)) return;
    e.preventDefault();
    destino = Math.max(0, Math.min(max, destino + d));
    if (!animando) { animando = true; requestAnimationFrame(avanzar); }
  }, { passive: false });

  // ── Lightbox: se abre al pulsar una foto.
  pista.addEventListener("click", (e) => {
    const img = e.target.closest("img[data-foto]");
    if (img) abrirLightbox(fotos, Number(img.dataset.foto), textos);
  });
}

// ── Visor ampliado. Navega con flechas y teclado, se cierra con la X, con clic
//    en el fondo y con Escape; en móvil se desliza con el dedo.
function abrirLightbox(fotos, inicio, textos) {
  const total = fotos.length;
  let n = inicio;
  const ov = document.createElement("div");
  ov.className = "lb-overlay";
  ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", textos.galeria);
  ov.innerHTML = `<div class="lb-head"><span class="tiny"></span><button type="button" class="lb-close" aria-label="${textos.cerrar}">✕</button></div>`
    + `<button type="button" class="lb-nav lb-prev" aria-label="${textos.anterior}">←</button>`
    + `<div class="lb-stage"><img class="lb-img" alt="" draggable="false"></div>`
    + `<button type="button" class="lb-nav lb-next" aria-label="${textos.siguiente}">→</button>`;
  const cuenta = $(".lb-head .tiny", ov), img = $("img", ov), escenario = $(".lb-stage", ov);
  const pintar = () => {
    const f = fotos[n];
    img.src = f.src; img.style.objectPosition = f.pos;
    cuenta.textContent = pad(n + 1) + " / " + pad(total);
  };
  const ir = (d) => { n = (n + d + total) % total; if (!fotos[n]) return ir(d); pintar(); };

  const desbloquear = bloquearScroll();
  const sinTeclado = tecladoVisor(() => cerrar(), ir);
  const cerrar = () => {
    sinTeclado();
    desbloquear();
    soltar();
    ov.remove();
  };

  ov.addEventListener("click", cerrar);
  $$(".lb-head, .lb-stage", ov).forEach((el) => el.addEventListener("click", (e) => e.stopPropagation()));
  $(".lb-close", ov).addEventListener("click", cerrar);
  $(".lb-prev", ov).addEventListener("click", (e) => { e.stopPropagation(); ir(-1); });
  $(".lb-next", ov).addEventListener("click", (e) => { e.stopPropagation(); ir(1); });
  deslizar(escenario, ir);

  pintar();
  document.body.appendChild(ov);
  // Después de insertarlo: fuera del DOM no hay nada enfocable.
  const soltar = atraparFoco(ov);
}
