// ─────────────────────────────────────────────────────────────
// Texto editable → HTML. Es el mismo mini-markdown que entiende la web React
// (mdInline / mdParas en ui.jsx): **negrita**, " / " como salto de línea
// siempre y " // " como salto SOLO en móvil (desktop sigue una sola línea);
// párrafos separados por líneas en blanco.
// Se escapa PRIMERO y se convierte después: el texto no puede inyectar HTML.
// ─────────────────────────────────────────────────────────────
import { esc } from "./plantilla.mjs";

export function mdInline(texto) {
  if (texto == null) return "";
  return esc(texto)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    // " // " primero (sin, sería " / " + " /" sueltos): salto solo en móvil.
    // Deja un espacio TRAS el <br>: en desktop, donde el <br> desaparece
    // (display:none), es lo único que separa las dos palabras.
    .replace(/\s+\/\/\s+/g, '<br class="m-only"> ')
    // " / " con espacio a ambos lados: así "c/ Blasco" o una URL no se parten.
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

// Sanea HTML "inline" de confianza limitada (el disclaimer de la carta, que
// viene del CMS): deja SOLO un puñado de etiquetas de formato, sin atributos, y
// convierte en texto todo lo demás. Mismo criterio que sanitizeInlineHTML en
// ui.jsx, pero sin DOM: esto corre en Node y en el edge.
const INLINE = /^(strong|b|em|i|br|span)$/;
export function sanearInline(html) {
  if (html == null) return "";
  return String(html)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(\/?)\s*([a-z][a-z0-9]*)\b[^>]*>/gi, (m, cierre, tag) =>
      INLINE.test(tag.toLowerCase()) ? `<${cierre}${tag.toLowerCase()}>` : "")
    // Cualquier "<" que no haya formado una etiqueta permitida se neutraliza.
    .replace(/<(?![/]?(strong|b|em|i|br|span)>)/gi, "&lt;");
}
