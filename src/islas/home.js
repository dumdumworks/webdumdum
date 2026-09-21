// La home: la flecha del hero baja una pantalla con el ease-out de la web, y
// la celda de Merch enseña el aviso "Próximamente" cinco segundos.
import { $, $$, desplazarA } from "./nucleo.js";

// Igual que numeroALetra() en src/html/paginas/home.mjs (Node) — duplicada a
// propósito: esta corre en el navegador, esa en el build, y son veinte
// palabras que no cambian.
const NUM_ES = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez",
  "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte"];
const NUM_EN = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];

// Los números de dumplings y de vegetarianos de la frase de /CARTA se fijan
// al desplegar (home es una página estática). Si desde entonces alguien ha
// tocado la disponibilidad o la etiqueta VEG de un plato en el panel sin
// desplegar, /menu.json ya lo sabe (lee KV en vivo) y esto lo corrige aquí,
// sin esperar al build.
async function corregirCifraDumplings() {
  const p = $("[data-n-dumplings]");
  if (!p) return;
  const dumplingsActual = Number(p.dataset.nDumplings);
  const vegActual = Number(p.dataset.nVeg);
  let carta;
  try {
    const res = await fetch("/menu.json", { cache: "no-store" });
    if (!res.ok) return;
    carta = await res.json();
  } catch (e) { return; } // sin red o JSON roto: se queda con los números del build

  const disponibles = ((carta.sections || []).find((s) => s.id === "dumplings")?.items || [])
    .filter((it) => it.available !== false && !it.archived);
  const n = disponibles.length;
  const nVeg = disponibles.filter((it) => (it.tags || []).some((x) => String(x).toUpperCase() === "VEG")).length;
  const tabla = document.documentElement.lang === "en" ? NUM_EN : NUM_ES;

  if (n && n !== dumplingsActual) {
    const palabra = tabla[n] ?? String(n);
    $$("[data-cifra]", p).forEach((el, i) => {
      el.textContent = i === 0 ? palabra.charAt(0).toUpperCase() + palabra.slice(1) : palabra;
    });
  }
  if (nVeg !== vegActual) {
    $$("[data-veg]", p).forEach((el) => { el.textContent = tabla[nVeg] ?? String(nVeg); });
  }
}

export function home() {
  const bajar = $("[data-bajar]");
  if (bajar) bajar.addEventListener("click", () => desplazarA(window.scrollY + window.innerHeight * 1.05, 900));
  corregirCifraDumplings();
  // El sello de "DESOBEDIENCIA": cada toque invierte los colores y se queda
  // así hasta el siguiente toque (no es un :hover/:active — en táctil no hay
  // estado "encima", solo toques).
  const sello = $("[data-sello]");
  if (sello) sello.addEventListener("click", () => sello.classList.toggle("is-negativo"));
  const toast = $(".home-toast"), celda = $("[data-toast]");
  if (!toast || !celda) return;
  let timer = null;
  celda.addEventListener("click", (e) => {
    e.preventDefault();
    toast.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(() => { toast.hidden = true; }, 5000);
  });
}
