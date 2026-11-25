// ─────────────────────────────────────────────────────────────
// Colaboración especial con otra marca: un plato lleva `colab: { marca, logo }`.
// Módulo puro, sin fs: lo importan la carta (src/html/carta.mjs, que se empaqueta
// para el edge) y la función que guarda la carta (functions/api/menu.js), para que
// lo que admite el servidor y lo que pinta la web sea exactamente lo mismo.
//
// El logo lo sube el panel a R2 (/img/menu/logo-…png, ver functions/api/upload.js);
// /img/colab/ queda para logos que se commiteen a mano en el repo.
// ─────────────────────────────────────────────────────────────
export const MARCA_MAX = 60;

// Tamaño máximo del PNG del logo: lo que mide su caja en la carta (116 × 40 px, ver .colab-placa img en
// styles-2.css) por 3, la densidad de un iPhone Pro. Más grande solo pesa; más pequeño se ve borroso.
// El panel lo reduce a esto (LOGO_W/LOGO_H en panel/index.html: mantenerlos iguales) y el servidor lo exige.
export const LOGO_MAX_W = 360;
export const LOGO_MAX_H = 120;
const RUTA_LOGO = /^\/img\/(menu|colab)\/[\w.-]+\.(png|jpe?g|webp|svg)$/i;

// → { marca, logo } saneado, o null si no es una colaboración utilizable.
export function colabDe(it) {
  const c = it && it.colab;
  if (!c || typeof c !== "object") return null;
  const marca = typeof c.marca === "string" ? c.marca.trim() : "";
  const logo = typeof c.logo === "string" ? c.logo.trim() : "";
  if (!marca || marca.length > MARCA_MAX || !RUTA_LOGO.test(logo)) return null;
  return { marca, logo };
}
