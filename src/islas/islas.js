// ─────────────────────────────────────────────────────────────
// Islas de la web HTML: el poco JavaScript que necesita una página ya pintada.
// esbuild las une en un único assets/islas.<hash>.js que va con `defer`, así
// que cuando corren el DOM ya existe. Cada isla busca su elemento y, si la
// página no lo tiene, no hace nada.
// ─────────────────────────────────────────────────────────────
import { estado } from "./estado.js";
import { menuMovil } from "./menu-movil.js";
import { modales } from "./modales.js";
import { flotante } from "./flotante.js";
import { galerias } from "./galeria.js";
import { llamar } from "./llamar.js";
import { carta } from "./carta.js";
import { $$ } from "./nucleo.js";

estado();
menuMovil();
modales();
flotante();
galerias();
llamar();
carta();

// El selector de idioma guarda la preferencia ANTES de navegar (misma clave
// que React); el script de cabecera la lea al aterrizar para llevar a cada
// uno a su versión.
$$("[data-idioma]").forEach((a) => a.addEventListener("click", () => {
  try { localStorage.setItem("dumdum.lang", a.dataset.idioma); } catch (e) {}
}));

// Mientras convivan las dos webs: quien entra por una página HTML ya ha visto
// la web, así que la SPA no debe recibirle con su pantalla de carga al saltar
// a una ruta que aún es React. Es la misma marca que pone el Loader de ui.jsx.
try { sessionStorage.setItem("dumdum.loaded", "1"); } catch (e) {}
