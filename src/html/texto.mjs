// ─────────────────────────────────────────────────────────────
// Texto editable → HTML. Es el mismo mini-markdown que entiende la web React
// (mdInline / mdParas en ui.jsx): **negrita** y " / " como salto de línea
// dentro de un título; párrafos separados por líneas en blanco.
// Se escapa PRIMERO y se convierte después: el texto no puede inyectar HTML.
// ─────────────────────────────────────────────────────────────
import { esc } from "./plantilla.mjs";

export function mdInline(texto) {
  if (texto == null) return "";
  return esc(texto)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    // Solo " / " con espacio a ambos lados: así "c/ Blasco" o una URL no se parten.
    .replace(/\s+\/\s+/g, "<br>");
}

// Párrafos: uno por bloque separado por líneas en blanco. A partir del segundo
// llevan el mismo margen superior que ponía React (marginTop: 16).
export function mdParas(texto, clase, aire = 16) {
  if (texto == null || String(texto).trim() === "") return "";
  return String(texto).replace(/\r\n/g, "\n").split(/\n\s*\n+/)
    .map((b) => b.trim()).filter(Boolean)
    .map((b, n) => `<p class="${clase}"${n ? ` style="margin-top:${aire}px"` : ""}>${mdInline(b)}</p>`)
    .join("\n");
}

// "2024" → "DOSMIL24" / "TWENTY24", como autoLocalize() en la web React.
export const anio = (i, yyyy) => i.t("DOSMIL", "TWENTY") + String(yyyy).slice(-2);
