// Estado de apertura ("Abierto hasta las 15.39h" en la topbar, "Abierto ·
// cierra 15.39h" en la ficha), SIEMPRE con la hora de Madrid y recalculado
// cada minuto. Tramos y textos vienen en los data-* de cada elemento, con {h}
// donde va la hora: la isla no lleva ni horarios ni idioma.
import { $$ } from "./nucleo.js";

function minutosMadrid() {
  try {
    const partes = new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", hour12: false,
    }).formatToParts(new Date());
    const h = parseInt(partes.find((p) => p.type === "hour").value, 10);
    const m = parseInt(partes.find((p) => p.type === "minute").value, 10);
    return (h % 24) * 60 + m;
  } catch (e) {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }
}
const hhmm = (m) => String(Math.floor(m / 60)).padStart(2, "0") + "." + String(m % 60).padStart(2, "0");

export function calcularApertura(tramos, min = minutosMadrid()) {
  for (const [ini, fin] of tramos) if (min >= ini && min < fin) return { abierto: true, hora: hhmm(fin) };
  for (const [ini] of tramos) if (min < ini) return { abierto: false, hora: hhmm(ini) };
  return { abierto: false, hora: hhmm(tramos[0][0]) };
}

export function estado() {
  const els = $$("[data-estado]");
  if (!els.length) return;
  const pintar = () => els.forEach((el) => {
    const tramos = el.dataset.tramos.split(",").map((t) => t.split("-").map(Number));
    const e = calcularApertura(tramos);
    const dot = document.createElement("span");
    dot.className = "dot " + (e.abierto ? "dot-live" : "dot-closed");
    el.replaceChildren(dot, " " + (e.abierto ? el.dataset.abierto : el.dataset.cerrado).replace("{h}", e.hora));
  });
  pintar();
  setInterval(pintar, 60000);
}
