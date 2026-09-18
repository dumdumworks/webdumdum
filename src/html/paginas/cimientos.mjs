// ─────────────────────────────────────────────────────────────
// Página de MUESTRA de la web HTML (solo en local): el esqueleto completo con
// un contenido mínimo, para revisar topbar, modales, flotante y footer sin
// tocar ninguna ruta de producción. Desaparecerá cuando haya páginas reales.
// ─────────────────────────────────────────────────────────────
import { esqueleto, specFoot } from "../shell.mjs";
import { esc } from "../plantilla.mjs";

export const RUTA = "/cimientos";

export function cimientos(i, { locales }) {
  const { t } = i;
  const main = `<section style="padding:18vh var(--gutter)">
  <div class="tiny muted">[${esc(t("cimientos", "foundations"))}]</div>
  <h1 class="h-display" style="margin-top:16px">${esc(t("Por aquí", "Nothing on"))}<br>${esc(t("no hay carta.", "the menu here."))}</h1>
  <a href="${i.ruta("/")}" class="btn red" style="margin-top:32px">${esc(t("Volver al inicio", "Back home"))} →</a>
</section>

${specFoot([
    [t("Año", "Year"), "© " + t("DOSMIL24", "TWENTY24")],
    [t("Locales", "Locations"), `<a class="spec-link" href="${i.ruta("/locales")}"><strong style="font-weight:700">Madrid</strong> → Chamberí | Bernabéu</a>`],
    [t("Horario", "Hours"), `<a class="spec-link" href="${i.ruta("/locales")}">${esc(t("L-D / 13.00 - 15.39 / 20.00 - 22.39", "Mon-Sun / 13.00 - 15.39 / 20.00 - 22.39"))}</a>`],
    [t("Carta", "Menu"), `<a class="spec-link" href="${i.ruta("/menu")}">${esc(t("Una vez al mes, un dumpling nuevo", "Once a month, a new dumpling"))}</a>`],
  ])}`;
  return {
    titulo: t("DUM DUM™ — Cimientos HTML", "DUM DUM™ — HTML foundations"),
    desc: t("Página de muestra de la web HTML. No se publica.", "Sample page of the HTML site. Not published."),
    cuerpo: esqueleto(i, RUTA, locales, main),
    ld: null,
  };
}
