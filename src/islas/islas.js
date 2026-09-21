// ─────────────────────────────────────────────────────────────
// Islas de la web HTML: el poco JavaScript que necesita una página ya pintada.
// esbuild las une en un único assets/islas.<hash>.js que va con `defer`, así
// que cuando corren el DOM ya existe. Cada isla busca su elemento y, si la
// página no lo tiene, no hace nada.
// ─────────────────────────────────────────────────────────────
import { estado } from "./estado.js";
import { menuMovil } from "./menu-movil.js";
import { modales, abrirReservar } from "./modales.js";
import { flotante } from "./flotante.js";
import { galerias } from "./galeria.js";
import { llamar } from "./llamar.js";
import { carta } from "./carta.js";
import { formulario } from "./formulario.js";
import { embeds } from "./embeds.js";
import { home } from "./home.js";
import { faq } from "./faq.js";
import { $$ } from "./nucleo.js";

estado();
menuMovil();
modales();
flotante();
galerias();
llamar();
carta();
formulario();
embeds();
home();
faq();

// El selector de idioma guarda la preferencia ANTES de navegar (misma clave
// que React); el script de cabecera la lea al aterrizar para llevar a cada
// uno a su versión.
$$("[data-idioma]").forEach((a) => a.addEventListener("click", () => {
  try { localStorage.setItem("dumdum.lang", a.dataset.idioma); } catch (e) {}
}));

// Disparador por URL: quien entra con ?reservar (el enlace del anuncio) ve la
// ventana de reserva abrirse sola, como si hubiera pulsado el botón. Lanza la
// misma señal que los botones, así la conversión cuenta igual en GA.
try {
  if (new URLSearchParams(location.search).has("reservar")) setTimeout(() => abrirReservar(), 600);
} catch (e) {}
