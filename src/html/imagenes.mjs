// ─────────────────────────────────────────────────────────────
// Fotos con variantes (dev/fotos-variantes.py): srcset para que el navegador
// pida cada foto al tamaño al que la va a pintar. Node no trae nada para leer
// imágenes, así que el ancho del original se saca del propio JPEG (marcador
// SOF), que es lo único que hace falta para declararlo en el srcset.
// ─────────────────────────────────────────────────────────────
import fs from "node:fs";
import path from "node:path";

export const ANCHOS = [480, 800];

// Ancho en píxeles de un JPEG: recorre los marcadores hasta el SOFn.
export function anchoJpeg(archivo) {
  const b = fs.readFileSync(archivo);
  if (b[0] !== 0xff || b[1] !== 0xd8) throw new Error("No es un JPEG: " + archivo);
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m === 0xd8 || (m >= 0xd0 && m <= 0xd7) || m === 0x01 || m === 0xff) { i += 2; continue; }
    const len = b.readUInt16BE(i + 2);
    // SOF0–SOF15 salvo DHT (C4), JPG (C8) y DAC (CC).
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return b.readUInt16BE(i + 7);
    i += 2 + len;
  }
  throw new Error("JPEG sin cabecera de tamaño: " + archivo);
}

// srcset de una foto: sus variantes más el original, cada una con su ancho.
// Solo las carpetas que pasan por dev/fotos-variantes.py tienen variantes; el
// resto de fotos (platos, prensa) se sirven tal cual y aquí devuelve null. Si
// una carpeta con variantes tiene una foto nueva sin procesar, el build ABORTA.
export function srcset(raiz, src) {
  const base = String(src).replace(/^\//, "").replace(/\.jpg$/, "");
  const variantes = ANCHOS.map((w) => `${base}-${w}.jpg`);
  const hay = variantes.map((v) => fs.existsSync(path.join(raiz, v)));
  if (!hay.some(Boolean)) return null;
  if (!hay.every(Boolean)) throw new Error("Falta una variante de " + src + " (python3 dev/fotos-variantes.py)");
  return [...variantes.map((v, k) => `${v} ${ANCHOS[k]}w`), `${src} ${anchoJpeg(path.join(raiz, base + ".jpg"))}w`].join(", ");
}
