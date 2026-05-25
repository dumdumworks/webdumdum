// ─────────────────────────────────────────────────────────────
// Páginas públicas: Home, Carta (mobile), Locales, Quiénes, Contacto
// ─────────────────────────────────────────────────────────────

// ── HomeLogoSlot ──────────────────────────────────────────────
// Slot drag-and-drop dedicado para el logo de la home.
// A diferencia de <image-slot>, este SÍ acepta SVG (inline) además
// de PNG/JPG/WebP. Persiste en localStorage.
const HOME_LOGO_KEY = "dumdum.home.logo.v1";
const HOME_LOGO_SIZE_KEY = "dumdum.home.logo.size.v1";

function HomeLogoSlot() {
  const [value, setValue] = React.useState(() => {
    try {return localStorage.getItem(HOME_LOGO_KEY) || null;} catch {return null;}
  });
  const [size, setSize] = React.useState(() => {
    try {return parseInt(localStorage.getItem(HOME_LOGO_SIZE_KEY)) || 55;} catch {return 55;}
  });
  const [drag, setDrag] = React.useState(false);
  const inputRef = React.useRef(null);

  const updateSize = (n) => {
    setSize(n);
    try {localStorage.setItem(HOME_LOGO_SIZE_KEY, String(n));} catch {}
  };

  const ingest = (file) => {
    if (!file) return;
    const reader = new FileReader();
    const isSvg = file.type === "image/svg+xml" || /\.svg$/i.test(file.name);
    reader.onload = () => {
      let payload;
      if (isSvg) {
        payload = "svg::" + reader.result;
      } else {
        payload = reader.result; // data URL
      }
      try {localStorage.setItem(HOME_LOGO_KEY, payload);} catch {}
      setValue(payload);
    };
    if (isSvg) reader.readAsText(file);else
    reader.readAsDataURL(file);
  };

  const clear = (e) => {
    e.stopPropagation();
    try {localStorage.removeItem(HOME_LOGO_KEY);} catch {}
    setValue(null);
  };

  const replace = (e) => {
    e.stopPropagation();
    inputRef.current?.click();
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files?.[0];
    ingest(file);
  };

  const renderLogo = () => {
    if (!value) return null;
    const inner = value.startsWith("svg::") ?
    <div className="home-logo-img" dangerouslySetInnerHTML={{ __html: value.slice(5) }} /> :
    <img className="home-logo-img" src={value} alt="DUM DUM" />;
    return (
      <div className="home-logo-sized" style={{ width: size + "%" }}>
        {inner}
      </div>);

  };

  return (
    <div
      className={`home-logo-slot ${value ? "filled" : ""} ${drag ? "drag" : ""}`}
      onClick={() => !value && inputRef.current?.click()}
      onDragOver={(e) => {e.preventDefault();setDrag(true);}}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}>
      
      {value ? renderLogo() :
      <div className="home-logo-empty">
          <div className="tiny" style={{ opacity: .55 }}>[Logo · home]</div>
          <div className="home-logo-caption">Arrastra aquí el logo<br />DUM DUM™</div>
          <div className="tiny" style={{ opacity: .45 }}>SVG · PNG · JPG · WebP</div>
        </div>
      }

      {value &&
      <div className="home-logo-controls">
          <div className="home-logo-size">
            <span>Tamaño · {size}%</span>
            <input
            type="range"
            min="15"
            max="100"
            value={size}
            onChange={(e) => updateSize(parseInt(e.target.value))} />
          
          </div>
          <button onClick={replace}>Reemplazar</button>
          <button onClick={clear}>Quitar</button>
        </div>
      }

      <input
        ref={inputRef}
        type="file"
        accept="image/svg+xml,image/png,image/jpeg,image/webp"
        style={{ display: "none" }}
        onChange={(e) => ingest(e.target.files?.[0])} />
      
    </div>);

}

// ── DraggableClaim ────────────────────────────────────────────
// Subtítulo "Dumplings & Desobediencia" arrastrable libremente.
// La posición se guarda en localStorage como {x, y} en píxeles
// relativos a su posición original (translate).
const CLAIM_POS_KEY = "dumdum.claim.pos.v1";

function DraggableClaim() {
  const [pos, setPos] = React.useState(() => {
    try {
      const raw = localStorage.getItem(CLAIM_POS_KEY);
      return raw ? JSON.parse(raw) : { x: 0, y: 0 };
    } catch {return { x: 0, y: 0 };}
  });
  const [dragging, setDragging] = React.useState(false);

  const begin = (clientX, clientY) => {
    const start = { x: clientX, y: clientY };
    let latest = { ...pos };
    setDragging(true);

    const move = (cx, cy) => {
      latest = {
        x: pos.x + (cx - start.x),
        y: pos.y + (cy - start.y)
      };
      setPos(latest);
    };
    const onMouseMove = (e) => {e.preventDefault();move(e.clientX, e.clientY);};
    const onTouchMove = (e) => {
      if (!e.touches[0]) return;
      move(e.touches[0].clientX, e.touches[0].clientY);
    };
    const end = () => {
      setDragging(false);
      try {localStorage.setItem(CLAIM_POS_KEY, JSON.stringify(latest));} catch {}
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", end);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", end);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", end);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", end);
  };

  const onMouseDown = (e) => {
    if (e.target.closest(".claim-reset")) return;
    e.preventDefault();
    begin(e.clientX, e.clientY);
  };
  const onTouchStart = (e) => {
    if (e.target.closest(".claim-reset")) return;
    if (!e.touches[0]) return;
    begin(e.touches[0].clientX, e.touches[0].clientY);
  };

  const reset = (e) => {
    e.stopPropagation();
    setPos({ x: 0, y: 0 });
    try {localStorage.removeItem(CLAIM_POS_KEY);} catch {}
  };

  const moved = pos.x !== 0 || pos.y !== 0;

  return (
    <p
      className={`hero-claim draggable-claim ${dragging ? "dragging" : ""}`}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      title="Arrástrame donde quieras">
      
      <span className="claim-drag-hint">↕ Mover</span>
      DUMPLINGS <em>&amp;</em> DESOBEDIENCIA
      {moved &&
      <button className="claim-reset" onClick={reset} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
          ↺ reset
        </button>
      }
    </p>);

}

// ── HOME ──────────────────────────────────────────────────────
function Home() {
  const lang = useLang();
  // Toast "Próximamente" (Take Away, Merch). Mensaje + visibilidad.
  const [toast, setToast] = React.useState(null);
  const toastTimer = React.useRef(null);
  const showToast = (msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };
  React.useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const UBER_URL = "https://www.ubereats.com/es/store/dum-dum-%7C-chamberi/7NGxIIg1XVmNEz9mAkgI7Q?diningMode=DELIVERY";

  return (
    <div data-screen-label="home">
      <section className="home home-index">
        <div className="hero-index">
          <div className="hero-stage">
            {/* Bloque horario, pegado a la izda del logo */}
            <div className="hero-info hero-info-l">
              <div>{t("TODOS LOS DÍAS", "EVERY DAY")}</div>
              <div>13.00 – 15.39 &amp; 20.00 – 22.39</div>
            </div>

            {/* Logo central con claim incluido */}
            <div className="hero-logo">
              <img src="img/dumdum-claim.svg" alt="DUM DUM™ · Dumplings &amp; Desobediencia" />
            </div>

            {/* Bloque direcciones, pegado a la dcha del logo */}
            <div className="hero-info hero-info-r">
              <div>BLASCO DE GARAY, 10 — MADRID</div>
              <div>INFANTA MERCEDES, 17 — MADRID</div>
            </div>
          </div>

          <div className="hero-actions hero-actions-4">
            <a className="btn" href="/locales">{t("Reservar", "Book")} →</a>
            <a className="btn" href="/locales">{t("Llegar", "Directions")} →</a>
            <button
              type="button"
              className="btn"
              onClick={() => showToast("uber")}>
              Take Away →
            </button>
            <a className="btn red" href={UBER_URL} target="_blank" rel="noreferrer">Uber Eats →</a>
          </div>
          <button
            type="button"
            className="hero-scroll"
            aria-label="Bajar"
            onClick={() => {
              const start = window.scrollY;
              const distance = window.innerHeight * 1.05;
              const duration = 900;
              const t0 = performance.now();
              // easeOutCubic: arranca con ritmo y frena suave al final (grácil)
              const ease = (t) => 1 - Math.pow(1 - t, 3);
              const step = (now) => {
                const p = Math.min((now - t0) / duration, 1);
                window.scrollTo(0, start + distance * ease(p));
                if (p < 1) requestAnimationFrame(step);
              };
              requestAnimationFrame(step);
            }}>↓</button>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee">
        <div className="marquee-track">
          <span>



          </span>
          <span>



          </span>
        </div>
      </div>

      {/* Feature strip */}
      <section className="feature-strip">
        <div>
          <div className="tiny muted" style={{ marginBottom: 16 }}>/ {t("CARTA", "MENU")}</div>
          <h2>{t("Una carta corta", "A short menu")}<br /><em style={{ color: 'var(--red)', fontStyle: 'normal', fontWeight: 'inherit' }}>{t("que cambia cada mes.", "that changes every month.")}</em></h2>
          <p className="body" style={{ marginTop: 24 }}>
            {t(
              <React.Fragment>Nueve dumplings. Uno nuevo cada mes. De los nueve, mínimo 2 vegetarianos. De los nueve, <strong style={{ fontWeight: 700 }}>ni uno convencional</strong>.</React.Fragment>,
              <React.Fragment>Nine dumplings. A new one every month. Of the nine, at least 2 vegetarian. Of the nine, <strong style={{ fontWeight: 700 }}>not one conventional</strong>.</React.Fragment>
            )}
          </p>
          <a className="btn" href="/menu" style={{ marginTop: 32 }}>{t("Leer carta de mayo", "Read May's menu")} →</a>
        </div>
        <div>
          <div className="tiny muted" style={{ marginBottom: 16 }}>/ {t("SISTEMA", "SYSTEM")}</div>
          <h2>{t("Chamberí sin reserva.", "Chamberí, no booking.")}<br /><em style={{ color: 'var(--red)', fontStyle: 'normal', fontWeight: 'inherit' }}>{t("Con reserva en Tetuán.", "Tetuán, by booking.")}</em></h2>
          <p className="body" style={{ marginTop: 24 }}>
            {t(
              "En Blasco de Garay llegas y a comer. En Infanta Mercedes puedes reservar online o probar suerte. En ambos vamos como balas.",
              "At Blasco de Garay you just walk in and eat. At Infanta Mercedes you can book online or try your luck. At both, we move fast."
            )}
          </p>
          <div className="row gap-m" style={{ marginTop: 32 }}>
            <a className="btn" href="/locales">{t("Reservar en Tetuán", "Book at Tetuán")} →</a>
          </div>
        </div>
      </section>

      {/* Flat map nav · 9 celdas en 3 columnas */}
      <nav className="map-nav map-nav-3">
        <a className="map-cell" href="/menu">
          <div className="n">[01]</div>
          <div className="t">{t("La carta", "Menu")} →</div>
          <div className="d">{t("ECHA UN VISTAZO", "TAKE A LOOK")}</div>
        </a>
        <a className="map-cell" href="https://www.ubereats.com/es/store/dum-dum-%7C-chamberi/7NGxIIg1XVmNEz9mAkgI7Q?diningMode=DELIVERY" target="_blank" rel="noreferrer">
          <div className="n">[02]</div>
          <div className="t">Uber Eats →</div>
          <div className="d">{t("NI TE MUEVAS", "DON'T EVEN MOVE")}</div>
        </a>
        <a className="map-cell" href="#" onClick={(e) => { e.preventDefault(); showToast("uber"); }}>
          <div className="n">[03]</div>
          <div className="t">Take Away →</div>
          <div className="d">{t("PRÓXIMAMENTE", "COMING SOON")}</div>
        </a>
        <a className="map-cell" href="/locales">
          <div className="n">[04]</div>
          <div className="t">{t("Locales", "Locations")} →</div>
          <div className="d">CHAMBERÍ #015 + TETUÁN #020</div>
        </a>
        <a className="map-cell" href="/eventos">
          <div className="n">[05]</div>
          <div className="t">{t("Eventos", "Events")} →</div>
          <div className="d">{t("AFTER WORKS · CUMPLES · DIVORCIOS?", "AFTER WORKS · BIRTHDAYS · DIVORCES?")}</div>
        </a>
        <a className="map-cell" href="/contacto">
          <div className="n">[06]</div>
          <div className="t">{t("Contacto", "Contact")} →</div>
          <div className="d">{t("SALÚDAME SIEMPRE", "SAY HI ANYTIME")}</div>
        </a>
        <a className="map-cell" href="https://www.instagram.com/dumdum.plings" target="_blank" rel="noreferrer">
          <div className="n">[07]</div>
          <div className="t">Instagram →</div>
          <div className="d">@DUMDUM.PLINGS</div>
        </a>
        <a className="map-cell" href="https://open.spotify.com/playlist/75oqGRFz3CXErzrfBQTuVd?si=62f669c4e6674ff1" target="_blank" rel="noreferrer">
          <div className="n">[08]</div>
          <div className="t">DD*Radio →</div>
          <div className="d">SPOTIFY</div>
        </a>
        <a className="map-cell" href="#" onClick={(e) => { e.preventDefault(); showToast("soon"); }}>
          <div className="n">[09]</div>
          <div className="t">DD*Mer®ch →</div>
          <div className="d">{t("PRÓXIMAMENTE", "COMING SOON")}</div>
        </a>
        {/* Celda-sello · rellena el hueco de la rejilla en móvil (2 col).
            Al pinchar/hover invierte colores como el resto de celdas. */}
        <div className="map-cell map-cell-seal" aria-hidden="true">
          <span className="seal-mark" />
        </div>
      </nav>

      {/* Spec footer */}
      <section className="spec-foot" id="home-end">
        <div>
          <b>{t("Año", "Year")}</b>
          © {window.i18n.autoLocalize("DOSMIL24")}
        </div>
        <div>
          <b>{t("Locales", "Locations")}</b>
          {t("02 (so far) / Madrid / Chamberí · Tetuán", "02 (so far) / Madrid / Chamberí · Tetuán")}
        </div>
        <div>
          <b>{t("Carta", "Menu")}</b>
          {t("Mensual / vapor", "Monthly / steamed")}
        </div>
        <div>
          <b>{t("Sistema", "System")}</b>
          {t("Chamberí: turnos | Tetuán: reservas", "Chamberí: walk-in | Tetuán: booking")}
        </div>
      </section>

      {/* Toast flotante "Próximamente" (Take Away / Merch) · fijo abajo */}
      {toast &&
        <div className="home-toast" role="status">
          {toast === "uber" ?
            <span>{t("Próximamente. De momento puedes pedir para recoger en ", "Coming soon. For now you can order pickup on ")}<a href={UBER_URL} target="_blank" rel="noreferrer">Uber Eats →</a></span> :
            <span>{t("Próximamente.", "Coming soon.")}</span>}
        </div>
      }
    </div>);

}

// ── CARTA (mobile QR) ─────────────────────────────────────────
function Menu() {
  const lang = useLang();
  const [data, setData] = React.useState(window.DumDumData.loadMenu());

  // Helper: devuelve el campo en el idioma activo. Si estamos en EN y existe
  // el campo "_en" con contenido, lo usa; si no, cae al español (fallback).
  const tf = (obj, field) => {
    if (!obj) return "";
    let val;
    if (lang === "en") {
      const en = obj[field + "_en"];
      val = (en && String(en).trim() !== "") ? en : (obj[field] || "");
    } else {
      val = obj[field] || "";
    }
    // En las descripciones de producto: normalizar " · " a coma normal y
    // pasar a minúscula la letra que quede tras una coma (corrección
    // ortográfica). Los nombres propios se repasan manualmente en el editor.
    if (field === "ingredients") {
      val = String(val)
        .replace(/\s*·\s*/g, ", ")
        .replace(/,\s+(\p{Lu})/gu, (m, letra) => ", " + letra.toLowerCase());
    }
    return val;
  };

  // Galería del lightbox: lista de platos con foto que muestran el botón
  // (entrantes + dumplings; postres/bebidas van en 2 col y no llevan botón).
  // Se construye en el orden de la carta para poder navegar como carrusel.
  // (Va DESPUÉS de tf porque lo usa.)
  const gallery = React.useMemo(() => {
    const out = [];
    data.sections.forEach((sec) => {
      if (sec.id === "postres" || sec.id === "bebidas") return;
      sec.items.forEach((it) => {
        if (it.available !== false && it.image) {
          out.push({ id: it.id, src: it.image, name: tf(it, "name") });
        }
      });
    });
    return out;
  }, [data, lang]);

  // Índice de la foto abierta en el lightbox (null = cerrado).
  const [photoIdx, setPhotoIdx] = React.useState(null);
  const openPhoto = (dishId) => {
    const i = gallery.findIndex((g) => g.id === dishId);
    setPhotoIdx(i >= 0 ? i : 0);
  };
  const closePhoto = () => setPhotoIdx(null);
  const prevPhoto = () => setPhotoIdx((i) => (i > 0 ? i - 1 : gallery.length - 1));
  const nextPhoto = () => setPhotoIdx((i) => (i < gallery.length - 1 ? i + 1 : 0));

  React.useEffect(() => {
    if (photoIdx !== null) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const onKey = (e) => {
        if (e.key === "Escape") closePhoto();
        else if (e.key === "ArrowLeft") prevPhoto();
        else if (e.key === "ArrowRight") nextPhoto();
      };
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = prev;
        window.removeEventListener("keydown", onKey);
      };
    }
  }, [photoIdx, gallery.length]);

  // Detectar móvil (≤879px) para renderizar el botón "Volver arriba"
  // SOLO en móvil. Se actualiza al redimensionar / girar el dispositivo.
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== "undefined" && window.matchMedia("(max-width: 879px)").matches
  );
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 879px)");
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Re-cargar si vuelves desde admin
  React.useEffect(() => {
    const onFocus = () => setData(window.DumDumData.loadMenu());
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onFocus);
    };
  }, []);

  return (
    <div data-screen-label="menu">
      <div className="menu-shell">
        <div className="menu-head">
          <div className="row between">
            <div>
              <h1 className="menu-h">{t("Carta", "Menu")}</h1>
              <div className="menu-sub">{t("DUM DUM™ · Actualizada", "DUM DUM™ · Updated")} {window.i18n.autoLocalize(data.updated)}</div>
            </div>
          </div>
        </div>

        {data.disclaimer &&
        <aside className="menu-disclaimer">
            <span className="menu-disclaimer-arrow" aria-hidden="true">→</span>
            <div className="menu-disclaimer-bubble">
              {lang === "en" ?
                <p>Each portion is 6 dumplings. For 2 people, <strong>4 portions</strong> is the magic number. <strong>5</strong> means you came hungry. <strong>6… 112</strong> 💀<br/>Give it a think, <strong>it's a one-time order</strong> 😉</p> :
                <p dangerouslySetInnerHTML={{ __html: data.disclaimer }} />}
            </div>
          </aside>
        }

        {data.sections.map((sec) =>
        <section key={sec.id} className={`menu-section section--${sec.id} ${sec.id === "bebidas" ? "section-mobile-only" : ""}`}>
            <div className="menu-sectionhead">
              <h3>{tf(sec, "title")}</h3>
              <div className="meta">{tf(sec, "note")}</div>
            </div>

            <div className={`dish-grid ${sec.id === "postres" ? "dish-grid-2col-m" : ""} ${sec.id === "bebidas" ? "dish-grid-2col-m drinks-grid" : ""}`}>
              {sec.items.filter((it) => it.available !== false).map((it) =>
            <article key={it.id} className={`dish ${it.logo ? "with-logo" : ""} ${it.featured ? "is-featured" : ""}`}>
                  {/* ─── Layout MOBILE (visible <880px) ──────────────── */}
                  <div className="num m-only">[nº{String(it.n).padStart(2, "0")}]</div>
                  <div className="body m-only">
                    <div className="name-row">
                      <span className="name" style={{ fontSize: "20px" }}>{tf(it, "name")}</span>
                      {it.tags && it.tags.map((t) => {
                    return (
                      <span key={t} className={`tag ${tagClass(t)}`} style={{ fontSize: "10px" }}>{tagLabel(t)}</span>);

                  })}
                    </div>
                    {tf(it, "tagline") && <div className="tagline">{tf(it, "tagline")}</div>}
                    {tf(it, "ingredients") && <div className="ingr" style={{ fontSize: "13px" }}>{tf(it, "ingredients")}</div>}
                  </div>
                  {it.logo && <div className="m-only"><DishLogo logo={it.logo} /></div>}
                  <div className="dish-price-col m-only">
                    <div className="price tnum" style={{ fontSize: "11px" }}>{it.price} €</div>
                    {it.image &&
                      <button
                        type="button"
                        className="dish-photo-btn"
                        onClick={() => openPhoto(it.id)}>
                        {t("Foto", "Photo")}
                      </button>}
                  </div>

                  {/* ─── Layout DESKTOP (visible ≥880px) ──────────────── */}
                  <div className="dish-img">
                    {it.image ?
                <img src={it.image} alt={tf(it, "name")} /> :
                <div className="dish-img-ph">
                          <span className="ph-label">[{tf(it, "name")}]</span>
                          <span className="ph-sub">product shot · 4:5</span>
                        </div>}
                    {it.tags && it.tags.filter((t) => !["VEG", "PICANTE"].includes(t.toUpperCase())).length > 0 &&
                <div className="dish-tags-overlay">
                        {it.tags.filter((t) => !["VEG", "PICANTE"].includes(t.toUpperCase())).map((t) =>
                  <span key={t} className={`tag ${tagClass(t)}`}>{tagLabel(t)}</span>
                  )}
                      </div>
                }
                    {it.logo && <DishLogo logo={it.logo} />}
                  </div>

                  <div className="dish-card">
                    <div className="dish-card-row dish-card-meta">
                      <span className="num">[nº{String(it.n).padStart(2, "0")}]</span>
                      <span className="price tnum">{it.price} €</span>
                    </div>
                    <div className="dish-card-row dish-card-name">
                      <span className="name">{tf(it, "name")}</span>
                      {it.tags && it.tags.filter((t) => ["VEG", "PICANTE"].includes(t.toUpperCase())).map((t) => {
                    return (
                      <span key={t} className={`tag tag-inline ${tagClass(t)}`}>{tagLabel(t)}</span>);

                  })}
                    </div>
                    <div className="dish-card-row dish-card-text">
                      {tf(it, "tagline") && <div className="tagline">{tf(it, "tagline")}</div>}
                      {tf(it, "ingredients") && <div className="ingr">{tf(it, "ingredients")}</div>}
                    </div>
                  </div>
                </article>
            )}
            </div>
          </section>
        )}

        {/* Disclaimer palillos · SOLO MOBILE (.menu-chopsticks-note) */}
        <aside className="menu-chopsticks-note">
          <span className="menu-chopsticks-arrow" aria-hidden="true">→</span>
          <div className="menu-chopsticks-bubble">
            <p>{t(
              <React.Fragment><b>¡Por cierto!</b> Hay palillos para los que todavía no sepan comer con las manos. Aunque hoy podría ser un buen día para aprender 😉</React.Fragment>,
              <React.Fragment><b>By the way!</b> We've got chopsticks for those who still can't eat with their hands. Although today might be a good day to learn 😉</React.Fragment>
            )}</p>
          </div>
        </aside>

        <div className="menu-foot">
          <div className="menu-foot-left">
            {/* href="#" PROVISIONAL · cambiar cuando exista el editor/PDF de alérgenos */}
            <a className="btn menu-foot-btn" href="#" onClick={(e) => e.preventDefault()}>{t("Alérgenos", "Allergens")} →</a>
            <div className="menu-foot-text">{t(
              "Si tienes alguna alergia, alguna intolerancia o, simplemente, dudas, pregúntanos, que somos muy majos.",
              "If you have any allergy, any intolerance or, simply, questions, just ask us — we're really nice."
            )}</div>
          </div>
          {isMobile &&
          <button
            className="btn menu-foot-btn menu-top-btn"
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            {t("Volver arriba", "Back to top")} <span className="menu-top-arrow" aria-hidden="true">↑</span>
          </button>
          }
        </div>
      </div>

      {photoIdx !== null && gallery.length > 0 &&
        <DishLightbox
          items={gallery}
          index={photoIdx}
          onPrev={prevPhoto}
          onNext={nextPhoto}
          onClose={closePhoto}
        />}
    </div>);

}

// Lightbox tipo carrusel: muestra la foto del plato y permite deslizar
// izquierda/derecha (swipe en móvil, flechas y teclado en general) para
// navegar por toda la galería de platos con foto.
function DishLightbox({ items, index, onPrev, onNext, onClose }) {
  const [drag, setDrag] = React.useState(0);   // desplazamiento actual del dedo (px)
  const [animating, setAnimating] = React.useState(false);
  const startX = React.useRef(null);
  const startY = React.useRef(null);
  const width = React.useRef(typeof window !== "undefined" ? window.innerWidth : 360);
  const locked = React.useRef(null); // "x" o "y" según la dirección del gesto

  const item = items[index];

  const onTouchStart = (e) => {
    const tch = e.touches[0];
    startX.current = tch.clientX;
    startY.current = tch.clientY;
    locked.current = null;
    width.current = window.innerWidth;
    setAnimating(false);
  };
  const onTouchMove = (e) => {
    if (startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    // Decidir si el gesto es horizontal (navegar) o vertical (ignorar/cerrar)
    if (locked.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      locked.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (locked.current === "x") {
      setDrag(dx);
    }
  };
  const onTouchEnd = () => {
    if (locked.current === "x") {
      const threshold = width.current * 0.2;
      if (drag <= -threshold) { onNext(); }
      else if (drag >= threshold) { onPrev(); }
    }
    setAnimating(true);
    setDrag(0);
    startX.current = null;
    locked.current = null;
  };

  return (
    <div className="dish-lightbox" onClick={onClose} role="dialog" aria-modal="true">
      <button type="button" className="dish-lightbox-close" aria-label="Cerrar" onClick={onClose}>✕</button>

      <button type="button" className="dish-lightbox-nav prev" aria-label="Anterior"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}>‹</button>
      <button type="button" className="dish-lightbox-nav next" aria-label="Siguiente"
        onClick={(e) => { e.stopPropagation(); onNext(); }}>›</button>

      <figure
        className="dish-lightbox-fig"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: `translateX(${drag}px)`,
          transition: animating ? "transform 0.25s cubic-bezier(0.16,1,0.3,1)" : "none"
        }}>
        <img src={item.src} alt={item.name} draggable="false" />
        <figcaption>
          <span className="dish-lightbox-name">{item.name}</span>
          <span className="dish-lightbox-count">{index + 1} / {items.length}</span>
        </figcaption>
      </figure>
    </div>
  );
}

// ── tagLabel ───────────────────────────────────────────────────
// Traducción y formato de las etiquetas (VEG, HOT, etc.) en un solo
// sitio, para que el texto sea idéntico en móvil y desktop y cambie
// con el idioma. Para añadir una etiqueta nueva en el futuro, basta
// con sumar una línea aquí.
function tagLabel(tg) {
  const u = (tg || "").toUpperCase();
  if (u === "PICANTE") return t("HOT 🌶", "HOT 🌶");
  if (u === "VEG") return t("VEG 🌱", "VEG 🌱");
  if (u === "POR TIEMPO LIMITADO") return t("POR TIEMPO LIMITADO", "LIMITED TIME OFFER");
  if (u === "NEW") return t("NEW", "NEW");
  if (u === "DEL MES") return t("DEL MES", "OF THE MONTH");
  if (u === "TOP") return "TOP";
  return tg;
}

function tagClass(t) {
  const u = t.toUpperCase();
  if (u === "VEG") return "veg";
  if (u === "NEW") return "red";
  if (u === "PICANTE") return "hot";
  if (u === "POR TIEMPO LIMITADO") return "limited";
  if (u === "DEL MES" || u === "TOP") return "month";
  return "";
}

// ── GoogleReviews ─────────────────────────────────────────────
// Enlace a las reseñas de Google del local (sin puntuación ni estrellas).
function GoogleReviews({ href }) {
  return (
    <a className="grv" href={href || "#"} target={href ? "_blank" : undefined} rel="noreferrer" onClick={(e) => {if (!href) e.preventDefault();}}>
      <span className="grv-g" aria-label="Google">
        <svg viewBox="0 0 18 18" width="14" height="14" aria-hidden="true">
          <path fill="#EA4335" d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z" />
          <path fill="#4285F4" d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z" />
          <path fill="#FBBC05" d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.12-3.74L.97 13.04C2.45 15.98 5.48 18 9 18z" />
        </svg>
      </span>
      <span className="grv-count">Ver reseñas</span>
      <span className="grv-arrow">↗</span>
    </a>);

}

// ── LOCALES ───────────────────────────────────────────────────
// Calcula si el local está abierto AHORA según sus tramos horarios.
// tramos = [[inicioMin, finMin], ...] en minutos desde medianoche.
// Usa SIEMPRE la hora de Madrid, sin importar dónde esté el visitante.
function estadoApertura(tramos) {
  // Hora actual en Madrid (Europe/Madrid), independiente del dispositivo
  let min;
  try {
    const partes = new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Madrid",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(new Date());
    const h = parseInt(partes.find((p) => p.type === "hour").value, 10);
    const m = parseInt(partes.find((p) => p.type === "minute").value, 10);
    min = (h % 24) * 60 + m;
  } catch (e) {
    // Si algo fallara, usar hora local como respaldo
    const now = new Date();
    min = now.getHours() * 60 + now.getMinutes();
  }
  const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}.${String(m % 60).padStart(2, "0")}`;
  for (let i = 0; i < tramos.length; i++) {
    if (min >= tramos[i][0] && min < tramos[i][1]) {
      return { abierto: true, hora: fmt(tramos[i][1]) };
    }
  }
  // Cerrado: ¿queda algún tramo hoy? → abre "hoy"; si no → "mañana"
  for (let i = 0; i < tramos.length; i++) {
    if (min < tramos[i][0]) {
      return { abierto: false, hora: fmt(tramos[i][0]), cuando: "hoy" };
    }
  }
  return { abierto: false, hora: fmt(tramos[0][0]), cuando: "mañana" };
}
// Disponible globalmente para que la TopBar (ui.jsx) la use también
window.estadoApertura = estadoApertura;

function EstadoLocal({ tramos }) {
  const lang = useLang();
  // Recalcula el estado cada minuto para mantenerlo al día sin recargar.
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const est = estadoApertura(tramos);
  if (est.abierto) {
    return (
      <div className="row gap-s tiny estado-local" style={{ marginBottom: 16 }}>
        <span className="dot dot-live" /> {t("Abierto · cierra", "Open · closes")} {est.hora}h
      </div>);
  }
  // Texto coherente: siempre la hora del próximo tramo de apertura.
  const frase = t(`Nos vemos a partir de las ${est.hora}h`, `See you from ${est.hora}h`);
  return (
    <div className="row gap-s tiny estado-local" style={{ marginBottom: 16 }}>
      <span className="dot dot-closed" /> {frase}
    </div>);
}

function Locales() {
  const lang = useLang();
  const [resvSoon, setResvSoon] = React.useState(false);
  return (
    <div data-screen-label="locales">
      <section style={{ padding: '14vh var(--gutter) 6vh', borderBottom: '1px solid var(--line)' }}>
        <div className="tiny muted">[02] {t("Locales", "Locations")}</div>
        <h1 className="h-display" style={{ marginTop: 16 }}>{t("Dos casas", "Two homes")}<br />{t("en Madrid.", "in Madrid.")}</h1>
      </section>

      <div className="locales">
        <div className="locale-card">
          <div>
            <EstadoLocal tramos={[[780, 939], [1200, 1359]]} />
            <h2>Tetuán.</h2>
            <div className="tiny muted" style={{ marginTop: 8 }}>{t("SEGUNDO LOCAL · DESDE DOSMIL26", "SECOND SPOT · SINCE TWENTY26")}</div>

            <div className="info">
              <b>{t("Dirección", "Address")}</b><div>Infanta Mercedes, 17 · 28020 Madrid</div>
              <b>{t("Metro", "Metro")}</b><div>Tetuán · Estrecho</div>
              <b>{t("Horario", "Hours")}</b><div>13.00–15.39 / 20.00–22.39</div>
              <b>{t("Aforo", "Capacity")}</b><div>{t("~40 comensales", "~40 seats")}</div>
              <b>{t("Reserva", "Booking")}</b><div style={{ color: '#1f8a5b', fontWeight: 500 }}>{t("Sí · online", "Yes · online")} / +34 614 746 065</div>
            </div>

            <a
              className="btn red"
              href="#"
              onClick={(e) => { e.preventDefault(); setResvSoon(true); }}
              style={{ marginTop: 24 }}>
              {resvSoon ? t("Próximamente", "Coming soon") : (t("Reservar", "Book") + " →")}
            </a>
          </div>

          <div className="locale-map">
            <iframe
              title="Mapa Tetuán"
              src="https://www.google.com/maps?q=DUM+DUM+Infanta+Mercedes+17+Madrid&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ width: "100%", height: "100%", border: 0 }} />
          </div>
        </div>
      </div>

        <div className="locale-card">
          <div>
            <EstadoLocal tramos={[[780, 939], [1200, 1359]]} />
            <h2>Chamberí.</h2>
            <div className="tiny muted" style={{ marginTop: 8 }}>{t("Local original · desde DOSMIL24", "Original spot · since TWENTY24")}</div>

            <div className="info">
              <b>{t("Dirección", "Address")}</b><div>Blasco de Garay, 10 · 28015 Madrid</div>
              <b>{t("Metro", "Metro")}</b><div>Argüelles · San Bernardo</div>
              <b>{t("Horario", "Hours")}</b><div>13.00–15.39 / 20.00–22.39</div>
              <b>{t("Aforo", "Capacity")}</b><div>{t("~32 comensales", "~32 seats")}</div>
              <b>{t("Reserva", "Booking")}</b><div style={{ color: 'var(--red)' }}>{t("Sin reserva · por turnos", "No booking · walk-in")}</div>
            </div>
          </div>

          <div className="locale-map">
            <iframe
              title="Mapa Chamberí"
              src="https://www.google.com/maps?q=DUM+DUM+Blasco+de+Garay+10+Madrid&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ width: "100%", height: "100%", border: 0 }} />
          </div>
        </div>

<section className="spec-foot">
        <div><b>{t("Interiorismo", "Interior design")}</b>Nota Estudio</div>
        <div><b>{t("Identidad", "Identity")}</b>Yerai Gómez</div>
        <div><b>{t("Cocina", "Kitchen")}</b>Kéril Gómez · BCC</div>
        <div><b>{t("Año apertura", "Opening year")}</b>{window.i18n.autoLocalize("CHAMBERÍ · DOSMIL24 | TETUÁN · DOSMIL26")}</div>
      </section>
    </div>);

}

// ── EspacioSlider ─────────────────────────────────────────────
// Slider de imágenes del espacio. Muestra 2 visibles a la vez,
// con flechas izda/dcha que avanzan/retroceden por todas. Cada
// foto puede tener un object-position personalizado que se edita
// desde /admin → Galería del espacio.
const ESPACIO_PHOTOS_FALLBACK = [
{ src: "img/espacio/01-fachada.jpg", pos: "50% 50%" },
{ src: "img/espacio/02-barra-horizontal.jpg", pos: "50% 50%" },
{ src: "img/espacio/04-general-vertical.jpg", pos: "50% 50%" },
{ src: "img/espacio/05-barra-vertical.jpg", pos: "50% 50%" },
{ src: "img/espacio/06-horizontal-barra.jpg", pos: "50% 50%" },
{ src: "img/espacio/07-mesa-alta-fachada.jpg", pos: "50% 50%" },
{ src: "img/espacio/08-mesa-alta-juliette.jpg", pos: "50% 50%" },
{ src: "img/espacio/09-detalle-barra-alta.jpg", pos: "50% 50%" },
{ src: "img/espacio/10-detalle-mesa.jpg", pos: "50% 50%" },
{ src: "img/espacio/11-merchandising.jpg", pos: "50% 50%" },
{ src: "img/espacio/12-suelo-barra-alta.jpg", pos: "50% 50%" }];


function EspacioSlider() {
  const [data, setData] = React.useState(window.DumDumData.loadMenu());
  React.useEffect(() => {
    const onFocus = () => setData(window.DumDumData.loadMenu());
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onFocus);
    };
  }, []);

  const photos = data.gallery && data.gallery.espacio || ESPACIO_PHOTOS_FALLBACK;
  return (
    <GallerySlider photos={photos} visible={2} label="Espacio" ratio="3 / 4" />);

}

// ── UniversoSlider · hasta 3 vídeos, 2 visibles, 4:5 ──────────
function UniversoSlider() {
  const [data, setData] = React.useState(window.DumDumData.loadMenu());
  React.useEffect(() => {
    const onFocus = () => setData(window.DumDumData.loadMenu());
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onFocus);
    };
  }, []);

  const fallback = [{ youtube: "" }, { youtube: "" }, { youtube: "" }];
  const uni = data.gallery && data.gallery.universo;
  const items = uni && uni.length > 0 ? uni : fallback;
  const total = items.length;
  const visible = 1;
  const [idx, setIdx] = React.useState(0);

  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);

  const slice = Array.from({ length: visible }, (_, i) => ({
    item: items[(idx + i) % total],
    n: (idx + i) % total + 1
  }));

  return (
    <div className="ev-slider ev-slider-cols-1" style={{ marginTop: 32 }}>
      <div className="ev-slider-head">
        <div className="tiny muted">Universo · {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</div>
        <div className="ev-slider-ctrls">
          <button onClick={prev} aria-label="Anterior" className="ev-slider-btn">←</button>
          <button onClick={next} aria-label="Siguiente" className="ev-slider-btn">→</button>
        </div>
      </div>
      <div className="ev-slider-track">
        {slice.map(({ item, n }, i) =>
        <div className="ev-slider-slot" key={`${idx}-${i}`} style={{ aspectRatio: "16 / 9" }}>
            <YouTubeEmbed url={item.youtube || item.url} placeholderN={n} />
          </div>
        )}
      </div>
    </div>);

}

// ── YouTubeEmbed · convierte una URL de YouTube en iframe ─────
// Acepta enlaces tipo youtube.com/watch?v=ID, youtu.be/ID,
// youtube.com/shorts/ID o youtube.com/embed/ID.
function YouTubeEmbed({ url, placeholderN }) {
  const id = getYouTubeId(url);
  if (!id) {
    return (
      <div className="ev-slider-ph">
        <span>[ Vídeo · {String(placeholderN).padStart(2, "0")} ]</span>
      </div>);

  }
  return (
    <iframe
      src={`https://www.youtube.com/embed/${id}`}
      title={`Universo ${placeholderN}`}
      style={{ width: "100%", height: "100%", border: 0, display: "block" }}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      loading="lazy" />);

}

function getYouTubeId(url) {
  if (!url) return null;
  var s = String(url).trim();
  // youtu.be/ID
  var m = s.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  if (m) return m[1];
  // youtube.com/watch?v=ID
  m = s.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
  if (m) return m[1];
  // youtube.com/shorts/ID  o  /embed/ID
  m = s.match(/\/(?:shorts|embed)\/([A-Za-z0-9_-]{6,})/);
  if (m) return m[1];
  // Si pegan solo el ID
  if (/^[A-Za-z0-9_-]{6,}$/.test(s)) return s;
  return null;
}

// ── RedesSlider · 6 reels de Instagram, 3 visibles, embed 9:16 ─
function RedesSlider() {
  const [data, setData] = React.useState(window.DumDumData.loadMenu());
  React.useEffect(() => {
    const onFocus = () => setData(window.DumDumData.loadMenu());
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onFocus);
    };
  }, []);

  const fallback = Array.from({ length: 6 }, () => ({ url: "" }));
  const items = data.gallery && data.gallery.redes || fallback;
  const total = items.length;
  const [idx, setIdx] = React.useState(0);

  const step = Math.min(2, total);
  const prev = () => setIdx((i) => (i - step + total) % total);
  const next = () => setIdx((i) => (i + step) % total);

  const slice = Array.from({ length: 2 }, (_, i) => ({
    item: items[(idx + i) % total],
    n: (idx + i) % total + 1
  }));

  return (
    <div className="ev-slider ev-slider-cols-2">
      <div className="ev-slider-head">
        <div className="tiny muted">Reels · {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</div>
        <div className="ev-slider-ctrls">
          <button onClick={prev} aria-label="Anterior" className="ev-slider-btn">←</button>
          <button onClick={next} aria-label="Siguiente" className="ev-slider-btn">→</button>
        </div>
      </div>
      <div className="ev-slider-track">
        {slice.map(({ item, n }, i) =>
        <div className="ev-slider-slot ig-slot" key={`${idx}-${i}`}>
            <ReelEmbed url={item.url} placeholderN={n} />
          </div>
        )}
      </div>
    </div>);

}

// ── ReelEmbed · convierte URL de Instagram en iframe embed ────
function ReelEmbed({ url, placeholderN }) {
  if (!url) {
    return (
      <div className="ev-slider-ph">
        <span>[ Reel · {String(placeholderN).padStart(2, "0")} ]</span>
      </div>);

  }
  let embed = url.trim();
  if (!embed.endsWith("/embed") && !embed.endsWith("/embed/")) {
    embed = embed.replace(/\?.*$/, "").replace(/\/?$/, "/embed/");
  }
  return (
    <iframe
      src={embed}
      title={`Reel ${placeholderN}`}
      className="ig-embed"
      allow="encrypted-media; picture-in-picture; clipboard-write"
      allowFullScreen
      scrolling="no"
      loading="lazy" />);

}

// ── ProductoSlider · 9 fotos, 3 visibles ──────────────────────
function ProductoSlider() {
  const [data, setData] = React.useState(window.DumDumData.loadMenu());
  React.useEffect(() => {
    const onFocus = () => setData(window.DumDumData.loadMenu());
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onFocus);
    };
  }, []);

  const fallback = Array.from({ length: 9 }, () => ({ src: null, pos: "50% 50%" }));
  const photos = data.gallery && data.gallery.producto || fallback;

  // Las fotos de Producto son las mismas de los platos. Para que el visor
  // sea idéntico al de la carta (con nombre incluido), derivamos el nombre
  // del plato cruzando el archivo de la foto (src) con el menú.
  const lang = useLang();
  const photosConNombre = React.useMemo(() => {
    const porImagen = {};
    (data.sections || []).forEach((sec) => {
      (sec.items || []).forEach((it) => {
        if (it.image) {
          const en = it.name_en && String(it.name_en).trim() !== "" ? it.name_en : it.name;
          porImagen[it.image] = lang === "en" ? (en || it.name || "") : (it.name || "");
        }
      });
    });
    return photos.map((p) => ({ ...p, name: p.name || porImagen[p.src] || "" }));
  }, [photos, data, lang]);

  return (
    <GallerySlider photos={photosConNombre} visible={2} label="Producto" placeholderLabel="Producto" ratio="3 / 4" lightboxStyle="dish" />);

}

// ── PrensaSlider · misma forma que Producto, con CTA por foto ─
function PrensaSlider() {
  const [data, setData] = React.useState(window.DumDumData.loadMenu());
  React.useEffect(() => {
    const onFocus = () => setData(window.DumDumData.loadMenu());
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onFocus);
    };
  }, []);

  const fallback = Array.from({ length: 6 }, () => ({ src: null, pos: "50% 50%", url: "" }));
  const photos = data.gallery && data.gallery.prensa || fallback;
  return (
    <GallerySlider photos={photos} visible={2} label="Prensa" placeholderLabel="Noticia" cta="Ver noticia →" ratio="3 / 4" />);

}

// ── Slider genérico ───────────────────────────────────────────
function GallerySlider({ photos, visible = 2, label = "Galería", placeholderLabel = "Espacio", cta = null, ratio = "4 / 3", lightboxStyle = "default" }) {
  const total = photos.length;
  const [idx, setIdx] = React.useState(0);
  const [lightbox, setLightbox] = React.useState(null); // índice de foto ampliada, o null

  // Detectar móvil (≤879px): en móvil la galería es un carrusel deslizable
  // (scroll horizontal con snap, de una en una); en desktop, slice + flechas.
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== "undefined" && window.matchMedia("(max-width: 879px)").matches
  );
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 879px)");
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // En móvil: ref a la pista para mover el scroll con las flechas y para
  // saber qué foto está centrada (actualiza el contador "01 / NN").
  const trackRef = React.useRef(null);
  const onTrackScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setIdx(Math.max(0, Math.min(total - 1, i)));
  };
  const scrollToMobile = (i) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  if (total === 0) {
    return (
      <div className="ev-slider">
        <div className="ev-slider-head">
          <div className="tiny muted">{label} · 00 / 00</div>
        </div>
        <div className={`ev-slider-track ev-slider-cols-${visible}`}>
          {Array.from({ length: visible }, (_, i) =>
          <div className="ev-slider-slot" key={i} style={{ aspectRatio: ratio }}>
              <div className="ev-slider-ph">
                <span>[ {placeholderLabel} · sin fotos ]</span>
              </div>
            </div>
          )}
        </div>
      </div>);

  }

  const step = Math.min(visible, total);
  const prev = () => setIdx((i) => (i - step + total) % total);
  const next = () => setIdx((i) => (i + step) % total);

  const slice = Array.from({ length: Math.min(visible, total) }, (_, i) => ({
    item: photos[(idx + i) % total],
    n: (idx + i) % total + 1
  }));

  // Navegación de las flechas: en móvil mueve el scroll de la pista;
  // en desktop avanza el slice como antes.
  const goPrev = () => { if (isMobile) scrollToMobile(Math.max(0, idx - 1)); else prev(); };
  const goNext = () => { if (isMobile) scrollToMobile(Math.min(total - 1, idx + 1)); else next(); };

  return (
    <div className={`ev-slider ev-slider-cols-${visible}`}>
      <div className="ev-slider-head">
        <div className="tiny muted">{label} · {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</div>
        <div className="ev-slider-ctrls">
          <button onClick={goPrev} aria-label="Anterior" className="ev-slider-btn">←</button>
          <button onClick={goNext} aria-label="Siguiente" className="ev-slider-btn">→</button>
        </div>
      </div>

      {isMobile ?
      // ── MÓVIL: carrusel deslizable (scroll horizontal con snap) ──
      <div className="ev-slider-track ev-slider-track-mobile" ref={trackRef} onScroll={onTrackScroll}>
          {photos.map((item, i) =>
        <div className="ev-slider-slot" key={i} style={{ aspectRatio: ratio }}>
              {item.src ?
          <img src={item.src} alt="" loading="lazy" decoding="async" style={{ objectPosition: item.pos || "50% 50%", cursor: "pointer" }}
            onClick={() => setLightbox(i)} /> :

          <div className="ev-slider-ph">
                  <span>[ {placeholderLabel} · {String(i + 1).padStart(2, "0")} ]</span>
                </div>
          }
              {cta &&
          <a className="ev-slider-cta"
          href={item.url || "#"}
          target={item.url ? "_blank" : undefined}
          rel="noreferrer"
          onClick={(e) => {if (!item.url) e.preventDefault();}}>
                  {cta}
                </a>
          }
            </div>
        )}
        </div> :

      // ── DESKTOP: slice + flechas (como antes) ──
      <div className="ev-slider-track">
          {slice.map(({ item, n }, i) =>
        <div className="ev-slider-slot" key={`${idx}-${i}`} style={{ aspectRatio: ratio }}>
              {item.src ?
          <img src={item.src} alt="" loading="lazy" decoding="async" style={{ objectPosition: item.pos || "50% 50%", cursor: "pointer" }}
            onClick={() => setLightbox((idx + i) % total)} /> :

          <div className="ev-slider-ph">
                  <span>[ {placeholderLabel} · {String(n).padStart(2, "0")} ]</span>
                </div>
          }
              {cta &&
          <a className="ev-slider-cta"
          href={item.url || "#"}
          target={item.url ? "_blank" : undefined}
          rel="noreferrer"
          onClick={(e) => {if (!item.url) e.preventDefault();}}>
                  {cta}
                </a>
          }
            </div>
        )}
        </div>
      }

      {lightboxStyle === "dish" ?
        (lightbox !== null &&
          <DishLightbox
            items={photos.map((p, i) => ({ id: i, src: p.src, name: p.name || "" }))}
            index={lightbox}
            onPrev={() => setLightbox((p) => (p - 1 + total) % total)}
            onNext={() => setLightbox((p) => (p + 1) % total)}
            onClose={() => setLightbox(null)}
          />) :
        <Lightbox
          photos={photos}
          index={lightbox}
          label={label}
          onClose={() => setLightbox(null)}
          onNav={(d) => setLightbox((p) => (p + d + total) % total)}
        />
      }
    </div>);

}

// ── Lightbox · visor de galería ampliada ──────────────────────
// Se abre al hacer clic en una foto. Navega con flechas, se cierra
// con la X, con clic en el fondo y con la tecla Escape. Respeta el
// diseño del sitio (rojo, mono, transiciones suaves).
function Lightbox({ photos, index, label = "Galería", onClose, onNav }) {
  const open = index !== null && index !== undefined;

  // Swipe táctil (móvil): deslizar izquierda/derecha para navegar,
  // igual que el carrusel de la carta.
  const [drag, setDrag] = React.useState(0);
  const [animating, setAnimating] = React.useState(false);
  const startX = React.useRef(null);
  const startY = React.useRef(null);
  const width = React.useRef(typeof window !== "undefined" ? window.innerWidth : 360);
  const locked = React.useRef(null);

  const onTouchStart = (e) => {
    const tch = e.touches[0];
    startX.current = tch.clientX;
    startY.current = tch.clientY;
    locked.current = null;
    width.current = window.innerWidth;
    setAnimating(false);
  };
  const onTouchMove = (e) => {
    if (startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    if (locked.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      locked.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (locked.current === "x") setDrag(dx);
  };
  const onTouchEnd = () => {
    if (locked.current === "x") {
      const threshold = width.current * 0.2;
      if (drag <= -threshold) onNav(1);
      else if (drag >= threshold) onNav(-1);
    }
    setAnimating(true);
    setDrag(0);
    startX.current = null;
    locked.current = null;
  };

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onNav(-1);
      else if (e.key === "ArrowRight") onNav(1);
    };
    document.addEventListener("keydown", onKey);
    // Bloquear el scroll del fondo SIN que la página salte:
    // al ocultar la barra de scroll, compensamos su ancho con
    // un padding-right equivalente, así nada se mueve.
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarW > 0) document.body.style.paddingRight = scrollbarW + "px";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
    };
  }, [open, onClose, onNav]);

  if (!open) return null;
  const total = photos.length;
  const item = photos[index] || {};
  if (!item.src) return null;

  return (
    <div className="lb-overlay" onClick={onClose}>
      <div className="lb-head" onClick={(e) => e.stopPropagation()}>
        <span className="tiny">{label} · {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        <button className="lb-close" onClick={onClose} aria-label="Cerrar">✕</button>
      </div>

      <button className="lb-nav lb-prev" onClick={(e) => { e.stopPropagation(); onNav(-1); }} aria-label="Anterior">←</button>

      <div
        className="lb-stage"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: `translateX(${drag}px)`,
          transition: animating ? "transform 0.25s cubic-bezier(0.16,1,0.3,1)" : "none"
        }}>
        {item.src &&
          <img src={item.src} alt="" className="lb-img" draggable="false" style={{ objectPosition: item.pos || "50% 50%" }} />}
      </div>

      <button className="lb-nav lb-next" onClick={(e) => { e.stopPropagation(); onNav(1); }} aria-label="Siguiente">→</button>
    </div>);

}
// Formulario de contacto para Eventos. Envía un POST a un endpoint
// de Formspree (https://formspree.io/) — gratis hasta 50 emails/mes.
// Si el endpoint no está configurado, abre la app de mail del usuario
// con todos los datos prerrellenados (mailto fallback).
const WEB3FORMS_KEY = "7b16c2a8-ccbd-4c0a-8d29-0562bd8646a0";
const EVENTOS_EMAIL = "dumdum@dum-dum.es";

function EventosForm() {
  const lang = useLang();
  const [form, setForm] = React.useState({ nombre: "", empresa: "", email: "", telefono: "", fecha: "", asistentes: "", mensaje: "" });
  const [state, setState] = React.useState("idle"); // idle · sending · ok · error
  const [errMsg, setErrMsg] = React.useState("");

  const set = (k, v) => setForm({ ...form, [k]: v });

  const mailtoFallback = () => {
    const subject = `Solicitud de información — ${form.nombre || "(sin nombre)"}`;
    const body =
    `Nombre y apellido: ${form.nombre}\n` +
    `Empresa: ${form.empresa}\n` +
    `Email: ${form.email}\n` +
    `Teléfono: ${form.telefono}\n` +
    `Fecha: ${form.fecha}\n` +
    `Número de asistentes: ${form.asistentes}\n\n` +
    `Mensaje:\n${form.mensaje}`;
    window.location.href = `mailto:${EVENTOS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.telefono || !form.fecha) {
      setState("error");
      setErrMsg(t("Rellena los campos obligatorios: nombre, email, teléfono y fecha del evento.", "Please fill in the required fields: name, email, phone and event date."));
      return;
    }
    setState("sending");
    setErrMsg("");

    // Identificador de la solicitud: AA/MM/CODIGO (ej: 26/05/A7F3)
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const code = (function () {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin caracteres confusos
      let s = "";
      for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
      return s;
    })();
    const ref = `${yy}/${mm}/${code}`;

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Nueva solicitud de evento · ${ref}`,
          from_name: "Web DUM DUM · Eventos",
          "Referencia": ref,
          "Nombre y apellido": form.nombre,
          "Empresa": form.empresa,
          "Email de contacto": form.email,
          "Teléfono": form.telefono,
          "Fecha del evento": form.fecha,
          "Número de asistentes": form.asistentes,
          "Mensaje": form.mensaje,
          replyto: form.email
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setState("ok");
        setForm({ nombre: "", empresa: "", email: "", telefono: "", fecha: "", asistentes: "", mensaje: "" });
      } else {
        setState("error");
        setErrMsg(data.message || t("No se pudo enviar. Inténtalo de nuevo o escríbenos directamente.", "Couldn't send. Try again or email us directly."));
      }
    } catch (err) {
      setState("error");
      setErrMsg(t("No hay conexión. Inténtalo de nuevo.", "No connection. Please try again."));
    }
  };

  if (state === "ok") {
    return (
      <div className="ev-form ev-form-ok">
        <div className="tiny muted">{t("Mensaje enviado", "Message sent")}</div>
        <h3 className="h-2" style={{ marginTop: 12 }}>
          {t("Gracias.", "Thank you.")} <em style={{ fontStyle: 'normal', color: 'var(--red)', fontWeight: 'inherit' }}>{t("Te contestamos cuanto antes.", "We'll get back to you asap.")}</em>
        </h3>
        <button type="button" className="btn" style={{ marginTop: 24 }}
        onClick={() => setState("idle")}>
          {t("Enviar otra solicitud", "Send another request")}
        </button>
      </div>);

  }

  return (
    <form className="ev-form" onSubmit={submit}>
      <div className="ev-form-row ev-form-row-3">
        <label className="ev-field">
          <span>{t("Nombre y apellido *", "Full name *")}</span>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => set("nombre", e.target.value)}
            required
            placeholder={t("Tu nombre", "Your name")} />
        </label>
        <label className="ev-field">
          <span>{t("Empresa", "Company")}</span>
          <input
            type="text"
            value={form.empresa}
            onChange={(e) => set("empresa", e.target.value)}
            placeholder={t("Tu empresa (opcional)", "Your company (optional)")} />
        </label>
        <label className="ev-field">
          <span>{t("Email *", "Email *")}</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
            placeholder="tu@email.com" />
        </label>
      </div>

      <div className="ev-form-row ev-form-row-3">
        <label className="ev-field">
          <span>{t("Teléfono *", "Phone *")}</span>
          <input
            type="tel"
            value={form.telefono}
            onChange={(e) => set("telefono", e.target.value)}
            required
            placeholder="+34 600 000 000" />
        </label>
        <label className="ev-field">
          <span>{t("Fecha del evento *", "Event date *")}</span>
          <input
            type="date"
            value={form.fecha}
            onChange={(e) => set("fecha", e.target.value)}
            required />
        </label>
        <label className="ev-field">
          <span>{t("Número de asistentes", "Number of guests")}</span>
          <select
            value={form.asistentes}
            onChange={(e) => set("asistentes", e.target.value)}
            className="ev-select">
            <option value="">{t("Selecciona…", "Select…")}</option>
            <option value="Menos de 10">{t("Menos de 10", "Fewer than 10")}</option>
            <option value="Entre 10 y 15">{t("Entre 10 y 15", "10 to 15")}</option>
            <option value="Entre 15 y 20">{t("Entre 15 y 20", "15 to 20")}</option>
            <option value="Entre 20 y 25">{t("Entre 20 y 25", "20 to 25")}</option>
            <option value="Entre 25 y 30">{t("Entre 25 y 30", "25 to 30")}</option>
            <option value="Entre 30 y 35">{t("Entre 30 y 35", "30 to 35")}</option>
            <option value="Entre 35 y 40">{t("Entre 35 y 40", "35 to 40")}</option>
            <option value="Más de 40">{t("Más de 40", "More than 40")}</option>
          </select>
        </label>
      </div>

      <label className="ev-field">
        <span>{t("¿Qué necesitas?", "What do you need?")}</span>
        <textarea
          value={form.mensaje}
          onChange={(e) => set("mensaje", e.target.value)}
          rows={5}
          placeholder={t("Tipo de evento, comentarios…", "Type of event, comments…")} />
      </label>

      {state === "error" &&
      <div className="ev-form-err">{errMsg}</div>
      }

      <button type="submit" className="btn red" disabled={state === "sending"}
      style={{ marginTop: 12 }}>
        {state === "sending" ? t("Enviando…", "Sending…") : (t("Enviar solicitud", "Send request") + " →")}
      </button>
    </form>);

}

// ── EVENTOS ───────────────────────────────────────────────────
function Eventos() {
  const lang = useLang();
  // Helpers de contenido editable (eventos.json vía Sveltia) con FALLBACK
  // total al texto escrito aquí: si el editor no aporta nada, se ve igual
  // que siempre. `eb` = bloque de texto/párrafo. `eh` = título (un campo).
  const eb = (key, fallback) => {
    const j = window.i18n.mdToJsx(window.i18n.ev(key));
    return j != null ? j : fallback;
  };
  // `ebp` = párrafos en campo único: el editor escribe todo seguido (con una
  // línea en blanco entre párrafos) y la web los reparte en <p> sola. Si el
  // editor no aporta nada, usa `fallbackParas` (los <p> escritos en el código).
  const ebp = (key, fallbackParas) => {
    const ps = window.i18n.mdParas(window.i18n.ev(key), { className: "body" });
    return ps != null ? ps : fallbackParas;
  };
  // `eh` = título en UN solo campo (sin parte roja). Usa el texto del editor
  // (con sus saltos " / " si los tuviera) o, si está vacío, el fallback del
  // código. Mantiene 4 args por compatibilidad con las llamadas: si hay que
  // usar fallback, combina el texto negro y el que antes era rojo en una pieza.
  const eh = (key, _keyRedIgnored, fbNegro, fbRed) => {
    const negro = window.i18n.mdToJsx(window.i18n.ev(key));
    if (negro != null) return negro;
    // Fallback: el título escrito en el código (negro + lo que antes era rojo).
    if (fbRed != null) {
      return <React.Fragment>{fbNegro} {fbRed}</React.Fragment>;
    }
    return fbNegro;
  };
  return (
    <div data-screen-label="eventos">
      {/* HERO */}
      <section className="ev-hero">
        <div className="tiny muted">[05] {t("Eventos", "Events")}</div>
        <h1 className="h-display" style={{ marginTop: 16 }}>
          {eh("hero_title", "hero_title_red",
            t("Un sitio cool", "A cool place"),
            t("para eventos cool.", "for cool events."))}
        </h1>
        <p className="body" style={{ marginTop: 32, fontSize: 18 }}>
          {eb("hero_body", t(
            <React.Fragment>En el corazón de Tetuán y diseñado por <strong>Nota Estudio</strong>. 55 m² diáfanos, cocina abierta, hasta 35 personas, equipo de sonido potente y luz pensada. Un sitio a la altura de tu evento.</React.Fragment>,
            <React.Fragment>In the heart of Tetuán, designed by <strong>Nota Estudio</strong>. 55 m² open-plan, open kitchen, up to 35 people, a powerful sound system and considered lighting. A place worthy of your event.</React.Fragment>
          ))}
        </p>
      </section>

      {/* ESPACIO */}
      <section className="ev-split">
        <div>
          <div className="tiny muted">[01] {t("Espacio", "Space")}</div>
          <h2 className="h-1" style={{ marginTop: 16 }}>
            {eh("espacio_title", "espacio_title_red",
              t(<React.Fragment>Un sitio bien diseñado,<br />funcional, en el que<br />apetece estar.</React.Fragment>,
                <React.Fragment>A well-designed,<br />functional place<br />you'll want to be in.</React.Fragment>),
              null)}
          </h2>
        </div>
        <div>
          <p className="body">
            {eb("espacio_body", t(
              <React.Fragment>Espacio diáfano de <strong>55 m²</strong> con <strong>cocina abierta</strong> integrada en la sala. Combina un aire <strong>minimal y urbano</strong> con un <strong>coolness cosmopolita</strong>. Configurable según necesidades del evento.</React.Fragment>,
              <React.Fragment>An open-plan <strong>55 m²</strong> space with an <strong>open kitchen</strong> integrated into the room. It blends a <strong>minimal, urban</strong> feel with <strong>cosmopolitan coolness</strong>. Configurable to your event's needs.</React.Fragment>
            ))}
          </p>
          <div className="ev-list">
            <div><b>{t("TAMAÑO / AFORO", "SIZE / CAPACITY")}</b><span>{t("55m² / 40 personas sentadas / 60 de pie", "55m² / 40 seated / 60 standing")}
              </span></div>
            <div><b>{t("Barra central", "Central bar")}</b><span>{t("Sí · grande", "Yes · large")}</span></div>
            <div><b>{t("Mesas bajas", "Low tables")}</b><span>{t("9 · hasta 3 personas c/u", "9 · up to 3 people each")}</span></div>
            <div><b>{t("Mesas altas", "High tables")}</b><span>{t("2 · hasta 5 personas c/u", "2 · up to 5 people each")}</span></div>
            <div><b>{t("Barra pequeña", "Small bar")}</b><span>{t("Hasta 4 personas", "Up to 4 people")}</span></div>
            <div><b>{t("Audio", "Audio")}</b><span>{t("Equipo potente", "Powerful system")}</span></div>
            <div><b>{t("Iluminación", "Lighting")}</b><span>{t("Diseño óptimo", "Optimal design")}</span></div>
            <div><b>{t("Despejado", "Cleared")}</b><span>{t("Opción sin mesas", "Table-free option")}</span></div>
          </div>

          <EspacioSlider />
        </div>
      </section>

      {/* PRODUCTO */}
      <section className="ev-split">
        <div>
          <div className="tiny muted">[02] {t("Producto", "Product")}</div>
          <h2 className="h-1" style={{ marginTop: 16 }}>
            {eh("producto_title", "producto_title_red",
              t(<React.Fragment>Dumplings caseros,<br />sorprendentes,<br /></React.Fragment>,
                <React.Fragment>Homemade dumplings,<br />surprising,<br /></React.Fragment>),
              t("para todos.", "for everyone."))}
          </h2>
          <a className="btn" href="/menu" style={{ marginTop: 32 }}>
            {t("Ver la carta", "See the menu")} →
          </a>
        </div>
        <div>
          {ebp("producto_body", [
            <p className="body" key="pf0">{t(
              <React.Fragment>DUM DUM™ es uno de los <strong>referentes de dumplings en Madrid</strong>. Masa <strong>fina y agradable</strong>, rellenos <strong>generosos</strong>, recetas que <strong>sorprenden</strong>. Del Cheese Burger al Carbonara, pasando por el famoso Gamba K-Pop o el Honey Pumpkin. Y siempre con <strong>opciones divertidas para vegetarianos</strong>.</React.Fragment>,
              <React.Fragment>DUM DUM™ is one of the <strong>go-to dumpling spots in Madrid</strong>. <strong>Thin, pleasant</strong> dough, <strong>generous</strong> fillings, recipes that <strong>surprise</strong>. From the Cheese Burger to the Carbonara, plus the famous Gamba K-Pop or the Honey Pumpkin. And always with <strong>fun options for vegetarians</strong>.</React.Fragment>
            )}</p>,
            <p className="body" key="pf1" style={{ marginTop: 16 }}>{t(
              <React.Fragment>Un producto pensado para <strong>divertir, sorprender</strong> y dar de comer a <strong>todos los paladares</strong>.</React.Fragment>,
              <React.Fragment>Food made to <strong>entertain, surprise</strong> and feed <strong>every palate</strong>.</React.Fragment>
            )}</p>
          ])}

          <ProductoSlider />
        </div>
      </section>

      {/* PRENSA */}
      <section className="ev-split">
        <div>
          <div className="tiny muted">[03] {t("Prensa", "Press")}</div>
          <h2 className="h-1" style={{ marginTop: 16 }}>
            {eh("prensa_title", "prensa_title_red",
              t(<React.Fragment>Un lugar de actualidad que<br /></React.Fragment>,
                <React.Fragment>A place in the spotlight that<br /></React.Fragment>),
              t("genera atención.", "draws attention."))}
          </h2>
        </div>
        <div>
          <p className="body">
            {eb("prensa_body", t(
              <React.Fragment><strong>Concepto gastronómico disruptivo</strong>, espacio con <strong>identidad</strong> y cuidado por los detalles. Eso ha llamado la atención de los <strong>grandes medios nacionales</strong>.</React.Fragment>,
              <React.Fragment>A <strong>disruptive food concept</strong>, a space with <strong>identity</strong> and care for detail. That has caught the eye of <strong>major national media</strong>.</React.Fragment>
            ))}
          </p>

          <PrensaSlider />
        </div>
      </section>

      {/* REDES */}
      <section className="ev-split">
        <div>
          <div className="tiny muted">[04] {t("Redes", "Social")}</div>
          <h2 className="h-1" style={{ marginTop: 16 }}>
            {eh("redes_title", "redes_title_red",
              t(<React.Fragment>Generador de contenido<br /></React.Fragment>,
                <React.Fragment>A content engine<br /></React.Fragment>),
              t("que se hace viral.", "that goes viral."))}
          </h2>
        </div>
        <div>
          <p className="body">
            {eb("redes_body", t(
              <React.Fragment><strong>Expertos gastro, perfiles lifestyle</strong> y gente con <strong>muy buen algoritmo</strong> se han pasado por DUM DUM™ y lo han <strong>compartido con sus comunidades</strong>.</React.Fragment>,
              <React.Fragment><strong>Food experts, lifestyle profiles</strong> and people with a <strong>great algorithm</strong> have stopped by DUM DUM™ and <strong>shared it with their communities</strong>.</React.Fragment>
            ))}
          </p>
          <div className="ev-stats">
            <div><b>{t("Millones", "Millions")}</b><span>{t("de visualizaciones", "of views")}</span></div>
            <div><b>{t("Miles", "Thousands")}</b><span>{t("de reacciones", "of reactions")}</span></div>
            <div><b>Viral</b><span>{t("la palabra que más se repite", "the word that comes up most")}</span></div>
          </div>

          <RedesSlider />
        </div>
      </section>

      {/* UNIVERSO */}
      <section className="ev-split">
        <div>
          <div className="tiny muted">[05] {t("Universo", "Universe")}</div>
          <h2 className="h-1" style={{ marginTop: 16 }}>
            {eh("universo_title", "universo_title_red",
              t(<React.Fragment>Una marca con identidad,<br />fresca,</React.Fragment>,
                <React.Fragment>A brand with identity,<br />fresh,</React.Fragment>),
              t("pensada para entretener.", "built to entertain."))}
          </h2>
          <a className="btn"
          href="https://www.instagram.com/dumdum.plings"
          target="_blank"
          rel="noreferrer"
          style={{ marginTop: 32 }}>
            {t("Visitar Instagram", "Visit Instagram")} →
          </a>
        </div>
        <div>
          <p className="body">
            {eb("universo_body", t(
              <React.Fragment>DUM DUM™ existe con una motivación: <strong>que la gente lo pase bien</strong>. Esa experiencia arranca <strong>mucho antes</strong> de entrar al restaurante. Por eso aprovechamos <strong>cada punto de contacto</strong> para generar <strong>momentos memorables</strong>: cada post, cada campaña, cada respuesta a cada reseña.</React.Fragment>,
              <React.Fragment>DUM DUM™ exists with one motivation: <strong>for people to have a good time</strong>. That experience starts <strong>long before</strong> you walk into the restaurant. So we make the most of <strong>every touchpoint</strong> to create <strong>memorable moments</strong>: every post, every campaign, every reply to every review.</React.Fragment>
            ))}
          </p>

          <UniversoSlider />
        </div>
      </section>

      {/* AL FRENTE */}
      <section className="ev-split">
        <div>
          <div className="tiny muted">[06] {t("Al frente", "At the helm")}</div>
          <h2 className="h-1" style={{ marginTop: 16 }}>
            Kéril<br />
            <em style={{ fontStyle: 'normal', color: 'var(--red)', fontWeight: 'inherit' }}>&amp;</em> Yerai.
          </h2>
          <div className="tiny muted" style={{ marginTop: 12 }}>{eb("frente_subtitle", t("Dos hermanos · de Elche a Madrid", "Two brothers · from Elche to Madrid"))}</div>
        </div>
        <div>
          {ebp("frente_body", [
            <p className="body" key="ff0">{t(<React.Fragment>Aprendieron a <strong>trabajar juntos</strong> en el hotel donde trabajaban sus padres.</React.Fragment>,
               <React.Fragment>They learned to <strong>work together</strong> at the hotel where their parents worked.</React.Fragment>)}</p>,
            <p className="body" key="ff1" style={{ marginTop: 16 }}>{t(<React.Fragment><strong>Kéril</strong> se formó como <strong>chef</strong> y ha sido chef ejecutivo en sitios muy guays. Es un capo.</React.Fragment>,
               <React.Fragment><strong>Kéril</strong> trained as a <strong>chef</strong> and has been executive chef at some very cool places. He's a boss.</React.Fragment>)}</p>,
            <p className="body" key="ff2" style={{ marginTop: 16 }}>{t(<React.Fragment><strong>Yerai</strong> se formó como <strong>publicista</strong> y ha sido <strong>director creativo</strong> de marcas muy grandes.</React.Fragment>,
               <React.Fragment><strong>Yerai</strong> trained in <strong>advertising</strong> and has been <strong>creative director</strong> for very big brands.</React.Fragment>)}</p>,
            <p className="body" key="ff3" style={{ marginTop: 16 }}>{t(<React.Fragment>Son gente maja. <strong>Rigurosos. Creativos. Muy humanos.</strong></React.Fragment>,
               <React.Fragment>They're good people. <strong>Rigorous. Creative. Very human.</strong></React.Fragment>)}</p>,
            <p className="body" key="ff4" style={{ marginTop: 16 }}>{t("Ya les conocerás.", "You'll get to know them.")}</p>
          ])}
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="ev-services">
        <div className="tiny muted">[07] {t("Servicios", "Services")}</div>
        <h2 className="h-1" style={{ marginTop: 16, maxWidth: '20ch' }}>{t("Qué hacemos.", "What we do.")}</h2>

        <div className="ev-services-grid">
          <div className="ev-service">
            <div className="n">[01]</div>
            <div className="t">Afterwork</div>
          </div>
          <div className="ev-service">
            <div className="n">[02]</div>
            <div className="t">Cocktails</div>
          </div>
          <div className="ev-service">
            <div className="n">[03]</div>
            <div className="t">Team Building</div>
          </div>
          <div className="ev-service">
            <div className="n">[04]</div>
            <div className="t">Workshops</div>
          </div>
          <div className="ev-service">
            <div className="n">[05]</div>
            <div className="t">{t("Presentaciones", "Launches")}</div>
          </div>
          <div className="ev-service">
            <div className="n">[06]</div>
            <div className="t">{t("Alquiler de espacio", "Venue rental")}</div>
          </div>
        </div>

        <p className="tiny muted" style={{ marginTop: 24 }}>
          {t("* Si necesitas un evento fuera del restaurante, pregúntanos.", "* If you need an event outside the restaurant, just ask.")}
        </p>
      </section>

      {/* CONTACTO */}
      {/* FORMULARIO */}
      <section className="ev-split ev-split--contact" id="contact-eventos">
        <div>
          <div className="tiny muted">[08] {t("Contacto", "Contact")}</div>
          <h2 className="h-1" style={{ marginTop: 16, maxWidth: '12ch' }}>
            {eh("contacto_title", "contacto_title_red",
              t("Cuéntanos qué evento tienes en la", "Tell us what event you have in"),
              t("cabeza.", "mind."))}
          </h2>
        </div>
        <div>
          <EventosForm />
        </div>
      </section>
    </div>);
}

// ── QUIÉNES SOMOS ─────────────────────────────────────────────
function Quienes() {
  return (
    <div data-screen-label="quienes-somos">
      <section className="about-hero">
        <div className="tiny muted">[03] Filosofía</div>
        <h1 className="h-display" style={{ marginTop: 16 }}>
          Desobedecer<br />
          <em style={{ fontStyle: 'italic', color: 'var(--red)', fontWeight: 400 }}>también</em> es&nbsp;cocinar.
        </h1>
        <p className="body" style={{ marginTop: 32, fontSize: 18 }}>
          Proyecto de Kéril y Yerai Gómez, hermanos de Elche en Madrid. Uno cocinero
          (Basque Culinary Center). El otro publicista. Empezaron en DOSMIL24.
        </p>
      </section>

      <div className="about-body">
        <div>
          <div className="tiny muted" style={{ marginBottom: 16 }}>Manifiesto</div>
          <p>
            Renunciamos a casi todo lo que define a un dumpling para poder
            jugar con su formato. La masa es nuestro lienzo. Dentro: lo que
            os apetezca reconocer.
          </p>
          <p>
            Carbonara, pepito, hamburguesa con queso. Coreano, tailandés,
            castizo. Todo cabe si el bocado funciona.
          </p>
          <p>
            La comunicación es parte del plato. Si no os hace gracia el copy,
            tampoco os va a hacer gracia la salsa.
          </p>
        </div>

        <div>
          <div className="tiny muted" style={{ marginBottom: 16 }}>FAQ</div>

          <div className="qa">
            <div className="q">¿Reservas?</div>
            <div>No. Sin reserva, todos los días. Esperar es parte de la fiesta.</div>
          </div>
          <div className="qa">
            <div className="q">¿Cantidad?</div>
            <div>Recomendamos 2 raciones por comensal hambriento, 1,5 si es ligero.</div>
          </div>
          <div className="qa">
            <div className="q">¿Vegetarianos?</div>
            <div>Siempre hay al menos dos dumplings veggies en carta.</div>
          </div>
          <div className="qa">
            <div className="q">¿Domicilio?</div>
            <div>Sí, a través de Uber Eats. Llega caliente.</div>
          </div>
          <div className="qa">
            <div className="q">¿Eventos privados?</div>
            <div>Escríbenos a dumdum@dum-dum.es.</div>
          </div>
        </div>
      </div>

      <section className="spec-foot">
        <div><b>Año fundación</b>DOSMIL24</div>
        <div><b>Origen</b>Elche → Madrid</div>
        <div><b>Locales</b>02 / Madrid</div>
        <div><b>Ticket medio</b>≈ 25 €</div>
      </section>
    </div>);

}

// ── CONTACTO ──────────────────────────────────────────────────
function Contacto() {
  const lang = useLang();
  return (
    <div data-screen-label="contacto">
      <section className="contact">
        <div>
          <div className="tiny muted">[04] {t("Contacto", "Contact")}</div>
          <h1 style={{ marginTop: 16 }}>{t("Saluda", "Say hi")}<span style={{ color: 'var(--red)' }}>.</span></h1>
          <p className="body" style={{ marginTop: 24 }}>
            {t(
              "Por si te apetece preguntar, criticar, colaborar, vender, invitar, contratar o invitarnos. La puerta y la bandeja están abiertas.",
              "In case you fancy asking, complaining, collaborating, selling, inviting, hiring or treating us. The door and the inbox are open."
            )}
          </p>

          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div className="tiny muted">{t("Horario atención", "Support hours")}</div>
            <div className="mono">{t("LUN — VIE · 10.00 – 18.00", "MON — FRI · 10.00 – 18.00")}</div>
          </div>
        </div>

        <div>
          <a className="big" href="mailto:dumdum@dum-dum.es">
            dumdum@dum-dum.es <span className="arr">↗︎</span>
          </a>
          <a className="big" href="https://www.instagram.com/dumdum.plings" target="_blank" rel="noreferrer">
            Instagram <span className="arr">↗︎</span>
          </a>
          <a className="big" href="tel:+34614746065">
            +34 614 746 065 <span className="arr">↗︎</span>
          </a>
        </div>
      </section>

      <section className="spec-foot">
        <div><b>Email</b>dumdum@dum-dum.es</div>
        <div><b>{t("Reservas", "Booking")}</b>{t("Chamberí: turnos | Tetuán: reservas", "Chamberí: walk-in | Tetuán: booking")}</div>
        <div><b>Instagram</b>@dumdum.plings</div>
        <div><b>{t("Teléfono", "Phone")}</b>+34 614 746 065</div>
      </section>
    </div>);

}

Object.assign(window, { Home, Menu, Locales, Quienes, Contacto, Eventos });