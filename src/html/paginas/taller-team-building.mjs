// ─────────────────────────────────────────────────────────────
// TALLER TEAM BUILDING (/taller-team-building) — VERSIÓN EMOCIONAL.
// Experimento pedido por Yerai: mismo taller, pero vendido desde la
// experiencia (fotos reales, tono de marca, sensorial) en vez de la
// ficha de servicio B2B de antes. Sin precios en pantalla a propósito
// — el CTA de "pedir presupuesto" hace ese trabajo. Puede romper el
// lenguaje visual del resto de la web (cajas con filete, rótulos
// numerados): aquí no hay ninguna caja, todo respira a sangre.
// ─────────────────────────────────────────────────────────────
import { esc, ORIGIN, breadcrumbLd } from "../plantilla.mjs";
import { esqueleto } from "../shell.mjs";
import { icono } from "./local.mjs";
import { galeria } from "../galeria.mjs";

export const RUTA = "/taller-team-building";
const DOSSIER = "/img/dossier/DUMDUM_DOSSIER_EVENTOS.pdf";

// [icono, titulo es/en, frase es/en] de cada paso — mismo proceso real
// de siempre (equipos → masa → montaje → cocinado → degustación), pero
// contado como lo que es: una tarde metiendo las manos en la masa con
// gente con la que normalmente solo compartes Slack.
const PASOS = [
  ["equipo", "Equipos", "Teams",
    "<strong>Os ponemos nosotros los equipos.</strong> Nada de eso de “hacemos los equipos nosotros” porque no: de hecho, os toca con quien más lejos tengáis.",
    "<strong>We put the teams together.</strong> None of that “we'll sort our own teams” business — in fact, you get paired with whoever you're least close to."],
  ["masa", "La masa", "The dough",
    "Harina, agua, sal. Se pesa, se mezcla, <strong>os ponéis hasta arriba de harina</strong> — y es un momentazo, porque mancha igual al trainee que al CEO. Eso iguala.",
    "Flour, water, salt. You weigh it, you mix it, <strong>you end up covered in flour</strong> — and that's the best part, because it gets on the trainee and the CEO exactly the same. That levels things out."],
  ["dumpling", "A hacer dumplings", "Making the dumplings",
    "El primero sale mal. El segundo, mal pero un poco mejor. Al quinto ya os contratamos. Lo importante no es que os salgan bien, es decirle al de al lado <strong>“tranqui, el siguiente te sale mejor, ¿te ayudo?”</strong>",
    "The first one comes out wrong. The second, wrong but a bit better. By the fifth, we'd hire you. The point isn't getting them right — it's telling the person next to you <strong>“don't worry, the next one'll be better, want a hand?”</strong>"],
  ["cocinar", "A cocinar", "Time to cook",
    "Al vapor, con su salsa, su toque final, y listos. Lo bueno es que aquí, de repente, <strong>el jefe lo hace peor que vosotros</strong> — y le podéis decir “se hace así” y se calla y os da la razón.",
    "Steamed, sauced, finished off, done. The best part: suddenly <strong>the boss is worse at this than you are</strong> — so you get to say “it's done like this” and watch them nod along."],
  ["comer", "A comer", "Time to eat",
    "Os sentáis a compartir lo que habéis hecho. <strong>Os aplaudís entre vosotros</strong> porque os ha quedado brutal, y sabe a gloria porque lo habéis hecho vosotros. Fin.",
    "You sit down to share what you made. <strong>You applaud each other</strong> because it came out amazing, and it tastes incredible because you made it yourselves. The end."],
];
// Lo esencial, sin precio: [icono, etiqueta es/en, valor es/en].
const ESENCIAL = [
  ["hora", "Duración", "Duration", "Un par de horitas", "A couple of hours"],
  ["aforo", "Grupo", "Group", "De 6 a 30+ personas", "From 6 to 30+ people"],
  ["pin", "Dónde", "Where", "Bernabéu, Madrid", "Bernabéu, Madrid"],
  ["dumpling", "Incluye", "Includes", "Entrante, carta entera, bebida y postre", "Starter, full menu, drink and dessert"],
];
const FAQ = [
  { q: ["¿Para cuántas personas es el team building?", "How many people is the team building for?"],
    a: ["Desde grupos pequeños hasta más de 30 personas. A partir de ahí, consúltanos directamente.",
      "From small groups up to 30+ people. Above that, just get in touch directly."] },
  { q: ["¿Cuánto dura el taller?", "How long does the workshop last?"],
    a: ["Entre 2 y 2,5 horas: bienvenida, una hora y cuarto de taller y otra hora y cuarto de comida. Se puede alargar bajo consulta.",
      "Between 2 and 2.5 hours: welcome, an hour and 15 minutes of workshop, and another hour and 15 minutes of food. Can run longer on request."] },
  { q: ["¿Qué incluye?", "What's included?"],
    a: ["Un entrante a compartir, toda la carta de dumplings por persona, una bebida y un mochi de postre.",
      "A starter to share, the whole dumpling menu per person, one drink and a mochi for dessert."] },
  { q: ["¿Y si se nos quema todo?", "What if we burn everything?"],
    a: ["Para eso está nuestro equipo al lado: para que no pase o, si pasa, reíros y seguir amasando.",
      "That's what our team's there for — so it doesn't happen, or if it does, you laugh it off and keep kneading."] },
  { q: ["¿Podéis adaptar el taller a otro tipo de evento?", "Can you adapt the workshop for a different kind of event?"],
    a: ["Sí: el espacio, la carta y el formato se adaptan al tipo de evento. Cumpleaños, despedidas, presentaciones… cuéntanos qué necesitas y le buscamos forma.",
      "Yes: the space, the menu and the format all adapt to the type of event. Birthdays, leaving dos, launches… tell us what you need and we'll make it work."] },
];

// Timeline real: riel horizontal en escritorio (número/icono/título/frase
// en la misma rejilla de 5 columnas, sin calcular nada a mano), vertical
// en móvil. Mismo componente ya afinado al píxel, solo cambia el copy.
const railEscritorio = (i) => `<div class="taller2-rail">
    <div class="taller2-fila">
      ${PASOS.map((_, idx) => `<div class="taller2-num tiny">${esc(String(idx + 1).padStart(2, "0"))}</div>`).join("\n      ")}
    </div>
    <div class="taller2-fila taller2-riel">
      <div class="taller2-linea"></div>
      ${PASOS.map(([ico], idx) => `<div class="taller2-ico" style="grid-column:${idx + 1}">${icono(ico)}</div>`).join("\n      ")}
    </div>
    <div class="taller2-fila">
      ${PASOS.map(([, esT, enT]) => `<div class="taller2-titulo">${esc(i.lang === "en" ? enT : esT)}</div>`).join("\n      ")}
    </div>
    <div class="taller2-fila">
      ${PASOS.map(([, , , esC, enC]) => `<div class="taller2-desc">${i.lang === "en" ? enC : esC}</div>`).join("\n      ")}
    </div>
  </div>`;
const railMovil = (i) => `<div class="taller2-movil">
    ${PASOS.map(([ico, esT, enT, esC, enC], idx) => `<div class="taller2-paso-m">
      <span class="taller2-ico-m">${icono(ico)}</span>
      <div class="taller2-cuerpo-m">
        <div class="taller2-cab-m">
          <span class="taller2-num-m tiny">${esc(String(idx + 1).padStart(2, "0"))}</span>
          <span class="taller2-titulo-m">${esc(i.lang === "en" ? enT : esT)}</span>
        </div>
        <p class="taller2-desc-m">${i.lang === "en" ? enC : esC}</p>
      </div>
    </div>`).join("\n    ")}
  </div>`;

function jsonLd(i, url) {
  const { t } = i;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: t("Taller de team building con dumplings", "Dumpling team building workshop"),
    description: t(
      "Taller participativo de elaboración de dumplings para empresas, con dinámicas por equipos y degustación final.",
      "A hands-on dumpling-making workshop for companies, with team activities and a final tasting."),
    url,
    provider: { "@type": "Restaurant", name: "DUM DUM", url: ORIGIN + "/" },
    areaServed: { "@type": "City", name: "Madrid" },
  };
}
function faqLd(i) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(({ q, a }) => ({
      "@type": "Question",
      name: i.lang === "en" ? q[1] : q[0],
      acceptedAnswer: { "@type": "Answer", text: i.lang === "en" ? a[1] : a[0] },
    })),
  };
}

export function tallerTeamBuilding(i, { locales, seo, ldGlobal, galerias, raiz }) {
  const { t } = i;
  const s = seo.find((r) => r.p === RUTA);
  const url = ORIGIN + i.ruta(RUTA);
  const fotos = (galerias && galerias.tallerTeamBuilding) || [];

  const main = `<div data-screen-label="taller-team-building">
<section class="ev-hero">
  <div class="tiny muted"><a href="${i.ruta("/eventos")}" class="link-hover">${esc(t("Eventos", "Events"))}</a> · ${esc(t("Talleres Team Building", "Team Building Workshops"))}</div>
  <h1 class="h-display" style="margin-top:16px">${esc(t("Con las manos", "Hands in the"))}<br>${esc(t("en la masa.", "dough. Literally."))}</h1>
  <div class="ev-hero-row" style="margin-top:32px;display:flex;flex-wrap:wrap;align-items:center;gap:32px">
    <p class="body" style="font-size:18px;flex:1 1 420px;min-width:0;margin:0">${t(
      "Nada de <strong>trust falls</strong> ni dinámicas incómodas con post-its. Aquí el team building es meteros de verdad en la cocina, <strong>pelearos por quién dobla mejor el dumpling</strong>, mancharlo todo un poco y sentaros después a <strong>comeros lo que habéis hecho</strong>. Dos horas en Bernabéu que se recuerdan más que la cena de Navidad.",
      "No <strong>trust falls</strong>, no awkward icebreakers with sticky notes. Here, team building means getting into the kitchen for real, <strong>arguing over who folds a better dumpling</strong>, making a bit of a mess, then sitting down to <strong>eat what you made</strong>. Two hours at our Bernabéu spot that'll get remembered more than the Christmas dinner.")}</p>
  </div>
  <div class="ev-hero-cta" style="display:flex;flex-wrap:wrap;gap:16px">
    <a class="btn red" href="${i.ruta("/eventos")}#contact-eventos"><span class="btn-label">${esc(t("Pedir presupuesto", "Get a quote"))}</span><span class="btn-arrow">→</span></a>
    <a class="btn" href="${esc(DOSSIER)}" target="_blank" rel="noreferrer"><span class="btn-label">${esc(t("Descargar dossier", "Download dossier"))}</span><span class="btn-arrow">↓</span></a>
  </div>
</section>

<div class="taller2-hero-media">
  <div class="taller2-resena">
    <div class="taller2-resena-estrellas" aria-hidden="true">★★★★★</div>
    <p class="taller2-resena-texto">${esc(t(
      "“Lo mejor del taller es que no es un escape room. Bastante tenemos con escapar a las 18.30.”",
      "“The best part of the workshop is that it's not an escape room. We already do enough escaping at 6:30pm.”"))}</p>
    <p class="taller2-resena-autor">Juan García</p>
    <p class="tiny muted taller2-resena-rol">${esc(t(
      "Empleado ficticio para soltar factos que nadie se atreve a decir",
      "Fictional employee, here to say the facts nobody else dares to"))}</p>
  </div>
  <figure class="taller2-foto-hero">
    <img src="img/espacio/02-barra-horizontal.jpg" alt="${esc(t("La cocina de DUM DUM Bernabéu, con el equipo trabajando en la barra.", "The DUM DUM Bernabéu kitchen, with the team working the counter."))}" loading="eager" decoding="async">
    <figcaption>${esc(t(
      "Estudios demuestran que la manera de mejorar tu relación con los de la oficina es metiéndoos en una cocina. El estudio lo hemos hecho nosotros, y cuando lo hemos leído nos ha parecido bien.",
      "Studies show the way to improve your relationship with your officemates is getting into a kitchen together. We did the study ourselves, and when we read it, it seemed about right."))}</figcaption>
  </figure>
  <div class="taller2-resena">
    <div class="taller2-resena-estrellas" aria-hidden="true">★★★★★</div>
    <p class="taller2-resena-texto">${esc(t(
      "“Al menos de aquí hemos salido llevándonos mejor. No como la vez del paintball.”",
      "“At least we came out of this one getting along better. Not like the paintball time.”"))}</p>
    <p class="taller2-resena-autor">María Riquelme</p>
    <p class="tiny muted taller2-resena-rol">${esc(t(
      "Pseudónimo para ocultar el nombre de la de RRHH de un sitio",
      "Pseudonym to hide the name of a certain HR manager"))}</p>
  </div>
</div>

<section class="taller2-pasos">
  <div class="tiny muted">${esc(t("Así va la cosa", "Here's how it goes"))}</div>
  <h2 class="h-1" style="margin-top:16px;max-width:18ch">${esc(t("Esto es lo que va a pasar.", "Here's what's about to happen."))}</h2>
  <p class="taller2-sub">${esc(t("De la harina al plato, sin postureo.", "From flour to plate, no faking it."))}</p>
  ${railEscritorio(i)}
  ${railMovil(i)}
</section>

<section class="taller-galeria">
  <div class="tiny muted" style="margin:0 var(--gutter) 16px">${esc(t("Así es el sitio", "This is the place"))}</div>
  ${galeria(i, { fotos, ratio: "3 / 4", etiquetaHueco: t("Foto", "Photo"), raiz })}
</section>

<section class="taller2-cita">
  <p class="taller2-cita-grande">${esc(t("El postureo se queda en la puerta.", "Leave the fake team spirit at the door."))}</p>
  <p class="taller2-cita-sub">${esc(t("Aquí lo que cuenta es lo que hacéis con las manos.", "Here, what counts is what you do with your hands."))}</p>
</section>

<section class="taller2-esencial">
  <div class="tiny muted">${esc(t("Lo esencial", "The essentials"))}</div>
  <h2 class="h-1" style="margin-top:16px;max-width:16ch">${esc(t("Lo que necesitas saber.", "What you need to know."))}</h2>
  <div class="taller2-esencial-grid">
    ${ESENCIAL.map(([ico, esL, enL, esV, enV]) => `<div class="taller2-esencial-item">
      <div class="taller2-esencial-ico">${icono(ico)}</div>
      <div class="tiny muted">${esc(i.lang === "en" ? enL : esL)}</div>
      <div class="taller2-esencial-valor">${esc(i.lang === "en" ? enV : esV)}</div>
    </div>`).join("\n    ")}
  </div>
  <p class="taller2-esencial-nota">${esc(t("¿El precio? Te lo damos en cuanto nos cuentes cuántos sois.", "The price? We'll give it to you the moment you tell us how many you are."))}</p>
  <a class="btn red" href="${i.ruta("/eventos")}#contact-eventos" style="width:fit-content"><span class="btn-label">${esc(t("Pedir presupuesto", "Get a quote"))}</span><span class="btn-arrow">→</span></a>
</section>

<section class="taller2-faq">
  <div class="tiny muted">${esc(t("Preguntas frecuentes", "FAQ"))}</div>
  <h2 class="h-1" style="margin-top:16px;max-width:18ch">${esc(t("Lo que más nos preguntáis.", "What you ask us most."))}</h2>
  <details class="faq-toggle taller2-faq-toggle" open>
    <summary class="big">${esc(t("Preguntas frecuentes", "FAQ"))}<span class="faq-ico" aria-hidden="true"></span></summary>
    <div class="faq-list">
      ${FAQ.map(({ q, a }) => `      <details class="faq-item">
        <summary>${esc(i.lang === "en" ? q[1] : q[0])}<span class="faq-ico" aria-hidden="true"></span></summary>
        <p class="body">${esc(i.lang === "en" ? a[1] : a[0])}</p>
      </details>`).join("\n")}
    </div>
  </details>
</section>

<section class="taller2-cierre">
  <h3 class="h-1">${t("¿Cuándo os liais?", "So, when are you diving in?")}</h3>
  <p class="body">${esc(t(
    "Cuéntanos cuántos sois y qué día os viene bien. Te contestamos con hueco libre y presupuesto, sin líos.",
    "Tell us how many you are and what day works. We'll get back to you with availability and a quote, no hassle."))}</p>
  <a class="btn red" href="${i.ruta("/eventos")}#contact-eventos" style="width:fit-content"><span class="btn-label">${esc(t("Pedir presupuesto", "Get a quote"))}</span><span class="btn-arrow">→</span></a>
</section>
</div>`;

  return {
    titulo: i.lang === "en" ? (s.te || s.t) : s.t,
    desc: i.lang === "en" ? (s.de || s.d) : s.d,
    cuerpo: esqueleto(i, RUTA, locales, main),
    ld: [ldGlobal, breadcrumbLd(i, [
      { nombre: t("Eventos", "Events"), ruta: "/eventos" },
      { nombre: t("Talleres Team Building", "Team Building Workshops"), ruta: RUTA },
    ]), jsonLd(i, url), faqLd(i)],
  };
}
