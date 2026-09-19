// ─────────────────────────────────────────────────────────────
// Datos de los dos locales. FUENTE ÚNICA: los usan el shell (modales, footer),
// /locales, las fichas, la home y el JSON-LD. Si un dato cambia, se cambia AQUÍ.
// ─────────────────────────────────────────────────────────────
// Datos de los dos locales para reservas (DISH). Fuente única de verdad:
// la usan el selector de reservas y los botones directos (Locales, footer, home).
// Datos de los dos locales. FUENTE ÚNICA: los usan el selector de reservas, los
// botones directos (Locales, footer, home), la ficha ampliada de cada local
// (/locales/chamberi y /locales/bernabeu) y el JSON-LD que build.mjs inyecta en
// esas dos páginas. Si un dato cambia, se cambia AQUÍ y en ningún sitio más.
//   slug     → su URL bajo /locales/
//   tramos   → horario en minutos desde medianoche, como lo espera estadoApertura()
//   galeria  → clave de galerias.json con las fotos de ESE local (null = aún no hay)
//   cerca    → punto de interés al lado. Como dirLineas, va partido en DOS
//              líneas: los tres datos del resumen deben ocupar lo mismo o la
//              retícula deja de cuadrar. El corte se decide aquí, no se deja
//              al azar del ancho de columna.
//   borrador → true mientras el texto sea de RELLENO. Mientras lo sea, la ficha
//              pinta un aviso bien visible y el texto NO entra en el JSON-LD.
//              Al escribir el texto de verdad, se quita el flag y ya está.
export const LOCALES = {
  chamberi: {
    slug: "chamberi",
    nombre: "Chamberí",
    dir: "c/ Blasco de Garay, 10",
    calle: "Calle Blasco de Garay, 10",
    // Cómo se parte la dirección en el resumen: el corte se decide aquí y no
    // se deja al azar del ancho de columna.
    dirLineas: ["Blasco", "de Garay, 10"],
    cp: "28015",
    metro: "Argüelles · San Bernardo",
    // CONFIRMAR: minutos a pie desde la parada más cercana, sin verificar.
    metroTiempo: { es: "6 min a pie", en: "6 min walk" },
    aforo: { es: "~32 comensales", en: "~32 seats" },
    // Partido en dos como dirLineas: en la ficha de móvil va en una celda con
    // el resto de datos y todas tienen que ocupar las mismas líneas.
    aforoLineas: { es: ["~32", "comensales"], en: ["~32", "seats"] },
    desde: "2024",
    tel: "+34624560181",
    telHuman: "+34 624 56 01 81",
    tramos: [[780, 939], [1200, 1359]],
    mapa: "https://www.google.com/maps?q=DUM+DUM+Blasco+de+Garay+10+Madrid&output=embed",
    // CONFIRMAR: referencia y tiempo a pie sin verificar (la de Bernabéu sí
    // sale de eventos.json). Si no cuadra, se cambia aquí y ya.
    cerca: { es: ["Templo", "de Debod"], en: ["Templo", "de Debod"], tiempo: { es: "12 min a pie", en: "12 min walk" } },
    eid: "hydra-fcb7897f-acf9-48ce-a45b-4214fb3e8fc0",
    galeria: "chamberi",
    titular: { es: "El primero.", en: "The first one." },
    entradilla: {
      es: "Todo empezó en **Chamberí** en el **año 24**. No había mejor momento. Tampoco mejor lugar.",
      en: "It all started in **Chamberí** back in **'24**. There was no better moment. And no better place."
    },
    historia: {
      es: "Aquí nació DUM DUM™. Es un lugar pequeñín por eso, porque éramos unos recién nacidos. También por eso está tan mimado. Y quizá por todo esto el ambiente sea tan especial.\n\nEl barrio ayuda, la verdad. Chamberí. Es que es guay hasta decirlo. Y la gente que trabaja aquí es majísima. Casi tanto como la gente que viene a comer.\n\n**Vente un día. Te va a gustar.**",
      en: "This is where DUM DUM™ was born. It's a tiny little place for that reason, because we were newborns. That's also why it's so looked after. And maybe that's why the atmosphere is so special.\n\nThe neighbourhood helps, honestly. Chamberí. It's cool even to say it. And the people who work here are lovely. Almost as lovely as the people who come to eat.\n\n**Drop by one day. You'll like it.**"
    }
  },
  bernabeu: {
    slug: "bernabeu",
    nombre: "Bernabéu",
    dir: "c/ Infanta Mercedes, 17",
    calle: "Calle Infanta Mercedes, 17",
    dirLineas: ["Infanta", "Mercedes, 17"],
    cp: "28020",
    metro: "Tetuán · Estrecho",
    // CONFIRMAR: minutos a pie desde la parada más cercana, sin verificar.
    metroTiempo: { es: "5 min a pie", en: "5 min walk" },
    aforo: { es: "~40 sentados / 60 de pie", en: "~40 seated / 60 standing" },
    aforoLineas: { es: ["~40 sentados", "60 de pie"], en: ["~40 seated", "60 standing"] },
    desde: "2026",
    tel: "+34614167317",
    telHuman: "+34 614 16 73 17",
    tramos: [[780, 939], [1200, 1359]],
    mapa: "https://www.google.com/maps?q=DUM+DUM+Infanta+Mercedes+17+Madrid&output=embed",
    cerca: { es: ["Estadio Santiago", "Bernabéu"], en: ["Santiago Bernabéu", "Stadium"], tiempo: { es: "5 min a pie", en: "5 min walk" } },
    // En la celda de la ficha de móvil (163px) el nombre largo se parte en TRES
    // líneas y descuadra la fila entera. Ahí va el corto, que además es como lo
    // llama todo el mundo. Chamberí no lo necesita: "Templo / de Debod" cabe.
    cercaCorto: { es: ["Estadio", "Bernabéu"], en: ["Bernabéu", "Stadium"] },
    eid: "hydra-27342526-f07a-4354-bec7-c7b0ce5d7615",
    galeria: "bernabeu",
    titular: { es: "El segundo.", en: "The second one." },
    entradilla: {
      es: "Dimos un estirón en el **año 26**. Crecimos nosotros. / **Y creció el restaurante.**",
      en: "We had a growth spurt in **'26**. We grew. / **And so did the restaurant.**"
    },
    historia: {
      es: "Chamberí nos trajo hasta Tetuán y Tetuán nos ayudó a crecer. Más tamaño, sí, pero misma esencia y mismas formas, que es como mejor se crece.\n\nLa cocina y el restaurante no se separan y está guay. Se nos ve y se os ve. Mola. Mola porque vivimos lo mismo a la vez y nos dais el mejor feedback, que es vuestra cara.\n\n**Ambiente único. Lugar precioso. Gente top.**",
      en: "Chamberí brought us to Tetuán, and Tetuán helped us grow. Bigger, yes, but the same spirit and the same manners, which is the best way to grow.\n\nThe kitchen and the dining room aren't separated, and that's great. We see you and you see us. It's the best. The best because we go through the same thing at the same time, and you give us the finest feedback there is: your face.\n\n**Unique atmosphere. Beautiful place. Top people.**"
    }
  }
};
