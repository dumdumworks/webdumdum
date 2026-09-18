// ─────────────────────────────────────────────────────────────
// Galería de fotos (el GallerySlider de la web React, en su variante de dos
// fotos a la vista con todas en fila): carrusel con snap en móvil y carril
// movido con la rueda en escritorio. Las dos clases van juntas en la pista:
// cada una manda en su ancho de pantalla, así que no hay que cambiar el
// marcado según el aparato. La lógica (flechas, rueda, lightbox, carga
// progresiva) está en src/islas/galeria.js.
// ─────────────────────────────────────────────────────────────
import { esc } from "./plantilla.mjs";

// Las fotos van todas en fila, así que loading="lazy" no sirve: el navegador
// las da por visibles y las pediría todas al abrir. Se montan solo las tres
// primeras; el resto deja su hueco (el ancho de la pista depende de él) y la
// isla las va montando conforme avanzas.
const MONTADAS = 3;
const pad = (n) => String(n).padStart(2, "0");

export function galeria(i, { fotos, ratio = "3 / 4", etiquetaHueco }) {
  const { t } = i;
  const huecos = fotos.length ? fotos : Array.from({ length: 6 }, () => ({ src: null }));
  const slots = huecos.map((f, n) => {
    let dentro;
    if (!f.src) {
      dentro = `<div class="ev-slider-ph"><span>[ ${esc(etiquetaHueco)} · ${pad(n + 1)} ]</span></div>`;
    } else if (n < MONTADAS) {
      dentro = `<img src="${esc(f.src)}" alt="${esc(f.name || "")}" loading="lazy" decoding="async"`
        + ` style="object-position:${esc(f.pos || "50% 50%")};cursor:pointer" data-foto="${n}">`;
    } else {
      // Hueco liso, no el marcador de rayas: aquí SÍ hay foto, solo que aún no se ha pedido.
      dentro = `<div class="ev-slider-espera" aria-hidden="true" data-foto="${n}" data-src="${esc(f.src)}"`
        + ` data-alt="${esc(f.name || "")}" data-pos="${esc(f.pos || "50% 50%")}"></div>`;
    }
    return `    <div class="ev-slider-slot" style="aspect-ratio:${ratio}">${dentro}</div>`;
  });
  const textos = {
    galeria: t("Galería", "Gallery"), cerrar: t("Cerrar", "Close"),
    anterior: t("Anterior", "Previous"), siguiente: t("Siguiente", "Next"),
  };
  return `<div class="ev-slider ev-slider-cols-2" data-galeria data-textos='${esc(JSON.stringify(textos))}'>
  <div class="ev-slider-head">
    <div class="ev-slider-ctrls">
      <button type="button" class="ev-slider-btn" data-galeria-ir="-1" aria-label="${esc(textos.anterior)}">←</button>
      <button type="button" class="ev-slider-btn" data-galeria-ir="1" aria-label="${esc(textos.siguiente)}">→</button>
    </div>
  </div>
  <div class="ev-slider-track ev-slider-carril ev-slider-track-mobile" data-galeria-pista>
${slots.join("\n")}
  </div>
</div>`;
}
