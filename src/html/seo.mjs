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
    de: "You can book at Chamber\u00ed or at Bernab\u00e9u. Or both :)." },
  // te/de: título y descripción en inglés, para las páginas que ya existen
  // como /en/… (las genera build.mjs). React no los usa.
  { p: "/locales/chamberi",  t: "DUM DUM\u2122 Chamber\u00ed \u2014 Dumplings en Blasco de Garay, Madrid",
    d: "El local original de DUM DUM\u2122, en Blasco de Garay 10 (Chamber\u00ed, Madrid). Dumplings de autor, carta corta y uno nuevo cada mes. Abierto todos los d\u00edas.",
    te: "DUM DUM\u2122 Chamber\u00ed \u2014 Dumplings on Blasco de Garay, Madrid",
    de: "The original DUM DUM\u2122 spot, at Blasco de Garay 10 (Chamber\u00ed, Madrid). Signature dumplings, a short menu and a new one every month. Open every day." },
  { p: "/locales/bernabeu",  t: "DUM DUM\u2122 Bernab\u00e9u \u2014 Dumplings en Infanta Mercedes, Madrid",
    d: "El segundo local de DUM DUM\u2122, en Infanta Mercedes 17 (Madrid), a cinco minutos del Santiago Bernab\u00e9u. Dumplings de autor en un espacio di\u00e1fano con cocina abierta.",
    te: "DUM DUM\u2122 Bernab\u00e9u \u2014 Dumplings on Infanta Mercedes, Madrid",
    de: "DUM DUM\u2122's second spot, at Infanta Mercedes 17 (Madrid), five minutes from the Santiago Bernab\u00e9u. Signature dumplings in an open-plan space with an open kitchen." },
  { p: "/eventos",  t: "DUM DUM\u2122 \u2014 Eventos",
    d: "Espacios cool para eventos en Madrid.",
    te: "DUM DUM\u2122 \u2014 Events",
    de: "Cool spaces for events in Madrid." },
  { p: "/contacto", t: "DUM DUM\u2122 \u2014 Contacto",
    d: "dumdum@dum-dum.es / +34 614 746 065",
    te: "DUM DUM\u2122 \u2014 Contact",
    de: "dumdum@dum-dum.es / +34 614 746 065" }
];
