// ─────────────────────────────────────────────────────────────
// Galería de fotos: el GallerySlider de la web React con las mismas clases.
// Dos modos, según lo que pedía cada página:
//   carril   → todas las fotos en fila; dos a la vista en escritorio movidas
//              con la rueda, carrusel con snap en móvil (fichas de local).
//   paginado → dos a la vista en escritorio, con flechas que cambian de página
//              y contador "Espacio · 01 / 11"; en móvil, carrusel con snap
//              (los sliders de Eventos).
// Las dos clases de pista van juntas: cada una manda en su ancho de pantalla,
// así que el marcado no depende del aparato. La lógica vive en islas/galeria.js.
// ─────────────────────────────────────────────────────────────
import { esc } from "./plantilla.mjs";
import { srcset } from "./imagenes.mjs";

// Las fotos van todas en fila, así que loading="lazy" no sirve: el navegador
// las daría por visibles y las pediría todas al abrir. Se montan solo las tres
// primeras; el resto deja su hueco y la isla las monta conforme hacen falta.
const MONTADAS = 3;
const pad = (n) => String(n).padStart(2, "0");
// En móvil el hueco es la pista entera; en escritorio, la mitad (dos a la vista).
const SIZES = "(max-width: 879px) 100vw, 50vw";

export function galeria(i, { fotos, ratio = "3 / 4", etiquetaHueco, raiz, modo = "carril", etiqueta = null, cta = null, visor = "fotos", huecos = 6 }) {
  const { t } = i;
  const lista = fotos.length ? fotos : Array.from({ length: huecos }, () => ({ src: null }));
  const slots = lista.map((f, n) => {
    let dentro;
    if (!f.src) {
      dentro = `<div class="ev-slider-ph"><span>[ ${esc(etiquetaHueco)} · ${pad(n + 1)} ]</span></div>`;
    } else {
      const ss = srcset(raiz, f.src);
      const comunes = ` data-foto="${n}"${f.name ? ` data-nombre="${esc(f.name)}"` : ""}`;
      dentro = n < MONTADAS
        ? `<img src="${esc(f.src)}"${ss ? ` srcset="${esc(ss)}" sizes="${SIZES}"` : ""} alt="${esc(f.name || "")}" loading="lazy" decoding="async"`
          + ` style="object-position:${esc(f.pos || "50% 50%")};cursor:pointer"${comunes}>`
        // Hueco liso, no el marcador de rayas: aquí SÍ hay foto, solo que aún no se ha pedido.
        : `<div class="ev-slider-espera" aria-hidden="true" data-src="${esc(f.src)}"${ss ? ` data-srcset="${esc(ss)}" data-sizes="${SIZES}"` : ""}`
          + ` data-alt="${esc(f.name || "")}" data-pos="${esc(f.pos || "50% 50%")}"${comunes}></div>`;
    }
    // Enlace por foto (prensa: "Ver noticia →"); sin URL no se pinta.
    if (cta && f.url) dentro += `<a class="ev-slider-cta" href="${esc(f.url)}" target="_blank" rel="noreferrer">${esc(cta)}</a>`;
    return `    <div class="ev-slider-slot" style="aspect-ratio:${ratio}">${dentro}</div>`;
  });
  const textos = {
    galeria: etiqueta || t("Galería", "Gallery"), cerrar: t("Cerrar", "Close"),
    anterior: t("Anterior", "Previous"), siguiente: t("Siguiente", "Next"),
  };
  // Enlace fijo (móvil): un solo botón que no viaja con las fotos y apunta a la
  // noticia que hay a la vista; la isla le cambia el href al deslizar.
  const urls = cta ? lista.map((f) => f.url || "") : null;
  const ctaFija = cta
    ? `\n  <a class="ev-slider-cta ev-slider-cta-fija" data-galeria-cta href="${esc(urls[0] || "#")}" target="_blank" rel="noreferrer"${urls[0] ? "" : " hidden"}>${esc(cta)}</a>`
    : "";
  const cabecera = etiqueta
    ? `<div class="tiny muted">${esc(etiqueta)} · <span data-galeria-cuenta>01</span> / ${pad(lista.length)}</div>\n    `
    : "";
  return `<div class="ev-slider ev-slider-cols-2" data-galeria data-galeria-modo="${modo}" data-galeria-visor="${visor}"${etiqueta ? ` data-galeria-etiqueta="${esc(etiqueta)}"` : ""} data-textos='${esc(JSON.stringify(textos))}'${urls ? ` data-galeria-urls='${esc(JSON.stringify(urls))}'` : ""}>
  <div class="ev-slider-head">
    ${cabecera}<div class="ev-slider-ctrls">
      <button type="button" class="ev-slider-btn" data-galeria-ir="-1" aria-label="${esc(textos.anterior)}">←</button>
      <button type="button" class="ev-slider-btn" data-galeria-ir="1" aria-label="${esc(textos.siguiente)}">→</button>
    </div>
  </div>
  <div class="ev-slider-track ${modo === "carril" ? "ev-slider-carril " : ""}ev-slider-track-mobile" data-galeria-pista>
${slots.join("\n")}
  </div>${ctaFija}
</div>`;
}
