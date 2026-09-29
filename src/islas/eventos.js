// El botón "Elige tu tipo de evento" del hero de /eventos baja hasta la
// rejilla de servicios y resalta en rojo un instante el servicio con
// página propia (Talleres Team Building) al llegar, para dejar claro que
// se puede pulsar.
import { $ } from "./nucleo.js";

export function eventos() {
  const boton = $("[data-ir-servicio]");
  if (!boton) return;
  const objetivo = document.querySelector(boton.getAttribute("href"));
  if (!objetivo) return;

  boton.addEventListener("click", (e) => {
    e.preventDefault();
    const topbar = document.querySelector(".topbar");
    const offset = (topbar ? topbar.offsetHeight : 0) + 24;
    // scrollIntoView nativo, no el desplazarA() a mano del resto de la web
    // (ease-out con requestAnimationFrame en el hilo principal): en este
    // tramo tan largo, con galerías e imágenes de por medio, un frame que se
    // retrasa hacía que el siguiente saltara de golpe la distancia
    // acumulada — un pequeño trompicón cerca del final. El scroll nativo del
    // navegador no depende del hilo principal para animarse.
    objetivo.style.scrollMarginTop = offset + "px";
    const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // El ratón no se mueve mientras la página se desplaza debajo, así que
    // puede acabar "encima" de la tarjeta al llegar — y como aquí --ink es
    // el mismo rojo que --red, su :hover normal ya la pone en rojo sólido,
    // pareciendo pulsada antes incluso de que actúe el resalto. Se le quita
    // el :hover mientras dura el viaje + el resalto, y se devuelve al
    // terminar (un hover real, con el ratón parado de verdad encima, vuelve
    // a funcionar en cuanto se restaura).
    objetivo.style.pointerEvents = "none";
    const restaurar = () => { objetivo.style.pointerEvents = ""; };
    let resaltado = false;
    const resaltar = () => {
      if (resaltado) return;
      resaltado = true;
      objetivo.classList.add("is-flash");
      objetivo.addEventListener("animationend", () => { objetivo.classList.remove("is-flash"); restaurar(); }, { once: true });
    };

    if (reducido) {
      objetivo.scrollIntoView({ behavior: "auto", block: "start" });
      resaltar();
      return;
    }
    // "scrollend" (Chrome 114+, Firefox 109+, Safari 17.4+) avisa justo
    // cuando el scroll nativo termina; el setTimeout es el salvavidas en
    // navegadores más viejos que no lo disparan.
    window.addEventListener("scrollend", resaltar, { once: true });
    const distancia = Math.abs(objetivo.getBoundingClientRect().top - offset);
    setTimeout(resaltar, Math.min(2200, Math.max(700, distancia * 0.5)));
    objetivo.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
