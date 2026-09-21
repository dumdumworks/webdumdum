// ─────────────────────────────────────────────────────────────
// FAQ (/contacto): abre y cierra el desplegable "FAQs" y cada pregunta con
// una transición suave (la caja no tiene altura fija, así que se anima con
// la Web Animations API en vez de con una transition de CSS).
// Además, al abrir una pregunta se cierra la que estuviera abierta: como
// mucho una respuesta visible a la vez.
// ─────────────────────────────────────────────────────────────
import { $$ } from "./nucleo.js";

const SIN_MOVIMIENTO = matchMedia("(prefers-reduced-motion: reduce)");
const DURACION = () => (SIN_MOVIMIENTO.matches ? 0 : 280);
// Ease-in-out simétrica, no ease-out: al cerrar una pregunta mientras se abre
// la de abajo, las dos comparten el mismo borde. Con una curva de salida
// rápida (la mayoría del recorrido en el primer tercio) ese borde pega un
// salto casi instantáneo y da la sensación de que la de abajo se monta
// encima; con la misma velocidad de entrada y salida, el borde se mueve a
// ritmo constante y ambas se leen como una sola transición, no dos.
const EASE = "cubic-bezier(0.4,0,0.2,1)";

// Hace que un <details> se abra/cierre animando su altura, en vez del salto
// instantáneo por defecto. Devuelve una función para abrirlo o cerrarlo por
// programa (la usa el acordeón para cerrar la pregunta anterior).
function animar(details) {
  const summary = details.querySelector(":scope > summary");
  let animacion = null;

  function alturaCerrado() {
    // Solo el summary es visible cerrado, pero el padding/borde es del propio
    // <details> (.faq-item), no del summary: sin sumarlo aquí, el cierre se
    // encoge 33px de más (16+16 de padding + 1 de borde) y al final, cuando
    // el navegador retoma el cerrado nativo, la caja "rebota" esos 33px de
    // golpe — el efecto de "sube para bajar" que se comía la pregunta.
    const cs = getComputedStyle(details);
    return summary.getBoundingClientRect().height
      + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
      + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
  }

  function ir(abrir) {
    if (animacion) animacion.cancel();
    details.style.overflow = "hidden";
    const alto0 = details.getBoundingClientRect().height;
    if (abrir) details.open = true;
    // El icono +/- normalmente sigue al atributo "open", pero al cerrar ese
    // atributo no se quita hasta el final (ver más abajo): sin esto se
    // quedaría en "-" durante toda la animación de cierre.
    details.classList.toggle("faq-cerrando", !abrir);
    // Con open=true el navegador ya ha recalculado el alto final (o el de
    // cierre, si estamos cerrando, es el del summary solo).
    const altoFinal = abrir ? details.scrollHeight : alturaCerrado();
    animacion = details.animate(
      { height: [alto0 + "px", altoFinal + "px"] },
      { duration: DURACION(), easing: EASE }
    );
    animacion.onfinish = () => {
      details.style.overflow = "";
      details.style.height = "";
      if (!abrir) { details.open = false; details.classList.remove("faq-cerrando"); }
      animacion = null;
    };
  }

  summary.addEventListener("click", (e) => {
    e.preventDefault();
    ir(!details.open);
  });

  return ir;
}

export function faq() {
  const principal = document.querySelector(".faq-toggle");
  if (!principal) return;
  animar(principal);

  const preguntas = $$(".faq-item", principal);
  const cerradores = new Map(preguntas.map((d) => [d, animar(d)]));
  let abierta = null;
  preguntas.forEach((d) => {
    const ir = cerradores.get(d);
    d.querySelector(":scope > summary").addEventListener("click", () => {
      // Al pulsar una YA abierta, este mismo listener la cierra (ir(false)
      // vía el de animar()); si se abre otra distinta, cerramos la anterior.
      if (d.open && abierta === d) { abierta = null; return; }
      if (abierta && abierta !== d) cerradores.get(abierta)(false);
      abierta = d;
    });
  });
}
