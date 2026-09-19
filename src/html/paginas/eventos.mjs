// ─────────────────────────────────────────────────────────────
// EVENTOS (/eventos): hero con dossier, espacio, producto, prensa, redes,
// universo, al frente, servicios y el formulario. Es el componente Eventos de
// pages.jsx. Los textos editables salen de eventos.json (Sveltia) con caída
// TOTAL al texto escrito aquí: si el editor no aporta nada, se ve igual.
// ─────────────────────────────────────────────────────────────
import { esc, ORIGIN } from "../plantilla.mjs";
import { esqueleto } from "../shell.mjs";
import { mdInline, mdParas } from "../texto.mjs";
import { galeria } from "../galeria.mjs";
import { sliderYouTube, sliderReels } from "../embeds.mjs";
import * as E from "../enlaces.mjs";

export const RUTA = "/eventos";
// Clave PÚBLICA de Web3Forms (lo es por diseño) y buzón que recibe las solicitudes.
export const WEB3FORMS_KEY = "7b16c2a8-ccbd-4c0a-8d29-0562bd8646a0";

const DOSSIER_POR_DEFECTO = "/img/dossier/DUMDUM_DOSSIER_EVENTOS.pdf";

// Fecha de hoy (Madrid) en YYYY-MM-DD para el `min` del campo de fecha. La
// isla lo vuelve a poner al cargar: esta es la del build, solo de respaldo.
function hoyISOMadrid() {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  } catch (e) { return new Date().toISOString().slice(0, 10); }
}

// Nombres de los platos por foto, para que el visor de Producto sea el de la
// carta (con nombre). Se cruza el archivo de la foto con la carta del repo.
function nombresPorFoto(i, carta) {
  const m = {};
  for (const sec of carta.sections || []) for (const it of sec.items || []) {
    if (it.image && !it.archived) {
      const en = it.name_en && String(it.name_en).trim() !== "" ? it.name_en : it.name;
      m[it.image] = i.lang === "en" ? (en || it.name || "") : (it.name || "");
    }
  }
  return m;
}

function formulario(i) {
  const { t } = i;
  const campo = (etiqueta, input) => `<label class="ev-field"><span>${esc(etiqueta)}</span>${input}</label>`;
  const opciones = [
    ["", t("Selecciona…", "Select…")], ["Menos de 10", t("Menos de 10", "Fewer than 10")],
    ["Entre 10 y 15", t("Entre 10 y 15", "10 to 15")], ["Entre 15 y 20", t("Entre 15 y 20", "15 to 20")],
    ["Entre 20 y 25", t("Entre 20 y 25", "20 to 25")], ["Entre 25 y 30", t("Entre 25 y 30", "25 to 30")],
    ["Entre 30 y 35", t("Entre 30 y 35", "30 to 35")], ["Entre 35 y 40", t("Entre 35 y 40", "35 to 40")],
    ["Más de 40", t("Más de 40", "More than 40")],
  ];
  const textos = {
    obligatorios: t("Rellena los campos obligatorios: nombre, email, teléfono y fecha del evento.", "Please fill in the required fields: name, email, phone and event date."),
    error: t("No se pudo enviar. Inténtalo de nuevo o escríbenos directamente.", "Couldn't send. Try again or email us directly."),
    red: t("No hay conexión. Inténtalo de nuevo.", "No connection. Please try again."),
    enviando: t("Enviando…", "Sending…"),
  };
  return `<form class="ev-form" data-formulario data-clave="${WEB3FORMS_KEY}" data-textos='${esc(JSON.stringify(textos))}'>
  <input type="checkbox" name="botcheck" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0" tabindex="-1" autocomplete="off" aria-hidden="true">
  <div class="ev-form-row ev-form-row-3">
    ${campo(t("Nombre y apellido *", "Full name *"), `<input type="text" name="nombre" required placeholder="${esc(t("Tu nombre", "Your name"))}">`)}
    ${campo(t("Empresa", "Company"), `<input type="text" name="empresa" placeholder="${esc(t("Tu empresa (opcional)", "Your company (optional)"))}">`)}
    ${campo(t("Email *", "Email *"), `<input type="email" name="email" required placeholder="tu@email.com">`)}
  </div>
  <div class="ev-form-row ev-form-row-3">
    ${campo(t("Teléfono *", "Phone *"), `<input type="tel" name="telefono" required placeholder="+34 600 000 000">`)}
    ${campo(t("Fecha del evento *", "Event date *"), `<input type="date" name="fecha" min="${hoyISOMadrid()}" required data-fecha>`)}
    ${campo(t("Número de asistentes", "Number of guests"), `<select name="asistentes" class="ev-select">${opciones.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join("")}</select>`)}
  </div>
  ${campo(t("¿Qué necesitas?", "What do you need?"), `<textarea name="mensaje" rows="5" placeholder="${esc(t("Tipo de evento, comentarios…", "Type of event, comments…"))}"></textarea>`)}
  <div class="ev-form-err" role="alert" hidden></div>
  <div class="ev-form-actions">
    <button type="submit" class="btn red"><span class="btn-label">${esc(t("Enviar solicitud", "Send request"))}</span><span class="btn-arrow">→</span></button>
  </div>
</form>
<div class="ev-form ev-form-ok" data-formulario-ok hidden>
  <div class="tiny muted">${esc(t("Mensaje enviado", "Message sent"))}</div>
  <h3 class="h-2" style="margin-top:12px" tabindex="-1">${esc(t("Gracias.", "Thank you."))} <em style="font-style:normal;color:var(--red);font-weight:inherit">${esc(t("Te contestamos cuanto antes.", "We'll get back to you asap."))}</em></h3>
  <button type="button" class="btn" style="margin-top:24px" data-otra>${esc(t("Enviar otra solicitud", "Send another request"))}</button>
</div>`;
}

export function eventos(i, { locales, seo, ldGlobal, eventos: ev, galerias, carta, raiz }) {
  const { t, lang } = i;
  const s = seo.find((r) => r.p === RUTA);
  // Campo de eventos.json según idioma: en EN usa "<clave>_en" si tiene contenido.
  const campo = (k) => {
    if (!ev) return "";
    if (lang === "en" && ev[k + "_en"] != null && String(ev[k + "_en"]).trim() !== "") return String(ev[k + "_en"]);
    return ev[k] != null ? String(ev[k]) : "";
  };
  const eb = (k, fb) => (campo(k).trim() ? mdInline(campo(k)) : fb);
  const ebp = (k, fb) => (campo(k).trim() ? mdParas(campo(k), "body") : fb);
  const eh = (k, negro, rojo) => (campo(k).trim() ? mdInline(campo(k)) : (rojo ? negro + " " + rojo : negro));
  const p = (html, aire) => `<p class="body"${aire ? ` style="margin-top:${aire}px"` : ""}>${html}</p>`;
  // Dossier de tarifas (campo `dossier`). Sveltia guarda la ruta con o sin "/"
  // inicial; una URL absoluta se respeta por si algún día se aloja fuera.
  const dossierRaw = campo("dossier").trim();
  const dossier = !dossierRaw ? DOSSIER_POR_DEFECTO
    : (/^(https?:)?\/\//i.test(dossierRaw) || dossierRaw.startsWith("/")) ? dossierRaw : "/" + dossierRaw.replace(/^\.?\//, "");
  const nombres = nombresPorFoto(i, carta);
  const producto = (galerias.producto || []).map((f) => ({ ...f, name: f.name || nombres[f.src] || "" }));

  const seccion = (n, rotulo, titulo, derecha, extraIzq = "") => `<section class="ev-split">
  <div>
    <div class="tiny muted">[${n}] ${esc(rotulo)}</div>
    <h2 class="h-1" style="margin-top:16px">${titulo}</h2>${extraIzq}
  </div>
  <div>
${derecha}
  </div>
</section>`;

  const main = `<div data-screen-label="eventos">
<section class="ev-hero">
  <div class="tiny muted">[05] ${esc(t("Eventos", "Events"))}</div>
  <h1 class="h-display" style="margin-top:16px">${eh("hero_title", esc(t("Un sitio cool", "A cool place")), esc(t("para eventos cool.", "for cool events.")))}</h1>
  <div class="ev-hero-row" style="margin-top:32px;display:flex;flex-wrap:wrap;align-items:center;gap:32px">
    <p class="body" style="font-size:18px;flex:1 1 420px;min-width:0;margin:0">${eb("hero_body", lang === "en"
      ? "A 5-minute walk from Santiago Bernabéu, designed by <strong>Nota Estudio</strong>. 55 m² open-plan, open kitchen, up to 40 seated or 60 standing, a powerful sound system and considered lighting. A place worthy of your event."
      : "A 5 minutos del Santiago Bernabéu y diseñado por <strong>Nota Estudio</strong>. 55 m² diáfanos, cocina abierta, hasta 40 personas sentadas o 60 de pie, equipo de sonido potente y luz pensada. Un sitio a la altura de tu evento.")}</p>
  </div>
  <div class="ev-hero-cta">
    <a class="btn" href="${esc(dossier)}" target="_blank" rel="noreferrer"><span class="btn-label">${esc(t("Descargar dossier con tarifas", "Download dossier with rates"))}</span><span class="btn-arrow">↓</span></a>
  </div>
</section>

${seccion("01", t("Espacio", "Space"),
    eh("espacio_title", lang === "en" ? "A well-designed,<br>functional place<br>you'll want to be in." : "Un sitio bien diseñado,<br>funcional, en el que<br>apetece estar."),
    p(eb("espacio_body", lang === "en"
      ? "An open-plan <strong>55 m²</strong> space with an <strong>open kitchen</strong> integrated into the room. It blends a <strong>minimal, urban</strong> feel with <strong>cosmopolitan coolness</strong>. Configurable to your event's needs."
      : "Espacio diáfano de <strong>55 m²</strong> con <strong>cocina abierta</strong> integrada en la sala. Combina un aire <strong>minimal y urbano</strong> con un <strong>coolness cosmopolita</strong>. Configurable según necesidades del evento."))
    + `
    <div class="ev-list">
      ${[[t("TAMAÑO / AFORO", "SIZE / CAPACITY"), t("55m² / 40 personas sentadas / 60 de pie", "55m² / 40 seated / 60 standing")],
         [t("Barra central", "Central bar"), t("Sí · grande", "Yes · large")],
         [t("Mesas bajas", "Low tables"), t("9 · hasta 3 personas c/u", "9 · up to 3 people each")],
         [t("Mesas altas", "High tables"), t("2 · hasta 5 personas c/u", "2 · up to 5 people each")],
         [t("Barra pequeña", "Small bar"), t("Hasta 4 personas", "Up to 4 people")],
         [t("Audio", "Audio"), t("Equipo potente", "Powerful system")],
         [t("Iluminación", "Lighting"), t("Diseño óptimo", "Optimal design")],
         [t("Despejado", "Cleared"), t("Opción sin mesas", "Table-free option")],
        ].map(([b, v]) => `<div><b>${esc(b)}</b><span>${esc(v)}</span></div>`).join("\n      ")}
    </div>
    ${galeria(i, { fotos: galerias.espacio || [], ratio: "3 / 4", etiquetaHueco: "Espacio", raiz, modo: "paginado", etiqueta: "Espacio" })}`)}

${seccion("02", t("Producto", "Product"),
    eh("producto_title", lang === "en" ? "Homemade dumplings,<br>surprising,<br>" : "Dumplings caseros,<br>sorprendentes,<br>", esc(t("para todos.", "for everyone."))),
    ebp("producto_body", lang === "en"
      ? p("DUM DUM™ is one of the <strong>go-to dumpling spots in Madrid</strong>. <strong>Thin, pleasant</strong> dough, <strong>generous</strong> fillings, recipes that <strong>surprise</strong>. From the Cheese Burger to the Carbonara, plus the famous Gamba K-Pop or the Honey Pumpkin. And always with <strong>fun options for vegetarians</strong>.") + "\n" + p("Food made to <strong>entertain, surprise</strong> and feed <strong>every palate</strong>.", 16)
      : p("DUM DUM™ es uno de los <strong>referentes de dumplings en Madrid</strong>. Masa <strong>fina y agradable</strong>, rellenos <strong>generosos</strong>, recetas que <strong>sorprenden</strong>. Del Cheese Burger al Carbonara, pasando por el famoso Gamba K-Pop o el Honey Pumpkin. Y siempre con <strong>opciones divertidas para vegetarianos</strong>.") + "\n" + p("Un producto pensado para <strong>divertir, sorprender</strong> y dar de comer a <strong>todos los paladares</strong>.", 16))
    + "\n    " + galeria(i, { fotos: producto, ratio: "3 / 4", etiquetaHueco: "Producto", raiz, modo: "paginado", etiqueta: "Producto", visor: "platos", huecos: 9 }),
    `\n    <a class="btn" href="${i.ruta("/menu")}" style="margin-top:32px">${esc(t("Ver la carta", "See the menu"))} →</a>`)}

${seccion("03", t("Prensa", "Press"),
    eh("prensa_title", lang === "en" ? "A place in the spotlight that<br>" : "Un lugar de actualidad que<br>", esc(t("genera atención.", "draws attention."))),
    p(eb("prensa_body", lang === "en"
      ? "A <strong>disruptive food concept</strong>, a space with <strong>identity</strong> and care for detail. That has caught the eye of <strong>major national media</strong>."
      : "<strong>Concepto gastronómico disruptivo</strong>, espacio con <strong>identidad</strong> y cuidado por los detalles. Eso ha llamado la atención de los <strong>grandes medios nacionales</strong>."))
    + "\n    " + galeria(i, { fotos: galerias.prensa || [], ratio: "3 / 4", etiquetaHueco: "Noticia", raiz, modo: "paginado", etiqueta: "Prensa", cta: "Ver noticia →" }))}

${seccion("04", t("Redes", "Social"),
    eh("redes_title", lang === "en" ? "A content engine<br>" : "Generador de contenido<br>", esc(t("que se hace viral.", "that goes viral."))),
    p(eb("redes_body", lang === "en"
      ? "<strong>Food experts, lifestyle profiles</strong> and people with a <strong>great algorithm</strong> have stopped by DUM DUM™ and <strong>shared it with their communities</strong>."
      : "<strong>Expertos gastro, perfiles lifestyle</strong> y gente con <strong>muy buen algoritmo</strong> se han pasado por DUM DUM™ y lo han <strong>compartido con sus comunidades</strong>."))
    + `
    <div class="ev-stats">
      <div><b>${esc(t("Millones", "Millions"))}</b><span>${esc(t("de visualizaciones", "of views"))}</span></div>
      <div><b>${esc(t("Miles", "Thousands"))}</b><span>${esc(t("de reacciones", "of reactions"))}</span></div>
      <div><b>Viral</b><span>${esc(t("la palabra que más se repite", "the word that comes up most"))}</span></div>
    </div>
    ${sliderReels(galerias.redes || [])}`)}

${seccion("05", t("Universo", "Universe"),
    eh("universo_title", lang === "en" ? "A brand with identity,<br>fresh," : "Una marca con identidad,<br>fresca,", esc(t("pensada para entretener.", "built to entertain."))),
    p(eb("universo_body", lang === "en"
      ? "DUM DUM™ exists with one motivation: <strong>for people to have a good time</strong>. That experience starts <strong>long before</strong> you walk into the restaurant. So we make the most of <strong>every touchpoint</strong> to create <strong>memorable moments</strong>: every post, every campaign, every reply to every review."
      : "DUM DUM™ existe con una motivación: <strong>que la gente lo pase bien</strong>. Esa experiencia arranca <strong>mucho antes</strong> de entrar al restaurante. Por eso aprovechamos <strong>cada punto de contacto</strong> para generar <strong>momentos memorables</strong>: cada post, cada campaña, cada respuesta a cada reseña."))
    + "\n    " + sliderYouTube(galerias.universo || []).replace('<div class="ev-slider ev-slider-cols-1"', '<div class="ev-slider ev-slider-cols-1" style="margin-top:32px"'),
    `\n    <a class="btn" href="${E.INSTAGRAM_URL}" target="_blank" rel="noreferrer" style="margin-top:32px">${esc(t("Visitar Instagram", "Visit Instagram"))} →</a>`)}

${seccion("06", t("Al frente", "At the helm"),
    `Kéril<br><em style="font-style:normal;color:var(--red);font-weight:inherit">&amp;</em> Yerai.`,
    ebp("frente_body", (lang === "en"
      ? ["They learned to <strong>work together</strong> at the hotel where their parents worked.",
         "<strong>Kéril</strong> trained as a <strong>chef</strong> and has been executive chef at some very cool places. He's a boss.",
         "<strong>Yerai</strong> trained in <strong>advertising</strong> and has been <strong>creative director</strong> for very big brands.",
         "They're good people. <strong>Rigorous. Creative. Very human.</strong>", "You'll get to know them."]
      : ["Aprendieron a <strong>trabajar juntos</strong> en el hotel donde trabajaban sus padres.",
         "<strong>Kéril</strong> se formó como <strong>chef</strong> y ha sido chef ejecutivo en sitios muy guays. Es un capo.",
         "<strong>Yerai</strong> se formó como <strong>publicista</strong> y ha sido <strong>director creativo</strong> de marcas muy grandes.",
         "Son gente maja. <strong>Rigurosos. Creativos. Muy humanos.</strong>", "Ya les conocerás."]
    ).map((h, n) => p(h, n ? 16 : 0)).join("\n")),
    `\n    <div class="tiny muted" style="margin-top:12px">${eb("frente_subtitle", esc(t("Dos hermanos · de Elche a Madrid", "Two brothers · from Elche to Madrid")))}</div>`)}

<section class="ev-services">
  <div class="tiny muted">[07] ${esc(t("Servicios", "Services"))}</div>
  <h2 class="h-1" style="margin-top:16px;max-width:20ch">${esc(t("Qué hacemos.", "What we do."))}</h2>
  <div class="ev-services-grid">
    ${["Afterwork", "Cocktails", "Team Building", "Workshops", t("Presentaciones", "Launches"), t("Alquiler de espacio", "Venue rental")]
      .map((nombre, n) => `<div class="ev-service"><div class="n">[${String(n + 1).padStart(2, "0")}]</div><div class="t">${esc(nombre)}</div></div>`).join("\n    ")}
  </div>
  <p class="tiny muted" style="margin-top:24px">${esc(t("* Si necesitas un evento fuera del restaurante, pregúntanos.", "* If you need an event outside the restaurant, just ask."))}</p>
</section>

<section class="ev-split ev-split--contact" id="contact-eventos">
  <div>
    <div class="tiny muted">[08] ${esc(t("Contacto", "Contact"))}</div>
    <h2 class="h-1" style="margin-top:16px;max-width:12ch">${eh("contacto_title", esc(t("Cuéntanos qué evento tienes en la", "Tell us what event you have in")), esc(t("cabeza.", "mind.")))}</h2>
  </div>
  <div>
${formulario(i)}
  </div>
</section>
</div>`;
  return {
    titulo: lang === "en" ? (s.te || s.t) : s.t,
    desc: lang === "en" ? (s.de || s.d) : s.d,
    cuerpo: esqueleto(i, RUTA, locales, main),
    ld: ldGlobal,
  };
}
