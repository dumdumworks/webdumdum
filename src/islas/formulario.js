// Formulario de eventos: envía un POST JSON a Web3Forms (gratis hasta 250
// envíos/mes; la clave es pública por diseño), con honeypot anti-spam. Al
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (enviando) return;   // doble Enter/tap
    const v = (n) => (form.elements[n].value || "").trim();
    if (!v("nombre") || !v("email") || !v("telefono") || !v("fecha")) { fallo(textos.obligatorios); return; }
    err.hidden = true;
    estado(true);
    const ref = referencia();
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: form.dataset.clave,
          subject: `Nueva solicitud de evento · ${ref}`,
          from_name: "Web DUM DUM · Eventos",
          botcheck: form.elements.botcheck.checked,   // un bot que lo marque se descarta en Web3Forms
          "Referencia": ref,
          "Nombre y apellido": v("nombre"),
          "Empresa": v("empresa"),
          "Email de contacto": v("email"),
          "Teléfono": v("telefono"),
          "Fecha del evento": v("fecha"),
          "Número de asistentes": v("asistentes"),
          "Mensaje": v("mensaje"),
          replyto: v("email"),
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
