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

  // Sello: al tocarlo alterna a estado "activo" (fondo rojo + claim).
  const [sealActive, setSealActive] = React.useState(false);

  return (
    <div data-screen-label="home">
      <section className="home home-index">
        <div className="hero-index">
          <div className="hero-stage">
            {/* Bloque horario, pegado a la izda del logo */}
            <div className="hero-info hero-info-l">
              <div>TODOS LOS DÍAS</div>
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
            <a className="btn" href="#" onClick={(e) => e.preventDefault()}>Reservar →</a>
            <a className="btn" href="#/locales">Llegar →</a>
            <button
              type="button"
              className="btn"
              onClick={() => showToast("uber")}>
              Take Away →
            </button>
            <a className="btn red" href={UBER_URL} target="_blank" rel="noreferrer">Uber Eats →</a>
          </div>
          <div className="hero-scroll" aria-hidden="true">↓</div>
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
          <div className="tiny muted" style={{ marginBottom: 16 }}>/ CARTA</div>
          <h2>Una carta corta<br /><em style={{ color: 'var(--red)', fontStyle: 'normal', fontWeight: 'inherit' }}>que cambia cada mes.</em></h2>
          <p className="body" style={{ marginTop: 24 }}>
            Nueve dumplings. Uno nuevo cada mes. De los nueve,
            mínimo 2 vegetarianos. De los nueve, <strong style={{ fontWeight: 700 }}>ni uno convencional</strong>.
          </p>
          <a className="btn" href="#/menu" style={{ marginTop: 32 }}>Leer carta de mayo →</a>
        </div>
        <div>
          <div className="tiny muted" style={{ marginBottom: 16 }}>/ SISTEMA</div>
          <h2>Chamberí sin reserva.<br /><em style={{ color: 'var(--red)', fontStyle: 'normal', fontWeight: 'inherit' }}>Con reserva en Tetuán.</em></h2>
          <p className="body" style={{ marginTop: 24 }}>
            En Blasco de Garay llegas y a comer. En Infanta Mercedes puedes
            reservar online o probar suerte. En ambos vamos como balas.
          </p>
          <div className="row gap-m" style={{ marginTop: 32 }}>
            <a className="btn" href="#" onClick={(e) => e.preventDefault()}>Reservar en Tetuán →</a>
          </div>
        </div>
      </section>

      {/* Flat map nav · 9 celdas en 3 columnas */}
      <nav className="map-nav map-nav-3">
        <a className="map-cell" href="#/menu">
          <div className="n">[01]</div>
          <div className="t">La carta →</div>
          <div className="d">ECHA UN VISTAZO</div>
        </a>
        <a className="map-cell" href="https://www.ubereats.com/es/store/dum-dum-%7C-chamberi/7NGxIIg1XVmNEz9mAkgI7Q?diningMode=DELIVERY" target="_blank" rel="noreferrer">
          <div className="n">[02]</div>
          <div className="t">Uber Eats →</div>
          <div className="d">NI TE MUEVAS</div>
        </a>
        <a className="map-cell" href="#" onClick={(e) => { e.preventDefault(); showToast("uber"); }}>
          <div className="n">[03]</div>
          <div className="t">Take Away →</div>
          <div className="d">PRÓXIMAMENTE</div>
        </a>
        <a className="map-cell" href="#/locales">
          <div className="n">[04]</div>
          <div className="t">Locales →</div>
          <div className="d">CHAMBERÍ #015 + TETUÁN #020</div>
        </a>
        <a className="map-cell" href="#/eventos">
          <div className="n">[05]</div>
          <div className="t">Eventos →</div>
          <div className="d">AFTER WORKS · CUMPLES · DIVORCIOS?</div>
        </a>
        <a className="map-cell" href="#/contacto">
          <div className="n">[06]</div>
          <div className="t">Contacto →</div>
          <div className="d">SALÚDAME SIEMPRE</div>
        </a>
        <a className="map-cell" href="#" onClick={(e) => e.preventDefault()}>
          <div className="n">[07]</div>
          <div className="t">Instagram →</div>
          <div className="d">@DUMDUM.PLINGS</div>
        </a>
        <a className="map-cell" href="#" onClick={(e) => e.preventDefault()}>
          <div className="n">[08]</div>
          <div className="t">DD*Radio →</div>
          <div className="d">SPOTIFY</div>
        </a>
        <a className="map-cell" href="#" onClick={(e) => { e.preventDefault(); showToast("soon"); }}>
          <div className="n">[09]</div>
          <div className="t">DD*Mer®ch →</div>
          <div className="d">PRÓXIMAMENTE</div>
        </a>
        {/* Celda-sello · rellena el hueco de la rejilla en móvil (2 col).
            Al tocarla, alterna a estado rojo con el claim "DESOBEDECER...". */}
        <button
          type="button"
          className={`map-cell map-cell-seal ${sealActive ? "is-active" : ""}`}
          onClick={() => setSealActive((v) => !v)}
          aria-label="DUM DUM">
          {sealActive ?
            <img className="seal-claim" src="img/dumdum-desobedecer.svg" alt="Desobedecer es un derecho y una obligación" /> :
            <img className="seal-mark" src="img/dumdum-sello.svg" alt="" />}
        </button>
      </nav>

      {/* Spec footer */}
      <section className="spec-foot">
        <div>
          <b>Año</b>
          © DOSMIL24
        </div>
        <div>
          <b>Locales</b>
          02 (so far) / Madrid / Chamberí · Tetuán
        </div>
        <div>
          <b>Carta</b>
          Mensual / vapor
        </div>
        <div>
          <b>Sistema</b>
          Chamberí: turnos | Tetuán: reservas
        </div>
      </section>

      {/* Toast flotante "Próximamente" (Take Away / Merch) · fijo abajo */}
      {toast &&
        <div className="home-toast" role="status">
          {toast === "uber" ?
            <span>Próximamente. De momento puedes pedir para recoger en <a href={UBER_URL} target="_blank" rel="noreferrer">Uber Eats →</a></span> :
            <span>Próximamente.</span>}
        </div>
      }
    </div>);

}

// ── CARTA (mobile QR) ─────────────────────────────────────────
function Menu() {
  const [data, setData] = React.useState(window.DumDumData.loadMenu());

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
              <h1 className="menu-h">{data.header && data.header.title || "Carta"}</h1>
              <div className="menu-sub">{data.header && data.header.subtitle || "DUM DUM™ · Actualizada"} {data.updated}</div>
            </div>
          </div>
        </div>

        {data.disclaimer &&
        <aside className="menu-disclaimer">
            <span className="menu-disclaimer-arrow" aria-hidden="true">→</span>
            <div className="menu-disclaimer-bubble">
              <p dangerouslySetInnerHTML={{ __html: data.disclaimer }} />
            </div>
          </aside>
        }

        {data.sections.map((sec) =>
        <section key={sec.id} className={`menu-section section--${sec.id} ${sec.id === "bebidas" ? "section-mobile-only" : ""}`}>
            <div className="menu-sectionhead">
              <h3>{sec.title}</h3>
              <div className="meta">{sec.note}</div>
            </div>

            <div className={`dish-grid ${sec.id === "postres" ? "dish-grid-2col-m" : ""} ${sec.id === "bebidas" ? "dish-grid-2col-m drinks-grid" : ""}`}>
              {sec.items.filter((it) => it.available !== false).map((it) =>
            <article key={it.id} className={`dish ${it.logo ? "with-logo" : ""} ${it.featured ? "is-featured" : ""}`}>
                  {/* ─── Layout MOBILE (visible <880px) ──────────────── */}
                  <div className="num m-only">[nº{String(it.n).padStart(2, "0")}]</div>
                  <div className="body m-only">
                    <div className="name-row">
                      <span className="name" style={{ fontSize: "20px" }}>{it.name}</span>
                      {it.tags && it.tags.map((t) => {
                    const u = t.toUpperCase();
                    const label = u === "PICANTE" ? "HOT 🌶" : u === "VEG" ? "VEG 🌱" : t;
                    return (
                      <span key={t} className={`tag ${tagClass(t)}`} style={{ fontSize: "10px" }}>{label}</span>);

                  })}
                    </div>
                    {it.tagline && <div className="tagline">{it.tagline}</div>}
                    {it.ingredients && <div className="ingr" style={{ fontSize: "13px" }}>{it.ingredients}</div>}
                  </div>
                  {it.logo && <div className="m-only"><DishLogo logo={it.logo} /></div>}
                  <div className="price tnum m-only" style={{ fontSize: "11px" }}>{it.price} €</div>

                  {/* ─── Layout DESKTOP (visible ≥880px) ──────────────── */}
                  <div className="dish-img">
                    {it.image ?
                <img src={it.image} alt={it.name} /> :
                <div className="dish-img-ph">
                          <span className="ph-label">[{it.name}]</span>
                          <span className="ph-sub">product shot · 4:5</span>
                        </div>}
                    {it.tags && it.tags.filter((t) => !["VEG", "PICANTE"].includes(t.toUpperCase())).length > 0 &&
                <div className="dish-tags-overlay">
                        {it.tags.filter((t) => !["VEG", "PICANTE"].includes(t.toUpperCase())).map((t) =>
                  <span key={t} className={`tag ${tagClass(t)}`}>{t}</span>
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
                      <span className="name">{it.name}</span>
                      {it.tags && it.tags.filter((t) => ["VEG", "PICANTE"].includes(t.toUpperCase())).map((t) => {
                    const u = t.toUpperCase();
                    const label = u === "PICANTE" ? "HOT 🌶" : u === "VEG" ? "VEG 🌱" : t;
                    return (
                      <span key={t} className={`tag tag-inline ${tagClass(t)}`}>{label}</span>);

                  })}
                    </div>
                    <div className="dish-card-row dish-card-text">
                      {it.tagline && <div className="tagline">{it.tagline}</div>}
                      {it.ingredients && <div className="ingr">{it.ingredients}</div>}
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
            <p><b>¡Por cierto!</b> Hay palillos para los que todavía no sepan comer con las manos. Aunque hoy podría ser un buen día para aprender 😉</p>
          </div>
        </aside>

        <div className="menu-foot">
          <div className="menu-foot-left">
            {/* href="#" PROVISIONAL · cambiar cuando exista el editor/PDF de alérgenos */}
            <a className="btn menu-foot-btn" href="#">Alérgenos →</a>
            <div className="menu-foot-text">Si tienes alguna alergia, alguna intolerancia o, simplemente, dudas, pregúntanos, que somos muy majos.</div>
          </div>
          {isMobile &&
          <button
            className="btn menu-foot-btn menu-top-btn"
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Volver arriba <span className="menu-top-arrow" aria-hidden="true">↑</span>
          </button>
          }
        </div>
      </div>
    </div>);

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
  // Recalcula el estado cada minuto para mantenerlo al día sin recargar.
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const est = estadoApertura(tramos);
  if (est.abierto) {
    return (
      <div className="row gap-s tiny" style={{ marginBottom: 16 }}>
        <span className="dot dot-live" /> Abierto · cierra {est.hora}h
      </div>);
  }
  // Texto coherente: siempre la hora del próximo tramo de apertura.
  const frase = `Nos vemos a partir de las ${est.hora}h`;
  return (
    <div className="row gap-s tiny" style={{ marginBottom: 16 }}>
      <span className="dot dot-closed" /> {frase}
    </div>);
}

function Locales() {
  return (
    <div data-screen-label="locales">
      <section style={{ padding: '14vh var(--gutter) 6vh', borderBottom: '1px solid var(--line)' }}>
        <div className="tiny muted">[02] Locales</div>
        <h1 className="h-display" style={{ marginTop: 16 }}>Dos casas<br />en Madrid.</h1>
      </section>

      <div className="locales">
        <div className="locale-card">
          <div>
            <EstadoLocal tramos={[[780, 939], [1200, 1359]]} />
            <h2>Chamberí.</h2>
            <div className="tiny muted" style={{ marginTop: 8 }}>Local original · desde DOSMIL24</div>

            <div className="info">
              <b>Dirección</b><div>Blasco de Garay, 10 · 28015 Madrid</div>
              <b>Metro</b><div>Argüelles · San Bernardo</div>
              <b>Horario</b><div>13.00–15.39 / 20.00–22.39</div>
              <b>Aforo</b><div>~32 comensales</div>
              <b>Reserva</b><div style={{ color: 'var(--red)' }}>Sin reserva · por turnos</div>
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

        <div className="locale-card">
          <div>
            <EstadoLocal tramos={[[780, 939], [1200, 1359]]} />
            <h2>Tetuán.</h2>
            <div className="tiny muted" style={{ marginTop: 8 }}>SEGUNDO LOCAL · DESDE DOSMIL26</div>

            <div className="info">
              <b>Dirección</b><div>Infanta Mercedes, 17 · 28020 Madrid</div>
              <b>Metro</b><div>Tetuán · Estrecho</div>
              <b>Horario</b><div>13.00–15.39 / 20.00–22.39</div>
              <b>Aforo</b><div>~40 comensales</div>
              <b>Reserva</b><div style={{ color: '#1f8a5b', fontWeight: 500 }}>Sí · online</div>
            </div>

            <a className="btn red" href="#" onClick={(e) => e.preventDefault()} style={{ marginTop: 24 }}>
              Reservar en Tetuán →
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

      <section className="spec-foot">
        <div><b>Interiorismo</b>Nota Estudio</div>
        <div><b>Identidad</b>Yerai Gómez</div>
        <div><b>Cocina</b>Kéril Gómez · BCC</div>
        <div><b>Año apertura</b>CHAMBERÍ · DOSMIL24 | TETUÁN · DOSMIL26</div>
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
    <GallerySlider photos={photos} visible={2} label="Espacio" />);

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
  return (
    <GallerySlider photos={photos} visible={2} label="Producto" placeholderLabel="Producto" />);

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
function GallerySlider({ photos, visible = 2, label = "Galería", placeholderLabel = "Espacio", cta = null, ratio = "4 / 3" }) {
  const total = photos.length;
  const [idx, setIdx] = React.useState(0);
  const [lightbox, setLightbox] = React.useState(null); // índice de foto ampliada, o null

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

  return (
    <div className={`ev-slider ev-slider-cols-${visible}`}>
      <div className="ev-slider-head">
        <div className="tiny muted">{label} · {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</div>
        <div className="ev-slider-ctrls">
          <button onClick={prev} aria-label="Anterior" className="ev-slider-btn">←</button>
          <button onClick={next} aria-label="Siguiente" className="ev-slider-btn">→</button>
        </div>
      </div>
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
      <Lightbox
        photos={photos}
        index={lightbox}
        label={label}
        onClose={() => setLightbox(null)}
        onNav={(d) => setLightbox((p) => (p + d + total) % total)}
      />
    </div>);

}

// ── Lightbox · visor de galería ampliada ──────────────────────
// Se abre al hacer clic en una foto. Navega con flechas, se cierra
// con la X, con clic en el fondo y con la tecla Escape. Respeta el
// diseño del sitio (rojo, mono, transiciones suaves).
function Lightbox({ photos, index, label = "Galería", onClose, onNav }) {
  const open = index !== null && index !== undefined;

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

      <div className="lb-stage" onClick={(e) => e.stopPropagation()}>
        {item.src &&
          <img src={item.src} alt="" className="lb-img" style={{ objectPosition: item.pos || "50% 50%" }} />}
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
      setErrMsg("Rellena los campos obligatorios: nombre, email, teléfono y fecha del evento.");
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
        setErrMsg(data.message || "No se pudo enviar. Inténtalo de nuevo o escríbenos directamente.");
      }
    } catch (err) {
      setState("error");
      setErrMsg("No hay conexión. Inténtalo de nuevo.");
    }
  };

  if (state === "ok") {
    return (
      <div className="ev-form ev-form-ok">
        <div className="tiny muted">Mensaje enviado</div>
        <h3 className="h-2" style={{ marginTop: 12 }}>
          Gracias. <em style={{ fontStyle: 'normal', color: 'var(--red)', fontWeight: 'inherit' }}>Te contestamos cuanto antes.</em>
        </h3>
        <button type="button" className="btn" style={{ marginTop: 24 }}
        onClick={() => setState("idle")}>
          Enviar otra solicitud
        </button>
      </div>);

  }

  return (
    <form className="ev-form" onSubmit={submit}>
      <div className="ev-form-row ev-form-row-3">
        <label className="ev-field">
          <span>Nombre y apellido *</span>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => set("nombre", e.target.value)}
            required
            placeholder="Tu nombre" />
        </label>
        <label className="ev-field">
          <span>Empresa</span>
          <input
            type="text"
            value={form.empresa}
            onChange={(e) => set("empresa", e.target.value)}
            placeholder="Tu empresa (opcional)" />
        </label>
        <label className="ev-field">
          <span>Email *</span>
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
          <span>Teléfono *</span>
          <input
            type="tel"
            value={form.telefono}
            onChange={(e) => set("telefono", e.target.value)}
            required
            placeholder="+34 600 000 000" />
        </label>
        <label className="ev-field">
          <span>Fecha del evento *</span>
          <input
            type="date"
            value={form.fecha}
            onChange={(e) => set("fecha", e.target.value)}
            required />
        </label>
        <label className="ev-field">
          <span>Número de asistentes</span>
          <select
            value={form.asistentes}
            onChange={(e) => set("asistentes", e.target.value)}
            className="ev-select">
            <option value="">Selecciona…</option>
            <option value="Menos de 10">Menos de 10</option>
            <option value="Entre 10 y 15">Entre 10 y 15</option>
            <option value="Entre 15 y 20">Entre 15 y 20</option>
            <option value="Entre 20 y 25">Entre 20 y 25</option>
            <option value="Entre 25 y 30">Entre 25 y 30</option>
            <option value="Entre 30 y 35">Entre 30 y 35</option>
            <option value="Entre 35 y 40">Entre 35 y 40</option>
            <option value="Más de 40">Más de 40</option>
          </select>
        </label>
      </div>

      <label className="ev-field">
        <span>¿Qué necesitas?</span>
        <textarea
          value={form.mensaje}
          onChange={(e) => set("mensaje", e.target.value)}
          rows={5}
          placeholder="Tipo de evento, comentarios…" />
      </label>

      {state === "error" &&
      <div className="ev-form-err">{errMsg}</div>
      }

      <button type="submit" className="btn red" disabled={state === "sending"}
      style={{ marginTop: 12 }}>
        {state === "sending" ? "Enviando…" : "Enviar solicitud →"}
      </button>
    </form>);

}

// ── EVENTOS ───────────────────────────────────────────────────
function Eventos() {
  return (
    <div data-screen-label="eventos">
      {/* HERO */}
      <section className="ev-hero">
        <div className="tiny muted">[05] Eventos</div>
        <h1 className="h-display" style={{ marginTop: 16 }}>
          Un sitio cool<br />
          <em style={{ fontStyle: 'normal', color: 'var(--red)', fontWeight: 'inherit' }}>para eventos cool.</em>
        </h1>
        <p className="body" style={{ marginTop: 32, fontSize: 18 }}>
          En el corazón de Tetuán y diseñado por <strong>Nota Estudio</strong>. 55 m² diáfanos, cocina abierta,
          hasta 35 personas, equipo de sonido potente y luz pensada. Un sitio
          a la altura de tu evento.
        </p>
      </section>

      {/* ESPACIO */}
      <section className="ev-split">
        <div>
          <div className="tiny muted">[01] Espacio</div>
          <h2 className="h-1" style={{ marginTop: 16 }}>
            Un sitio bien diseñado,<br />funcional, en el que<br />apetece estar.
          </h2>
        </div>
        <div>
          <p className="body">
            Espacio diáfano de <strong>55 m²</strong> con <strong>cocina abierta</strong> integrada en la sala. Combina un
            aire <strong>minimal y urbano</strong> con un <strong>coolness cosmopolita</strong>. Configurable según
            necesidades del evento.
          </p>
          <div className="ev-list">
            <div><b>TAMAÑO / AFORO</b><span>55M2 / 40 PERSONAS
              </span></div>
            <div><b>Barra central</b><span>Sí · grande</span></div>
            <div><b>Mesas bajas</b><span>9 · hasta 3 personas c/u</span></div>
            <div><b>Mesas altas</b><span>2 · hasta 5 personas c/u</span></div>
            <div><b>Barra pequeña</b><span>Hasta 4 personas</span></div>
            <div><b>Audio</b><span>Equipo potente</span></div>
            <div><b>Iluminación</b><span>Diseño óptimo</span></div>
            <div><b>Despejado</b><span>Opción sin mesas</span></div>
          </div>

          <EspacioSlider />
        </div>
      </section>

      {/* PRODUCTO */}
      <section className="ev-split">
        <div>
          <div className="tiny muted">[02] Producto</div>
          <h2 className="h-1" style={{ marginTop: 16 }}>
            Dumplings caseros,<br />sorprendentes,<br />
            <em style={{ fontStyle: 'normal', color: 'var(--red)', fontWeight: 'inherit' }}>para todos.</em>
          </h2>
          <a className="btn" href="#/menu" style={{ marginTop: 32 }}>
            Ver la carta →
          </a>
        </div>
        <div>
          <p className="body">DUM DUM™ es uno de los <strong>referentes de dumplings en Madrid</strong>. Masa <strong>fina y agradable</strong>, rellenos <strong>generosos</strong>, recetas que <strong>sorprenden</strong>. Del Cheese Burger al Carbonara, pasando por el famoso Gamba K-Pop o el Honey Pumpkin. Y siempre con <strong>opciones divertidas para vegetarianos</strong>.

          </p>
          <p className="body" style={{ marginTop: 16 }}>Un producto pensado para <strong>divertir, sorprender</strong> y dar de comer a <strong>todos los paladares</strong>.
          </p>

          <ProductoSlider />
        </div>
      </section>

      {/* PRENSA */}
      <section className="ev-split">
        <div>
          <div className="tiny muted">[03] Prensa</div>
          <h2 className="h-1" style={{ marginTop: 16 }}>
            Un lugar de actualidad que<br />
            <em style={{ fontStyle: 'normal', color: 'var(--red)', fontWeight: 'inherit' }}>genera atención.</em>
          </h2>
        </div>
        <div>
          <p className="body">
            <strong>Concepto gastronómico disruptivo</strong>, espacio con <strong>identidad</strong> y cuidado por
            los detalles. Eso ha llamado la atención de los <strong>grandes medios nacionales</strong>.
          </p>

          <PrensaSlider />
        </div>
      </section>

      {/* REDES */}
      <section className="ev-split">
        <div>
          <div className="tiny muted">[04] Redes</div>
          <h2 className="h-1" style={{ marginTop: 16 }}>
            Generador de contenido<br />
            <em style={{ fontStyle: 'normal', color: 'var(--red)', fontWeight: 'inherit' }}>que se hace viral.</em>
          </h2>
        </div>
        <div>
          <p className="body">
            <strong>Expertos gastro, perfiles lifestyle</strong> y gente con <strong>muy buen algoritmo</strong>
            se han pasado por DUM DUM™ y lo han <strong>compartido con sus comunidades</strong>.
          </p>
          <div className="ev-stats">
            <div><b>Millones</b><span>de visualizaciones</span></div>
            <div><b>Miles</b><span>de reacciones</span></div>
            <div><b>Viral</b><span>la palabra que más se repite</span></div>
          </div>

          <RedesSlider />
        </div>
      </section>

      {/* UNIVERSO */}
      <section className="ev-split">
        <div>
          <div className="tiny muted">[05] Universo</div>
          <h2 className="h-1" style={{ marginTop: 16 }}>
            Una marca con identidad,<br />fresca,
            <em style={{ fontStyle: 'normal', color: 'var(--red)', fontWeight: 'inherit' }}> pensada
para entretener.</em>
          </h2>
          <a className="btn"
          href="https://www.instagram.com/dumdum.es/"
          target="_blank"
          rel="noreferrer"
          style={{ marginTop: 32 }}>
            Visitar Instagram →
          </a>
        </div>
        <div>
          <p className="body">
            DUM DUM™ existe con una motivación: <strong>que la gente lo pase bien</strong>. Esa
            experiencia arranca <strong>mucho antes</strong> de entrar al restaurante. Por eso
            aprovechamos <strong>cada punto de contacto</strong> para generar <strong>momentos memorables</strong>:
            cada post, cada campaña, cada respuesta a cada reseña.
          </p>

          <UniversoSlider />
        </div>
      </section>

      {/* AL FRENTE */}
      <section className="ev-split">
        <div>
          <div className="tiny muted">[06] Al frente</div>
          <h2 className="h-1" style={{ marginTop: 16 }}>
            Kéril<br />
            <em style={{ fontStyle: 'normal', color: 'var(--red)', fontWeight: 'inherit' }}>&amp;</em> Yerai.
          </h2>
          <div className="tiny muted" style={{ marginTop: 12 }}>Dos hermanos · de Elche a Madrid</div>
        </div>
        <div>
          <p className="body">
            Aprendieron a <strong>trabajar juntos</strong> en el hotel donde trabajaban sus padres.
          </p>
          <p className="body" style={{ marginTop: 16 }}>
            <strong>Kéril</strong> se formó como <strong>chef</strong> y ha sido chef ejecutivo en sitios muy guays.
            Es un capo.
          </p>
          <p className="body" style={{ marginTop: 16 }}>
            <strong>Yerai</strong> se formó como <strong>publicista</strong> y ha sido <strong>director creativo</strong> de marcas
            muy grandes.
          </p>
          <p className="body" style={{ marginTop: 16 }}>
            Son gente maja. <strong>Rigurosos. Creativos. Muy humanos.</strong>
          </p>
          <p className="body" style={{ marginTop: 16 }}>
            Ya les conocerás.
          </p>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="ev-services">
        <div className="tiny muted">[07] Servicios</div>
        <h2 className="h-1" style={{ marginTop: 16, maxWidth: '20ch' }}>Qué hacemos.</h2>

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
            <div className="t">Presentaciones</div>
          </div>
          <div className="ev-service">
            <div className="n">[06]</div>
            <div className="t">Alquiler de espacio</div>
          </div>
        </div>

        <p className="tiny muted" style={{ marginTop: 24 }}>
          * Si necesitas un evento fuera del restaurante, pregúntanos.
        </p>
      </section>

      {/* CONTACTO */}
      {/* FORMULARIO */}
      <section className="ev-split ev-split--contact" id="contact-eventos">
        <div>
          <div className="tiny muted">[08] Contacto</div>
          <h2 className="h-1" style={{ marginTop: 16, maxWidth: '12ch' }}>
            Cuéntanos qué evento tienes en la
            <em style={{ fontStyle: 'normal', color: 'var(--red)', fontWeight: 'inherit' }}> cabeza.</em>
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
  return (
    <div data-screen-label="contacto">
      <section className="contact">
        <div>
          <div className="tiny muted">[04] Contacto</div>
          <h1 style={{ marginTop: 16 }}>Saluda<span style={{ color: 'var(--red)' }}>.</span></h1>
          <p className="body" style={{ marginTop: 24 }}>
            Por si te apetece preguntar, criticar, colaborar, vender,
            invitar, contratar o invitarnos. La puerta y la bandeja están abiertas.
          </p>

          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div className="tiny muted">Horario atención</div>
            <div className="mono">LUN — VIE · 10.00 – 18.00</div>
          </div>
        </div>

        <div>
          <a className="big" href="mailto:dumdum@dum-dum.es">
            dumdum@dum-dum.es <span className="arr">↗</span>
          </a>
          <a className="big" href="#" onClick={(e) => e.preventDefault()}>
            Instagram <span className="arr">↗</span>
          </a>
          <a className="big" href="#" onClick={(e) => e.preventDefault()}>
             <span className="arr"></span>
          </a>
        </div>
      </section>

      <section className="spec-foot">
        <div><b>Email</b>dumdum@dum-dum.es</div>
        <div><b>Reservas</b>Chamberí: turnos | Tetuán: reservas</div>
        <div><b>Instagram</b>@dumdum_es</div>
        <div><b>TikTok</b>@dumdum.es</div>
      </section>
    </div>);

}

Object.assign(window, { Home, Menu, Locales, Quienes, Contacto, Eventos });