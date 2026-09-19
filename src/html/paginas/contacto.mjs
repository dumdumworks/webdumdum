// ─────────────────────────────────────────────────────────────
// CONTACTO (/contacto). Es el componente Contacto de pages.jsx.
// ─────────────────────────────────────────────────────────────
import { esc } from "../plantilla.mjs";
import { esqueleto, specFoot } from "../shell.mjs";
import * as E from "../enlaces.mjs";

export const RUTA = "/contacto";

export function contacto(i, { locales, seo, ldGlobal }) {
  const { t } = i;
  const s = seo.find((r) => r.p === RUTA);
  const grande = (href, texto, externo) =>
    `<a class="big" href="${esc(href)}"${externo ? ' target="_blank" rel="noreferrer"' : ""}>${esc(texto)} <span class="arr">↗︎</span></a>`;
  const main = `<div data-screen-label="contacto">
<section class="contact">
  <div>
    <div class="tiny muted">[04] ${esc(t("Contacto", "Contact"))}</div>
    <h1 style="margin-top:16px">${esc(t("Saluda", "Say hi"))}<span style="color:var(--red)">.</span></h1>
    <p class="body" style="margin-top:24px">${esc(t(
      "Por si te apetece preguntar, criticar, colaborar, vender, invitar, contratar o invitarnos. La puerta y la bandeja están abiertas.",
      "In case you fancy asking, complaining, collaborating, selling, inviting, hiring or treating us. The door and the inbox are open."))}</p>
    <div style="margin-top:48px;display:flex;flex-direction:column;gap:4px">
      <div class="tiny muted">${esc(t("Horario atención", "Support hours"))}</div>
      <div class="mono">${esc(t("LUN — VIE · 10.00 – 18.00", "MON — FRI · 10.00 – 18.00"))}</div>
    </div>
  </div>
  <div>
    ${grande("mailto:" + E.EMAIL, E.EMAIL)}
    ${grande(E.INSTAGRAM_URL, "Instagram", true)}
    ${grande("tel:" + E.TEL_GENERAL.tel, E.TEL_GENERAL.humano)}
  </div>
</section>

${specFoot([
    ["Email", `<a class="spec-link" href="mailto:${E.EMAIL}">${E.EMAIL}</a>`],
    ["Instagram", `<a class="spec-link" href="${E.INSTAGRAM_URL}" target="_blank" rel="noreferrer">@dumdum.plings</a>`],
    [t("Teléfono", "Phone"), `<a class="spec-link" href="tel:${E.TEL_GENERAL.tel}">${E.TEL_GENERAL.humano}</a>`],
    [t("Reservas", "Booking"), `<a class="spec-link" href="#" data-reservar>${esc(t("Reservar mesa", "Book a table"))}</a>`],
  ])}
</div>`;
  return {
    titulo: i.lang === "en" ? (s.te || s.t) : s.t,
    desc: i.lang === "en" ? (s.de || s.d) : s.d,
    cuerpo: esqueleto(i, RUTA, locales, main),
    ld: ldGlobal,
  };
}
