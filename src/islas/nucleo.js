// Utilidades mínimas que comparten las islas. Sin dependencias.
export const $ = (sel, raiz = document) => raiz.querySelector(sel);
export const $$ = (sel, raiz = document) => Array.prototype.slice.call(raiz.querySelectorAll(sel));
export const emitir = (nombre, detail) => window.dispatchEvent(new CustomEvent(nombre, { detail }));

// Atrapa el foco dentro de un diálogo (mismo comportamiento que useFocusTrap en
// ui.jsx): mueve el foco al primer elemento enfocable, mantiene Tab/Shift+Tab
// dentro y, al soltar, devuelve el foco a quien lo tenía.
const ENFOCABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';
export function atraparFoco(cont) {
  const previo = document.activeElement;
  const enfocables = () => $$(ENFOCABLE, cont)
    .filter((el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement);
  const primero = enfocables()[0];
  if (primero) { try { primero.focus(); } catch (e) {} }
  const onKey = (e) => {
    if (e.key !== "Tab") return;
    const items = enfocables();
    if (!items.length) { e.preventDefault(); return; }
    const ini = items[0], fin = items[items.length - 1];
    const fuera = !cont.contains(document.activeElement);
    if (e.shiftKey ? (document.activeElement === ini || fuera) : (document.activeElement === fin || fuera)) {
      e.preventDefault();
      (e.shiftKey ? fin : ini).focus();
    }
  };
  document.addEventListener("keydown", onKey, true);
  return () => {
    document.removeEventListener("keydown", onKey, true);
    if (previo && previo.focus) { try { previo.focus(); } catch (e) {} }
  };
}
