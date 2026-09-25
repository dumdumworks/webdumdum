// ─────────────────────────────────────────────────────────────
// Título y descripción de cada ruta: FUENTE ÚNICA (title, meta description,
// Open Graph y Twitter). t/d en español, te/de en inglés.
// ─────────────────────────────────────────────────────────────
export const ROUTES_SEO = [
  { p: "/",         t: "DUM DUM\u2122 \u2014 Dumplings & Desobediencia",
    d: "Desobedecer es un derecho y una obligaci\u00f3n. Los dumplings m\u00e1s diferentes y mejor valorados de Espa\u00f1a. Abiertos todos los d\u00edas. Para tomar, para recoger y a domicilio.",
    te: "DUM DUM\u2122 \u2014 Dumplings & Disobedience",
    de: "Disobeying is a right and a duty. The most different and best-rated dumplings in Spain. Open every day. Eat in, take away or delivery." },
  // Sin "d"/"de": la descripci\u00f3n de /menu se arma en menu.mjs con la cifra
  // real de la carta viva (para que nunca diga un n\u00famero de dumplings que ya
  // no es verdad).
  { p: "/menu",     t: "DUM DUM\u2122 \u2014 La carta",
    te: "DUM DUM\u2122 \u2014 The menu" },
  { p: "/locales",  t: "DUM DUM\u2122 \u2014 Locales y reservas",
    d: "Puedes reservar en Chamber\u00ed o en Bernab\u00e9u. O en ambos :).",
    te: "DUM DUM\u2122 \u2014 Locations and bookings",
    de: "Book a table at DUM DUM\u2122 Chamber\u00ed (Blasco de Garay 10) or Bernab\u00e9u (Infanta Mercedes 17), Madrid. Or both :)." },
  // te/de: título y descripción en inglés, para las páginas que ya existen
  // como /en/… (las genera build.mjs). React no los usa.
  { p: "/locales/chamberi",  t: "DUM DUM\u2122 Chamber\u00ed \u2014 Dumplings en Blasco de Garay, Madrid",
    d: "El local original de DUM DUM\u2122, en Blasco de Garay 10 (Chamber\u00ed, Madrid). Dumplings de autor, carta corta y uno nuevo cada mes. Abierto todos los d\u00edas.",
    te: "DUM DUM\u2122 Chamber\u00ed \u2014 Dumplings on Blasco de Garay, Madrid",
    de: "The original DUM DUM\u2122 spot, at Blasco de Garay 10 (Chamber\u00ed, Madrid). Signature dumplings, a short menu and a new one every month. Open every day." },
  { p: "/locales/bernabeu",  t: "DUM DUM\u2122 Bernab\u00e9u \u2014 Dumplings en Infanta Mercedes, Madrid",
    d: "El segundo local de DUM DUM\u2122, en Infanta Mercedes 17 (Madrid), a cinco minutos del Bernab\u00e9u. Dumplings de autor en un espacio di\u00e1fano con cocina abierta.",
    te: "DUM DUM\u2122 Bernab\u00e9u \u2014 Dumplings on Infanta Mercedes, Madrid",
    de: "DUM DUM\u2122's second spot, at Infanta Mercedes 17 (Madrid), five minutes from the Bernab\u00e9u. Signature dumplings in an open-plan space with an open kitchen." },
  { p: "/eventos",  t: "DUM DUM\u2122 \u2014 Eventos",
    d: "Espacios para eventos privados y de empresa en Madrid: cumplea\u00f1os, presentaciones, team building con taller de dumplings. Pide el dossier.",
    te: "DUM DUM\u2122 \u2014 Events",
    de: "Private and corporate event spaces in Madrid: birthdays, launches, team building dumpling workshops. Get the dossier." },
  { p: "/taller-team-building", t: "DUM DUM\u2122 \u2014 Team Building con Taller de Dumplings",
    d: "Taller de dumplings para tu equipo, en Madrid. Din\u00e1micas por equipos, degustaci\u00f3n incluida, desde 65\u20ac/persona. Descarga el dossier con tarifas.",
    te: "DUM DUM\u2122 \u2014 Team Building Dumpling Workshop",
    de: "A dumpling-making workshop for your team, in Madrid. Team activities, tasting included, from \u20ac65/person. Download the dossier with rates." },
  { p: "/contacto", t: "DUM DUM\u2122 \u2014 Contacto",
    d: "Escr\u00edbenos a dumdum@dum-dum.es o llama al +34 614 746 065. Restaurantes en Chamber\u00ed y Bernab\u00e9u, Madrid: reservas, pedidos y eventos.",
    te: "DUM DUM\u2122 \u2014 Contact",
    de: "Write to dumdum@dum-dum.es or call +34 614 746 065. Two spots in Madrid, Chamber\u00ed and Bernab\u00e9u: bookings, orders, press or events." }
];
