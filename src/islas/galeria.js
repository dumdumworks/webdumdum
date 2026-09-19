// Galerías y sliders (src/html/galeria.mjs y embeds.mjs): flechas, contador,
// carga progresiva de fotos, rueda del ratón en escritorio y visor ampliado.
// Es la lógica del GallerySlider (y de los sliders de Eventos) de pages.jsx.
//   carril    → todas las fotos en fila (rueda en escritorio, snap en móvil).
//   paginado  → páginas de N a la vista con flechas; en móvil, carrusel con
//               snap salvo que la galería pida paginado también ahí (embeds).
import { $, $$ } from "./nucleo.js";
import { abrirVisorFotos, abrirVisorPlatos } from "./visores.js";

const MOVIL = matchMedia("(max-width: 879px)");
const pad = (n) => String(n).padStart(2, "0");

export function galerias() {
  $$("[data-galeria]").forEach(montar);
}

function montar(raiz) {
  const pista = $("[data-galeria-pista]", raiz);
  const slots = $$(".ev-slider-slot", pista);
  const total = slots.length;
  const cuenta = $("[data-galeria-cuenta]", raiz);
  const visibles = Number(raiz.dataset.galeriaVisibles || 2);
  const paginado = raiz.dataset.galeriaModo === "paginado";
  const paginadoMovil = raiz.dataset.galeriaMovil === "paginado";
  // ¿Ahora mismo se pasa de página (en vez de deslizar)?
  const pagina = () => paginado && (paginadoMovil || !MOVIL.matches);

  // ── Carga progresiva: la foto se monta cuando su hueco entra en juego (hasta
  //    dos por delante al deslizar; la página entera al paginar). El límite solo
  //    sube: desmontar las de atrás cancelaba descargas a medias.
  let hasta = 2;
  const montarFoto = (slot) => {
    const e = slot.firstElementChild;
    if (!e) return;
    // Embeds (reels, vídeos): el src espera en data-src hasta que toca.
    if (e.tagName === "IFRAME") { if (e.dataset.src) { e.src = e.dataset.src; delete e.dataset.src; } return; }
    if (!e.classList.contains("ev-slider-espera")) return;
    const img = document.createElement("img");
    img.src = e.dataset.src;
    if (e.dataset.srcset) { img.srcset = e.dataset.srcset; img.sizes = e.dataset.sizes; }
    img.alt = e.dataset.alt; img.loading = "lazy"; img.decoding = "async";
    img.style.objectPosition = e.dataset.pos; img.style.cursor = "pointer";
    img.dataset.foto = e.dataset.foto;
    if (e.dataset.nombre) img.dataset.nombre = e.dataset.nombre;
    e.replaceWith(img);
  };
  const montarHasta = (n) => { hasta = Math.max(hasta, n); slots.forEach((s, k) => { if (k <= hasta) montarFoto(s); }); };

  // ── Paginado: se ven `visibles` huecos desde idx (con vuelta al principio);
  //    el resto va con hidden. `order` mantiene la secuencia cuando da la vuelta.
  let idx = 0;
  const pintarPagina = () => {
    if (!pagina()) {
      slots.forEach((s) => { s.hidden = false; s.style.order = ""; });
      return;
    }
    slots.forEach((s) => { s.hidden = true; s.style.order = ""; });
    for (let k = 0; k < Math.min(visibles, total); k++) {
      const s = slots[(idx + k) % total];
      s.hidden = false; s.style.order = String(k);
      montarFoto(s);
    }
    // La página siguiente se monta ya, escondida: al pasar no espera a la red.
    for (let k = visibles; k < Math.min(2 * visibles, total); k++) montarFoto(slots[(idx + k) % total]);
  };
  const pintarCuenta = () => { if (cuenta) cuenta.textContent = pad(idx + 1); };

  // ── Posición al deslizar: lo que avanza una foto se mide del propio hueco.
  let destino = 0, animando = false, ultimo = -1;
  const paso = () => slots[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(pista).columnGap) || 0);
  const irA = (i) => {
    animando = false;   // manda la flecha, no lo que quedara rodando
    destino = i * paso();
    pista.scrollTo({ left: destino, behavior: "smooth" });
  };
  $$("[data-galeria-ir]", raiz).forEach((b) => b.addEventListener("click", () => {
    const d = Number(b.dataset.galeriaIr);
    if (pagina()) {
      const salto = Math.min(visibles, total);
      idx = (idx + d * salto + total) % total;
      pintarPagina(); pintarCuenta();
    } else {
      irA(Math.max(0, Math.min(total - 1, idx + d)));
    }
  }));
  pista.addEventListener("scroll", () => {
    if (pagina()) return;
    // Solo se reengancha el destino cuando NO hay animación en curso; si no, la
    // propia animación lo igualaría a la posición actual y se frenaría sola.
    if (!animando) destino = pista.scrollLeft;
    idx = Math.max(0, Math.min(total - 1, Math.round(pista.scrollLeft / paso())));
    montarHasta(idx + 2);
    pintarCuenta();
  }, { passive: true });
  // Al cambiar de aparato (girar, redimensionar) cambia el modo: se repinta.
  MOVIL.addEventListener("change", () => { idx = 0; pintarPagina(); pintarCuenta(); if (!pagina()) pista.scrollTo({ left: 0 }); });

  // ── Rueda (solo carril de escritorio): el scroll vertical del ratón mueve las
  //    fotos, animado hacia un destino con rAF para que un ratón de rueda (que
  //    salta de 100 en 100) vaya tan suave como un trackpad.
  if (raiz.dataset.galeriaModo === "carril") {
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
      if (MOVIL.matches) return;
      const max = pista.scrollWidth - pista.clientWidth;
      if (max <= 0) return;
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      // En los extremos NO se captura: el scroll sigue a la página.
      if ((d < 0 && pista.scrollLeft <= 0) || (d > 0 && pista.scrollLeft >= max - 1)) return;
      e.preventDefault();
      destino = Math.max(0, Math.min(max, destino + d));
      if (!animando) { animando = true; requestAnimationFrame(avanzar); }
    }, { passive: false });
  }

  // ── Visor: se abre al pulsar una foto. Las galerías de platos usan el de la carta.
  const fotos = slots.map((s) => {
    const e = s.firstElementChild;
    return !e || e.classList.contains("ev-slider-ph") ? null
      : { src: e.dataset.src || e.getAttribute("src"), pos: e.dataset.pos || e.style.objectPosition, nombre: e.dataset.nombre || "" };
  });
  if (raiz.dataset.galeriaVisor) {
    const textos = JSON.parse(raiz.dataset.textos);
    textos.etiqueta = raiz.dataset.galeriaEtiqueta || "";
    const conFoto = fotos.map((f, n) => f && { ...f, n }).filter(Boolean);
    pista.addEventListener("click", (e) => {
      const img = e.target.closest("img[data-foto]");
      if (!img) return;
      const k = conFoto.findIndex((f) => f.n === Number(img.dataset.foto));
      if (raiz.dataset.galeriaVisor === "platos") abrirVisorPlatos(conFoto, k);
      else abrirVisorFotos(conFoto, k, textos);
    });
  }

  pintarPagina();
  if (!pagina()) montarHasta(hasta);
  pintarCuenta();
}
