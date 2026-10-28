// Formularios de la web (eventos, menús de empresa): envían un POST JSON a
// Web3Forms (gratis hasta 250 envíos/mes en total; la clave es pública por
// diseño), con honeypot anti-spam. El asunto, el remitente y los campos salen
// de los data-atributos del propio formulario (data-asunto, data-origen y
// data-etiqueta en cada campo), así un formulario nuevo no toca este JS. Al
// enviar bien, el formulario se sustituye por el "Gracias." y el foco pasa a
// su encabezado (si no, un lector de pantalla se queda en un botón que ya no
// existe). Si falla, un aviso con role="alert" dice por qué.
import { $ } from "./nucleo.js";

// Fecha de hoy (Madrid) en YYYY-MM-DD: no se pueden pedir eventos en el pasado.
function hoyISOMadrid() {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  } catch (e) { return new Date().toISOString().slice(0, 10); }
}

// Identificador de la solicitud: AA/MM/CODIGO (ej: 26/05/A7F3), sin caracteres confusos.
function referencia() {
  const d = new Date(), chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let k = 0; k < 4; k++) c += chars[Math.floor(Math.random() * chars.length)];
  return String(d.getFullYear()).slice(-2) + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + c;
}

export function formulario() {
  const form = $("[data-formulario]");
  if (!form) return;
  const ok = $("[data-formulario-ok]");
  const err = $(".ev-form-err", form);
  const boton = $("button[type=submit]", form);
  const etiqueta = $(".btn-label", boton), flecha = $(".btn-arrow", boton);
  const textos = JSON.parse(form.dataset.textos);
  const textoEnviar = etiqueta.textContent;
  $("[data-fecha]", form).min = hoyISOMadrid();
  let enviando = false;

  const fallo = (msg) => { err.textContent = msg; err.hidden = false; };
  const estado = (e) => {
    enviando = e;
    boton.disabled = e;
    etiqueta.textContent = e ? textos.enviando : textoEnviar;
    flecha.hidden = e;
  };

  // El aviso es de un intento de envío: en cuanto se toca un campo, ya no vale.
  form.addEventListener("input", () => { err.hidden = true; });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (enviando) return;   // doble Enter/tap
    const campos = [...form.elements].filter((el) => el.dataset.etiqueta);
    // Un formulario con `novalidate` no usa los avisos del navegador: avisa él y lleva el foco a la
    // primera pregunta sin responder.
    const malos = campos.filter((el) => !el.checkValidity());
    if (malos.length) { fallo(textos.obligatorios); malos[0].focus(); return; }
    err.hidden = true;
    estado(true);
    const ref = referencia();
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: form.dataset.clave,
          subject: `${form.dataset.asunto} · ${ref}`,
          from_name: form.dataset.origen,
          botcheck: form.elements.botcheck.checked,   // un bot que lo marque se descarta en Web3Forms
          "Referencia": ref,
          ...Object.fromEntries(campos.map((el) => [el.dataset.etiqueta, el.value.trim()])),
          replyto: form.elements.email.value.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        form.reset();
        form.hidden = true; ok.hidden = false;
        try { $("h3", ok).focus(); } catch (x) {}
      } else {
        fallo(data.message || textos.error);
      }
    } catch (x) {
      fallo(textos.red);
    }
    estado(false);
  });
  $("[data-otra]", ok).addEventListener("click", () => { ok.hidden = true; form.hidden = false; });
}
