// ─────────────────────────────────────────────────────────────
// Convención de nombres de las fotos que sube el panel a R2 (/img/menu/…).
// Módulo puro, sin fs: lo importan la función de subida (functions/api/upload.js)
// y la plantilla de la carta (que se empaqueta para el edge).
//
// El panel redimensiona en el navegador y sube la foto principal y sus
// variantes más estrechas, como las de img/dumplings:
//   <base>-<ts>-<W>.jpg      la principal, de W px de ancho (W = 1200 o menos)
//   <base>-<ts>-480.jpg      variantes, solo las MÁS ESTRECHAS que la principal
//   <base>-<ts>-800.jpg
// El ancho en el nombre es lo que distingue estas fotos de las subidas antes
// (<base>-<ts>.<ext>, sin variantes): una foto vieja no casa con la expresión y
// la carta no le pide variantes que no existen. Hay que mantener ANCHOS igual
// en el script de panel/index.html.
// ─────────────────────────────────────────────────────────────
export const ANCHOS = [480, 800];

// Anchos de las variantes que existen para una principal de ancho w.
export const variantesDe = (w) => ANCHOS.filter((a) => a < w);

export const claveFoto = (base, ts, w) => `${base}-${ts}-${w}.jpg`;

// "/img/menu/pibil-171-1200.jpg" → [["/img/menu/pibil-171-480.jpg", 480], …, [principal, 1200]]
// o null si no es una foto con variantes.
export function candidatasR2(src) {
  const m = /^(\/img\/menu\/.+)-(\d{3,4})\.jpg$/.exec(src);
  if (!m) return null;
  const w = Number(m[2]);
  const v = variantesDe(w);
  return v.length ? [...v.map((a) => [`${m[1]}-${a}.jpg`, a]), [src, w]] : null;
}
