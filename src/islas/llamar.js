// Botón "Llamar a X". En móvil el tel: llama directo. En escritorio el primer
// clic solo REVELA el número y el segundo llama; ese primer clic va marcado con
// data-reveal="pending" para que el listener de GA (cabecera) no lo cuente como
// conversión.
import { $$ } from "./nucleo.js";

export function llamar() {
  const mq = matchMedia("(max-width: 879px)");
  $$("[data-llamar]").forEach((a) => {
    let revelado = false;
    const marcar = () => {
      if (!mq.matches && !revelado) a.setAttribute("data-reveal", "pending");
      else a.removeAttribute("data-reveal");
    };
    marcar();
    (mq.addEventListener ? mq.addEventListener("change", marcar) : mq.addListener(marcar));
    a.addEventListener("click", (e) => {
      if (mq.matches) return;
      e.preventDefault();
      if (!revelado) {
        revelado = true;
        // El texto es el último nodo del enlace (tras el icono).
        a.lastChild.textContent = a.dataset.humano + " →";
        marcar();
        return;
      }
      location.href = a.getAttribute("href");
    });
  });
}
