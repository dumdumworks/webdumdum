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
import { srcset } from "../imagenes.mjs";
import { icono } from "./local.mjs";

export const RUTA = "/taller-team-building";
const DOSSIER = "/img/dossier/DUMDUM_DOSSIER_EVENTOS.pdf";

// [titulo es/en, frase es/en] de cada paso — mismo proceso real de siempre
// (equipos → masa → montaje → cocinado → degustación), pero contado como lo
// que es: una tarde metiendo las manos en la masa con gente con la que
// normalmente solo compartes Slack.
const PASOS = [
  ["Equipos", "Teams",
    "Os ponemos por equipos. No hagáis la de \"hacemos nosotros los equipos\" porque no. De hecho, os vamos a poner con el que más lejos tengáis.",
    "We put you in teams. Don't try the “we'll make our own teams” move, because no. In fact, we're going to put you with whoever you're most distant from."],
  ["A hacer masa", "Making the dough",
    "Te pones hasta arriba de harina, pero increíble momento porque la harina mancha igual al trainee que al CEO. Y eso iguala.",
    "You get covered head to toe in flour — but it's an incredible moment, because the flour stains the trainee the same as the CEO. And that levels things out."],
  ["A hacer dumplings", "Making the dumplings",
    "A partir del tercero salen mejor. Igual, lo importante no es hacerlos bien sino poder hacerlos mal y no sentir que te van a despedir.",
    "From the third one on they come out better. Anyway, the important thing isn't making them well but being able to make them badly and not feel like you're getting fired."],
  ["A cocinar", "Time to cook",
    "Vapor, salsa, toppings y listo. Es guay porque aquí puede que los jefes lo hagan peor y tú les enseñas y se callan la boca y te dan la razón.",
    "Steam, sauce, toppings, and done. It's cool because here the bosses might do it worse and you show them and they shut up and admit you're right."],
  ["A comer", "Time to eat",
    "Os sentáis y os coméis el resultado. Os aplaudís porque os lo currastéis y la comida os sabe a gloria porque lo habéis hecho vosotros. FIN.",
    "You sit down and eat the result. You applaud each other because you busted your ass for it, and the food tastes like glory because you made it yourselves. THE END."],
];
const FAQ = [
  { q: ["¿Puedo hacer el taller con mi pareja?", "Can I do the workshop with my partner?"],
    a: ["El taller está diseñado para empezar en grupos de 6 personas. Así que sí, siempre y cuando se apunten al plan 4 personas más.",
      "The workshop is designed to start with groups of 6. So yes, as long as 4 more people join the plan."] },
  { q: ["¿Cuánto dura la experiencia?", "How long does the experience last?"],
    a: ["Entre 2 y 2,5 horas: bienvenida, una hora y cuarto de taller y otra hora y cuarto de comida. Se puede alargar bajo consulta.",
      "Between 2 and 2.5 hours: welcome, an hour and 15 minutes of workshop, and another hour and 15 minutes of food. Can run longer on request."] },
  { q: ["¿Qué incluye?", "What's included?"],
    a: ["El taller completo, y una degustación que incluye un entrante a compartir, toda la carta de dumplings por persona, una bebida y un mochi de postre.",
      "The full workshop, plus a tasting that includes a starter to share, the whole dumpling menu per person, one drink and a mochi for dessert."] },
  { q: ["¿Se puede adaptar a alergias o vegetarianos?", "Can it be adapted for allergies or vegetarians?"],
    a: ["Sí. La carta tiene opciones vegetarianas y cada plato lleva marcados sus alérgenos — nos cuentas las restricciones del grupo antes del taller y lo dejamos todo listo.",
      "Yes. The menu has vegetarian options and every dish lists its allergens — tell us the group's restrictions before the workshop and we'll have it all sorted."] },
  { q: ["¿Y si se nos quema todo?", "What if we burn everything?"],
    a: ["Para eso está equipo, para que no pase nada. Y si pasa, pues risas. Lo que sea menos dramas.",
      "That's what the team's there for, so nothing goes wrong. And if it does, well, laughs. Anything but drama."] },
  { q: ["¿Podéis adaptar el taller a otro tipo de evento?", "Can you adapt the workshop for a different kind of event?"],
    a: ["Sí: el espacio, la carta y el formato se adaptan al tipo de evento. Cumpleaños, despedidas, presentaciones… cuéntanos qué necesitas y le buscamos forma.",
      "Yes: the space, the menu and the format all adapt to the type of event. Birthdays, leaving dos, launches… tell us what you need and we'll make it work."] },
  { q: ["¿Hacéis talleres de dumplings para empresas?", "Do you run dumpling workshops for companies?"],
    a: ["Sí. Es exactamente el mismo taller, adaptado a empresas: departamentos enteros, onboardings, celebraciones de equipo… Cuéntanos cuántos sois y para qué es, y lo organizamos.",
      "Yes. It's the same workshop, adapted for companies: whole departments, onboardings, team celebrations… Tell us how many you are and what it's for, and we'll set it up."] },
  { q: ["¿Dónde se hace el taller?", "Where does the workshop take place?"],
    a: ["En {{bernabeu}}, en Infanta Mercedes 17 (Madrid): a cinco minutos andando del Santiago Bernabéu y de AZCA.",
      "At {{bernabeu}}, on Infanta Mercedes 17 (Madrid): a five-minute walk from the Santiago Bernabéu and from AZCA."] },
  { q: ["¿Se puede llevar la experiencia fuera del restaurante?", "Can the experience be taken outside the restaurant?"],
    a: ["Se puede. Consúltanos y adecuamos la experiencia en función del lugar al que vayamos.",
      "It can. Get in touch and we'll adapt the experience to wherever we're headed."] },
];

// Cada línea de un titular es un <span> propio (no texto separado por
// <br>): el bloque es flex-column y alinea con align-items en vez de
// text-align, porque text-align con una línea más ancha que su columna la
// desborda pegada al borde IZQUIERDO en vez de al derecho — align-items no
// tiene ese problema y la deja pegada al borde que toca aunque desborde.
const lineasSpans = (lineas) => lineas.map((l, idx) => `<span class="tz-l${idx}">${esc(l)}</span>`).join("");
// [antes, clave, después] del párrafo bajo cada titular: la "clave" es la
// palabra clave de la frase, en negrita — el texto en sí no cambia ni una
// letra, solo se marca dónde empieza y acaba el <strong>.
const resaltar = ([antes, clave, despues]) => `${esc(antes)}<strong>${esc(clave)}</strong>${esc(despues)}`;
// Palabra en peso normal dentro de un titular en negrita (los sellos: "2026",
// "TALLER" y "DE" van en Oswald regular, no en el 700 del resto de la
// palabra — así estaba en el dibujo original de Yerai).
const reg = (s) => `<span class="taller2-sello-reg">${esc(s)}</span>`;

// RESERVADO — Yerai ha pedido guardar este copy (titular + párrafo de
// Grupo, Dónde y Carta) para reutilizarlo más adelante en otro sitio de la
// página; de momento no se llama desde ningún lado (su hueco lo ocupa
// ahora el timeline de más abajo). No borrar.
// El grupo ("Grupos desde 6 hasta 30 personas"): la foto cae a la derecha
// (fila con --rev, ver CSS), así que el titular va a su izquierda,
// alineado arriba con ella y con el texto pegado a la derecha (el borde
// que mira hacia la foto).
const GRUPO_LINEAS = {
  es: ["GRUPOS", "DE 6 A 30", "PERSONAS"],
  en: ["GROUPS", "FROM 6", "TO 30", "PEOPLE"],
};
const GRUPO_DESC = {
  es: ["Esa franja es la óptima, pero también lo hemos hecho con ", "grupos más grandes", " y la cosa es organizarse. Si tu grupo es de más gente, cuéntanos."],
  en: ["That range is the optimal one, but we've also done it with ", "bigger groups", " — it's just a matter of organising. If your group is bigger, let us know."],
};
const grupoTexto = (i) => `<div class="taller-zigzag-col">
      <div class="taller-zigzag-titular-cont">
        <div class="taller-zigzag-horas taller-zigzag-horas--grupo-${i.lang}">${lineasSpans(GRUPO_LINEAS[i.lang])}</div>
        <p class="body taller-zigzag-horas-desc">${resaltar(GRUPO_DESC[i.lang])}</p>
      </div>
    </div>`;

// El "Dónde" ("Solo en Dum Dum de Bernabéu"): la foto cae a la izquierda
// (fila sin --rev) y el titular a su derecha, arriba del todo y pegado a
// su borde izquierdo.
const DONDE_LINEAS = {
  es: ["SOLO EN", "DUM DUM", "BERNABÉU"],
  en: ["ONLY AT", "DUM DUM", "BERNABÉU"],
};
const DONDE_DESC = {
  es: ["Lo hacemos solo en este restaurante porque es el grande, el que tiene la ", "cocina integrada", ", el que os hace sentir un poco como en The Bear, el que queda mejor en las fotos y en el que vais a estar a gusto, que es lo importante."],
  en: ["We only do it in this restaurant because it's the big one, the one with the ", "open kitchen", ", the one that makes you feel a bit like you're in The Bear, the one that looks best in photos, and the one where you'll be comfortable — which is what matters."],
};
const dondeTexto = (i) => `<div class="taller-zigzag-col">
      <div class="taller-zigzag-titular-cont">
        <div class="taller-zigzag-horas taller-zigzag-horas--donde-${i.lang}">${lineasSpans(DONDE_LINEAS[i.lang])}</div>
        <p class="body taller-zigzag-horas-desc">${resaltar(DONDE_DESC[i.lang])}</p>
      </div>
    </div>`;

// "Incluye" ("Degusta de toda la carta"), misma lógica que "grupos de...":
// la foto cae a la derecha (fila con --rev) y el titular a su izquierda,
// pegado al borde que mira hacia la foto.
const CARTA_LINEAS = {
  es: ["DEGUSTA", "DE TODA", "LA CARTA"],
  en: ["TASTING", "THE WHOLE", "MENU"],
};
const CARTA_DESC = {
  es: ["Una vez hayáis cocinado, se prueba ", "todo lo que haya en carta", " en el restaurante. Incluye un entrante a compartir, una bebida, una cata de todos los dumplings de la carta y un postre. Que os ponéis finos, vaya."],
  en: ["Once you're done cooking, you get to taste ", "everything on the menu", " at the restaurant. It includes a starter to share, a drink, a tasting of every dumpling on the menu, and a dessert. You'll be properly spoiled, honestly."],
};
const cartaTexto = (i) => `<div class="taller-zigzag-col">
      <div class="taller-zigzag-titular-cont">
        <div class="taller-zigzag-horas taller-zigzag-horas--carta-${i.lang}">${lineasSpans(CARTA_LINEAS[i.lang])}</div>
        <p class="body taller-zigzag-horas-desc">${resaltar(CARTA_DESC[i.lang])}</p>
      </div>
    </div>`;

// Datos esenciales (Grupo, Dónde, Carta, Duración) bajo el timeline, en una
// retícula de 2x2 — copy propio de este bloque, no el reservado de más
// arriba: aquí los titulares van a dos líneas cortas. El párrafo lleva su
// palabra clave en negrita (mismo patrón [antes, clave, después] +
// resaltar() de arriba) — Grupo, Dónde y Carta repiten la misma clave que
// ya tenía el copy reservado; en Duración, la cifra.
const DATOS_ESENCIALES = [
  {
    ico: "aforo",
    titulo: { es: ["GRUPOS", "DE 6 A 30"], en: ["GROUPS", "OF 6 TO 30"] },
    desc: {
      es: ["Esa franja es la óptima, pero también lo hemos hecho con ", "grupos más grandes", " y la cosa es organizarse. Si tu grupo es de más gente, cuéntanos."],
      en: ["That range is the optimal one, but we've also done it with ", "bigger groups", " — it's just a matter of organising. If your group is bigger, let us know."],
    },
  },
  {
    ico: "pin",
    titulo: { es: ["SOLO EN", "BERNABÉU"], en: ["ONLY AT", "BERNABÉU"] },
    enlaceUltimaLinea: (i) => i.ruta("/locales/bernabeu"),
    desc: {
      es: ["Lo hacemos solo aquí porque es el grande, el que tiene la ", "cocina integrada", ", el que os hace sentir un poco como en The Bear, el que queda mejor en las fotos y en el que vais a estar a gusto, que es lo importante."],
      en: ["We only do it here because it's the big one, the one with the ", "open kitchen", ", the one that makes you feel a bit like you're in The Bear, the one that looks best in photos, and the one where you'll be comfortable — which is what matters."],
    },
  },
  {
    ico: "dumpling",
    titulo: { es: ["DEGUSTA TODA", "LA CARTA"], en: ["TASTE THE", "WHOLE MENU"] },
    desc: {
      es: ["Una vez hayáis cocinado, se prueba ", "todo lo que haya en carta", " en el restaurante. Incluye un entrante a compartir, una bebida, una cata de todos los dumplings de la carta y un postre. Que os ponéis finos, vaya."],
      en: ["Once you're done cooking, you get to taste ", "everything on the menu", " at the restaurant. It includes a starter to share, a drink, a tasting of every dumpling on the menu, and a dessert. You'll be properly spoiled, honestly."],
    },
  },
  {
    ico: "hora",
    titulo: { es: ["UN PAR", "DE HORITAS"], en: ["A COUPLE", "OF HOURS"] },
    desc: {
      es: ["La experiencia está pensada para que en ", "2 - 2,5 horas", " os dé tiempo a terminar el taller y a comer. Todo ágil, sin parones, dinámico y preparado para que nadie se aburra. Cortio. Al pie."],
      en: ["The experience is designed so that in ", "2 - 2.5 hours", " you have time to finish the workshop and eat. All fast-paced, no downtime, dynamic, and built so nobody gets bored. Short. Sweet."],
    },
  },
];
// Cuando el dato lleva "enlaceUltimaLinea", esa última línea del titular
// (p. ej. "BERNABÉU") se enlaza a esa ruta — el resto de líneas siguen igual
// que lineasSpans(). Subrayado (no solo :hover) porque --ink es --red: el
// titular ya es rojo, así que el :hover de .link-hover no se nota.
const datoEsencial = (i, { ico, titulo, desc, enlaceUltimaLinea }) => {
  const lineas = titulo[i.lang];
  const spans = enlaceUltimaLinea
    ? lineas.map((l, idx) => idx === lineas.length - 1
        ? `<span class="tz-l${idx}"><a href="${enlaceUltimaLinea(i)}" class="link-hover link-underline">${esc(l)}</a></span>`
        : `<span class="tz-l${idx}">${esc(l)}</span>`).join("")
    : lineasSpans(lineas);
  return `<div class="taller2-dato">
      <span class="taller2-dato-ico">${icono(ico)}</span>
      <div class="taller2-dato-titulo">${spans}</div>
      <p class="body taller2-dato-desc">${resaltar(desc[i.lang])}</p>
    </div>`;
};
const datosEsenciales = (i) => `<div class="taller2-datos">
    ${DATOS_ESENCIALES.map((d) => datoEsencial(i, d)).join("\n    ")}
  </div>`;

const fotoFigura = (foto, raiz) => {
  const ss = srcset(raiz, foto.src);
  const sizes = "(max-width: 879px) 100vw, 480px";
  return `<figure class="taller-zigzag-foto"><img src="${esc(foto.src)}"${ss ? ` srcset="${esc(ss)}" sizes="${esc(sizes)}"` : ""} alt="" style="object-position:${esc(foto.pos || "50% 50%")}" loading="lazy" decoding="async"></figure>`;
};

// Timeline en zigzag (sustituye al bloque de arriba, de momento solo en
// escritorio): mismo copy que el riel horizontal de "El taller, paso por
// paso" (PASOS). Solo se decide aquí dónde parte cada título en líneas —
// mismo cqw que "Grupos"/"Dónde"/"Carta", sin retocar tamaños.
const PASO_LINEAS = {
  es: [["EQUIPOS"], ["LA", "MASA"], ["LOS DUM-", "PLINGS"], ["COCI-", "NAMOS"], ["TODOS A", "COMER!"]],
  en: [["TEAMS"], ["MAKING THE", "DOUGH"], ["MAKING THE", "DUMPLINGS"], ["TIME TO", "COOK"], ["TIME TO", "EAT"]],
};
// Foto real de cada paso (encargo de Yerai), en el mismo orden que PASOS.
// Las cinco vienen ya a 3:4 (1000x1333) — el mismo ratio del hueco
// (.taller-zigzag-foto), así que no hace falta recortar con object-position.
const FOTO_PASO = [
  { src: "img/taller/01-equipos.jpg" },
  { src: "img/taller/02-masa.jpg" },
  { src: "img/taller/03-dumplings.jpg" },
  { src: "img/taller/04-cocinar.jpg" },
  { src: "img/taller/05-comer.jpg" },
];
// Reseñas de pega en el aire que dejan los párrafos cortos (la foto mide
// 640px, el párrafo mucho menos): mismo componente y broma de las dos
// reseñas del hero (.taller2-resena — empleado ficticio, cita entre
// comillas, nombre y rol de coña), no uno nuevo. Una por paso, indexadas
// por el índice del paso (0 = Equipos, 1 = A hacer masa…).
const RESENAS_PASO = {
  0: {
    es: {
      texto: "“Me encantó mi equipo. Éramos el de recepción, la CFO, el trainee de cuentas y yo, Parecíamos la Comunidad del Anillo. Me sentía un poco Frodo. También es verdad que mido 1,40.”",
      autor: "Luis Tovar",
      rol: "En la oficina le llaman Luisito, pero desde ese día, con cariño.",
    },
    en: {
      texto: "“I loved my team. It was the receptionist, the CFO, the accounts trainee and me — we looked like the Fellowship of the Ring. I felt a bit like Frodo. Though, to be fair, I am 4'7”.”",
      autor: "Luis Tovar",
      rol: "At the office they call him Luisito, but ever since that day, it's said with love.",
    },
  },
  1: {
    es: {
      texto: "“Le dije a mi jefe que ya que estábamos estirando masa podía, también, estirarse un poco con la pasta. Me dijo: la frase está bien pillada pero no te flipes. Nos reímos sin mirarnos. Desde entonces nos saludamos en el ascensor.”",
      autor: "Marina Nogales",
      rol: "Es la hija del jefe pero en la oficina no lo sabe nadie. Ni si quiera el jefe.",
    },
    en: {
      texto: "“I told my boss that since we were already rolling out dough, he could loosen up the dough a bit too. He said: nice one, but don't push it. We laughed without looking at each other. Ever since, we just nod in the lift.”",
      autor: "Marina Nogales",
      rol: "She's the boss's daughter, but nobody at the office knows it. Not even the boss.",
    },
  },
  2: {
    es: {
      texto: "“Llevaba años preguntándome si el de contabilidad no era aquel tío majete que conocí en aquel coffee shop de Amsterdam. Cuando le vi cerrando dumplings desaparecieron todas mis dudas.”",
      autor: "Pablo Gómez",
      rol: "growth manager en la empresa. y en su jardín hidropónico.",
    },
    en: {
      texto: "“I'd spent years wondering whether the guy from accounting was that nice bloke I met at a coffee shop in Amsterdam. The moment I saw him folding dumplings, all my doubts disappeared.”",
      autor: "Pablo Gómez",
      rol: "growth manager at the company. and in his hydroponic garden.",
    },
  },
  // Misma reseña de Juan García que ya aparece en el hero de arriba
  // (.taller2-hero-media): copy idéntico, reutilizado aquí para el aire
  // que deja el párrafo de "Cocinamos".
  3: {
    es: {
      texto: "“Lo mejor del taller es que no es un escape room. Bastante tenemos con escapar a las 18.30.”",
      autor: "Juan García",
      rol: "Empleado ficticio para soltar factos que nadie se atreve a decir",
    },
    en: {
      texto: "“The best part of the workshop is that it's not an escape room. We already do enough escaping at 6:30pm.”",
      autor: "Juan García",
      rol: "Fictional employee, here to say the facts nobody else dares to",
    },
  },
};
const resenaPaso = (i, idx) => {
  const grupo = RESENAS_PASO[idx];
  if (!grupo) return "";
  const r = grupo[i.lang];
  return `<div class="taller2-resena taller2-resena--paso">
        <div class="taller2-resena-estrellas" aria-hidden="true">★★★★★</div>
        <p class="taller2-resena-texto">${esc(r.texto)}</p>
        <p class="taller2-resena-autor">${esc(r.autor)}</p>
        <p class="tiny muted taller2-resena-rol">${esc(r.rol)}</p>
      </div>`;
};
const pasoTexto = (i, idx) => {
  const [, , esC, enC] = PASOS[idx];
  return `<div class="taller-zigzag-col">
      <div class="taller-zigzag-titular-cont">
        <div class="timeline-num-fila">
          <span class="timeline-num">${idx + 1}.</span>
          <span class="hr timeline-num-linea" aria-hidden="true"></span>
        </div>
        <div class="taller-zigzag-horas taller-zigzag-horas--paso-${i.lang}${idx === 2 && i.lang === "es" ? " taller-zigzag-horas--dumplings-mobile" : ""}">${lineasSpans(PASO_LINEAS[i.lang][idx])}</div>
        <p class="body taller-zigzag-horas-desc">${esc(i.lang === "en" ? enC : esC)}</p>
      </div>
      ${resenaPaso(i, idx)}
    </div>`;
};
// Conector entre una fila y la siguiente (filete fino + flecha "↓", como
// las que ya usamos en los botones): baja desde el centro de la foto de
// arriba, salta al centro de la foto de abajo (lado contrario, por el
// zigzag) y entra en ella. Los dos centros son fijos (480px de foto + 40px
// de hueco, igual que el resto del bloque), así que no hace falta medir
// nada por fila.
// Un solo trazo SVG (antes tres <span> con background + un carácter "↓"):
// con CSS, el filete horizontal caía en un píxel fraccionario (herencia del
// alto de la foto, que no es un entero exacto) y salía más grueso y borroso
// que los verticales — un rectángulo de 1px de alto se difumina distinto
// según en qué mitad de píxel caiga, y ahí caía peor. Un trazo vectorial no
// tiene ese problema: se antialiasa igual en horizontal y en vertical pase
// lo que pase. La flecha, ahora una "v" del mismo trazo, no un carácter de
// fuente aparte — así no hay una costura entre el grosor de la línea y el
// grosor de la tipografía justo donde se tocan.
const conector = (deIzqADer) => {
  const [x1, x2] = deIzqADer ? [240, 760] : [760, 240];
  return `<div class="timeline-conector" aria-hidden="true">
      <svg viewBox="0 0 1032 64" focusable="false">
        <path d="M${x1} 0 V32 H${x2} V56"/>
        <polyline points="${x2 - 5},51 ${x2},56 ${x2 + 5},51" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>`;
};

// Alterna de lado con --rev, igual que el bloque de arriba: impares con la
// foto a la derecha, pares con la foto a la izquierda — mismo criterio que
// el boceto de Yerai.
// Título del timeline: mismo Oswald gigante que los titulares de cada
// paso (no un h2 aparte en Helvetica) — así se lee como parte de la misma
// familia visual, no como un rótulo genérico. "EL TALLER" a toda anchura,
// pegado a la izquierda; "PASO A PASO" mucho más pequeño y metido en la
// esquina de abajo a la derecha, como una firma. Cada línea, su propio
// cqw sobre el ancho real del bloque (ver .taller2-titulo-hero).
// "grande" admite varias líneas (array): en inglés "The workshop" no cabe
// en una sola sin desbordar de mala manera, así que va partido en dos.
const TITULO_TIMELINE = {
  es: ["EL TALLER", "PASO A PASO"],
  en: [["THE", "WORKSHOP"], "STEP BY STEP"],
};
const tituloTimeline = (i) => {
  const [grande, peque] = TITULO_TIMELINE[i.lang];
  const grandeHtml = Array.isArray(grande) ? grande.map(esc).join("<br>") : esc(grande);
  return `<div class="taller2-titulo-hero taller2-titulo-hero--${i.lang}">
      <span class="taller2-titulo-hero-ancla">
        <span class="taller2-titulo-hero-grande">${grandeHtml}</span>
        <span class="taller2-titulo-hero-peque">${esc(peque)}</span>
      </span>
    </div>`;
};

const timeline = (i, raiz) => PASOS.map((_, idx) => {
  const rev = idx % 2 === 0;
  // Con un titular de 3 líneas queda menos aire libre en la foto: la fila
  // entera va más compacta (párrafo y reseña) para que no se salga.
  const compacta = PASO_LINEAS[i.lang][idx].length >= 3;
  const fila = `<div class="taller-zigzag-fila taller-zigzag-fila--grande taller-zigzag-fila--paso${rev ? " taller-zigzag-fila--rev" : ""}${compacta ? " taller-zigzag-fila--compacta" : ""}">
      ${fotoFigura(FOTO_PASO[idx], raiz)}
      ${pasoTexto(i, idx)}
    </div>`;
  return idx === 0 ? fila : conector(rev) + fila;
}).join("\n    ");

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
      acceptedAnswer: { "@type": "Answer", text: (i.lang === "en" ? a[1] : a[0]).replace("{{bernabeu}}", "DUM DUM Bernabéu") },
    })),
  };
}

// Sellos de "laurel de festival de cine" (Official Selection) a los lados
// de la foto del hero, en broma: el SVG (dibujo de Yerai) trae solo la
// corona de laurel y el filete; el texto es HTML de verdad encima —
// Oswald para el titular, Times New Roman para la coletilla — así se
// puede cambiar sin tocar el SVG y lo lee un lector de pantalla.
// "?v=" para forzar la caché (Cloudflare cachea las imágenes 4h por nombre;
// sin versión, quien haya cargado la página antes de un cambio en el SVG
// se queda viendo la corona vieja hasta que expire). Subir el número cada
// vez que se retoque alguno de los dos SVG.
const SELLO_V = 2;
const sello = (lado, archivo, w, h, titulo, sub) => `<div class="taller2-sello-wrap taller2-sello-wrap--${lado}">
      <img class="taller2-sello" src="img/logos/${archivo}?v=${SELLO_V}" alt="" width="${w}" height="${h}" loading="lazy" decoding="async">
      <p class="taller2-sello-titulo">${titulo.join("<br>")}</p>
      <p class="taller2-sello-sub">${sub.map(esc).join("<br>")}</p>
    </div>`;

export function tallerTeamBuilding(i, { locales, seo, ldGlobal, raiz }) {
  const { t } = i;
  const s = seo.find((r) => r.p === RUTA);
  const url = ORIGIN + i.ruta(RUTA);

  const main = `<div data-screen-label="taller-team-building">
<section class="ev-hero">
  <h1 class="tiny muted">${esc(t("Taller de dumplings · Team building para empresas y grupos en Madrid", "Dumpling workshop · Team building for companies and groups in Madrid"))}</h1>
  <h2 class="h-display" style="margin-top:16px">${esc(t("Un team building", "A team building"))}<br>${esc(t("que se come", "you can eat"))}</h2>
  <div class="ev-hero-row" style="margin-top:32px;display:flex;flex-wrap:wrap;align-items:center;gap:32px">
    <p class="body" style="font-size:18px;flex:1 1 420px;min-width:0;margin:0">${t(
      "Lo de <strong>tirarse de espaldas</strong> y esperar a que te cojan tus compañeros puede llegar a estar bien, pero eso luego <strong>no te lo puedes comer</strong>. Tampoco <strong>te puedes comer los post-its</strong> del juego ese de ponérselos en la frente con palabras. Y <strong>tampoco se puede hacer un dumpling con bolas de paintball</strong>. Sin embargo, <strong>en el taller de dumplings de DUM DUM™</strong>, cocinas en equipos, aprendes a hacer cosas y lo mejor es que, luego, te lo comes. <strong>Planazo, la verdad</strong>.",
      "<strong>Falling backwards</strong> and waiting for your workmates to catch you can be alright, but <strong>you can't eat that</strong> afterwards. <strong>You can't eat the post-its</strong> from that game where you stick words on your forehead either. And <strong>you can't make a dumpling out of paintball pellets</strong>. However, <strong>at DUM DUM™'s dumpling workshop</strong>, you cook in teams, you learn to make things, and the best part is that, afterwards, you eat it. <strong>What a plan, honestly</strong>.")}</p>
  </div>
  <div class="ev-hero-cta">
    <a class="btn red" href="${i.ruta("/eventos")}#contact-eventos"><span class="btn-label">${esc(t("Pedir presupuesto", "Get a quote"))}</span><span class="btn-arrow">→</span></a>
    <a class="btn" href="${esc(DOSSIER)}" target="_blank" rel="noreferrer"><span class="btn-label">${esc(t("Descargar dossier", "Download dossier"))}</span><span class="btn-arrow">↓</span></a>
  </div>
</section>

<div class="taller2-hero-media">
  ${sello("izq", "sello-mejor-team-building.svg", 260, 166,
    t([esc("MEJOR TEAM"), `${esc("BUILDING ")}${reg("2026")}`], [esc("BEST TEAM"), `${esc("BUILDING ")}${reg("2026")}`]),
    t(["SEGÚN NUESTRA MADRE", "QUE ES LA MEJOR"], ["ACCORDING TO OUR MOM", "WHO IS THE BEST"]))}
  <figure class="taller2-foto-hero">
    <img src="img/espacio/02-barra-horizontal.jpg" alt="${esc(t("La cocina de DUM DUM Bernabéu, con el equipo trabajando en la barra.", "The DUM DUM Bernabéu kitchen, with the team working the counter."))}" loading="eager" decoding="async">
    <figcaption>${esc(t(
      "Estudios demuestran que la manera de mejorar tu relación con los de la oficina es metiéndoos en una cocina. El estudio lo hemos hecho nosotros, y cuando lo hemos leído nos ha parecido bien.",
      "Studies show the way to improve your relationship with your officemates is getting into a kitchen together. We did the study ourselves, and when we read it, it seemed about right."))}</figcaption>
  </figure>
  ${sello("der", "sello-top1-dumplings.svg", 260, 146,
    t([`${esc("TOP 1 ")}${reg("TALLER")}`, `${reg("DE")}${esc(" DUMPLINGS")}`], [`${esc("TOP 1 ")}${reg("WORKSHOP")}`, `${reg("FOR")}${esc(" DUMPLINGS")}`]),
    t(["EN LA LISTA SOLO ESTAMOS", "NOSOTROS. JEJE."], ["WE'RE THE ONLY ONES", "ON THE LIST. HEH."]))}
</div>

<section class="taller2-esencial">
  <div class="tiny muted" style="text-align:center">${esc(t("Lo esencial", "The essentials"))}</div>
  ${tituloTimeline(i)}
  <div class="taller-zigzag-list taller-zigzag-list--paso">
    ${timeline(i, raiz)}
  </div>
  <div class="hr taller2-datos-filete" aria-hidden="true"></div>
  ${datosEsenciales(i)}
  <div style="text-align:center">
    <p class="taller2-esencial-nota">${esc(t("¿El precio? Te lo damos en cuanto nos cuentes cuántos sois.", "The price? We'll give it to you the moment you tell us how many you are."))}</p>
    <a class="btn red" href="${i.ruta("/eventos")}#contact-eventos"><span class="btn-label">${esc(t("Pedir presupuesto", "Get a quote"))}</span><span class="btn-arrow">→</span></a>
  </div>
  <div class="hr taller2-esencial-filete" aria-hidden="true"></div>
</section>

<section class="taller2-faq">
  <div class="taller2-faq-col">
    <div class="tiny muted">${esc(t("Preguntas frecuentes", "FAQ"))}</div>
    <h2 class="h-1" style="margin-top:16px;max-width:18ch">${esc(t("Lo que más nos preguntáis.", "What you ask us most."))}</h2>
    <details class="faq-toggle taller2-faq-toggle" open>
      <summary class="big">${esc(t("Preguntas frecuentes", "FAQ"))}<span class="faq-ico" aria-hidden="true"></span></summary>
      <div class="faq-list">
        ${FAQ.map(({ q, a }) => `      <details class="faq-item">
        <summary>${esc(i.lang === "en" ? q[1] : q[0])}<span class="faq-ico" aria-hidden="true"></span></summary>
        <p class="body">${esc(i.lang === "en" ? a[1] : a[0]).replace("{{bernabeu}}", `<a href="${i.ruta("/locales/bernabeu")}" class="link-hover">DUM DUM Bernabéu</a>`)}</p>
      </details>`).join("\n")}
      </div>
    </details>
  </div>
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
