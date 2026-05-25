// ─────────────────────────────────────────────────────────────
// /admin — Editor visual de la carta (demo, persiste en localStorage)
// ─────────────────────────────────────────────────────────────

const TAG_OPTIONS = ["NEW", "VEG", "PICANTE", "DEL MES", "TOP"];
const PRESET_OPTIONS = [
  { id: null, label: "Sin logo" },
  { id: "kpop", label: "K-POP" },
  { id: "cheese", label: "Cheeseburger" },
  { id: "castizo", label: "Castizo" }
];

function Admin() {
  const [logged, setLogged] = React.useState(window.DumDumData.isLoggedIn());
  if (!logged) return <Login onOk={() => setLogged(true)} />;
  return <AdminApp onLogout={() => { window.DumDumData.logout(); setLogged(false); }} />;
}

// ── Login screen ──────────────────────────────────────────────
function Login({ onOk }) {
  const [pw, setPw] = React.useState("");
  const [err, setErr] = React.useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (window.DumDumData.login(pw)) onOk();
    else { setErr(true); setTimeout(() => setErr(false), 800); }
  };
  return (
    <div className="login-screen" data-screen-label="admin-login">
      <form className="login-card" onSubmit={submit}>
        <div className="tiny muted" style={{marginBottom:12}}>DUM DUM™ / Admin</div>
        <h1>Editor de carta.</h1>
        <p>Acceso restringido al equipo.</p>

        <div className="field">
          <label>Contraseña</label>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoFocus
            style={err ? { borderColor: "var(--red)", outline: "2px solid var(--red)", outlineOffset: -1 } : null}
            placeholder="••••••••"
          />
          {err && <div style={{color:'var(--red)', fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.05em', fontWeight:600, textTransform:'uppercase'}}>Incorrecta. Inténtalo de nuevo.</div>}
        </div>

        <button type="submit" className="btn red" style={{width:'100%', justifyContent:'center', padding:'14px 18px'}}>
          Entrar →
        </button>

        <div style={{marginTop:16, paddingTop:16, borderTop:'1px solid var(--line-soft)'}}>
          <div className="tiny muted">Demo · usa la clave</div>
          <div className="mono" style={{fontSize:12, marginTop:4}}>desobediencia</div>
        </div>

        <a href="/" className="tiny muted link-hover" style={{display:'inline-block', marginTop:16}}>← Volver a la web</a>
      </form>
    </div>
  );
}

// ── Editor principal ──────────────────────────────────────────
function AdminApp({ onLogout }) {
  const [data, setData] = React.useState(window.DumDumData.loadMenu());
  const [view, setView] = React.useState({ type: "dish", id: data.sections[1]?.items[0]?.id || data.sections[0].items[0].id });
  const [dirty, setDirty] = React.useState(false);
  const [savedFlash, setSavedFlash] = React.useState(false);

  // legacy alias for the dish editor
  const selectedId = view.type === "dish" ? view.id : null;
  const setSelectedId = (id) => setView({ type: "dish", id });

  // Buscar el item y su sección
  const found = findItem(data, selectedId);

  const updateItem = (next) => {
    const d = JSON.parse(JSON.stringify(data));
    const sec = d.sections.find(s => s.id === found.section.id);
    const idx = sec.items.findIndex(i => i.id === selectedId);
    sec.items[idx] = next;
    setData(d);
    setDirty(true);
  };

  const moveItem = (dir) => {
    const d = JSON.parse(JSON.stringify(data));
    const sec = d.sections.find(s => s.id === found.section.id);
    const idx = sec.items.findIndex(i => i.id === selectedId);
    const ni = idx + dir;
    if (ni < 0 || ni >= sec.items.length) return;
    const tmp = sec.items[ni];
    sec.items[ni] = sec.items[idx];
    sec.items[idx] = tmp;
    setData(d);
    setDirty(true);
  };

  const addItem = (sectionId) => {
    const d = JSON.parse(JSON.stringify(data));
    const sec = d.sections.find(s => s.id === sectionId);
    const newId = "n" + Date.now();
    const maxN = Math.max(0, ...d.sections.flatMap(s => s.items.map(i => i.n || 0)));
    sec.items.push({
      id: newId, n: maxN + 1, name: "Nuevo plato",
      tagline: "", ingredients: "", price: "0,00",
      tags: [], logo: null
    });
    setData(d);
    setSelectedId(newId);
    setDirty(true);
  };

  const deleteItem = () => {
    if (!confirm(`¿Eliminar "${found.item.name}"?`)) return;
    const d = JSON.parse(JSON.stringify(data));
    const sec = d.sections.find(s => s.id === found.section.id);
    sec.items = sec.items.filter(i => i.id !== selectedId);
    setData(d);
    setDirty(true);
    setSelectedId(sec.items[0]?.id || d.sections[0].items[0].id);
  };

  const save = () => {
    try {
      window.DumDumData.saveMenu(data);
      setDirty(false);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1600);
    } catch (e) {
      const isQuota = /quota|exceeded|QuotaExceededError/i.test(e?.name + " " + e?.message);
      if (isQuota) {
        alert(
          "No hay espacio para guardar.\n\n" +
          "Las fotos pesan demasiado para el almacenamiento local del navegador (~5MB máx). " +
          "Sube imágenes más ligeras (recomendado: <300KB cada una) o quita algunas antes de guardar.\n\n" +
          "Tip: en producción esto pasará a un backend real, este límite no aplicará."
        );
      } else {
        alert("Error al guardar: " + (e?.message || e));
      }
      console.error("saveMenu failed", e);
    }
  };

  const reset = () => {
    if (!confirm("¿Volver a la carta original? Perderás los cambios sin guardar.")) return;
    window.DumDumData.resetMenu();
    setData(window.DumDumData.INITIAL_MENU);
    setDirty(false);
  };

  const updateUpdated = (val) => {
    setData({...data, updated: val});
    setDirty(true);
  };

  // ── helpers to edit general & section state ──────────────────
  const updateData = (patch) => {
    setData({...data, ...patch});
    setDirty(true);
  };
  const updateHeader = (patch) => {
    const h = {...(data.header || {}), ...patch};
    setData({...data, header: h});
    setDirty(true);
  };
  const updateFooterLine = (i, val) => {
    const f = [...(data.footer || [])];
    f[i] = val;
    setData({...data, footer: f});
    setDirty(true);
  };
  const updateSection = (sectionId, patch) => {
    const d = JSON.parse(JSON.stringify(data));
    const sec = d.sections.find(s => s.id === sectionId);
    Object.assign(sec, patch);
    setData(d);
    setDirty(true);
  };

  return (
    <div className="admin-shell" data-screen-label="admin">
      <div className="admin-bar">
        <div className="row gap-m">
          <span><b>DUM DUM™</b> · Editor de carta</span>
          <span style={{color:'rgba(255,255,255,0.4)'}}>·</span>
          <span>Última act. <input type="text" value={data.updated} onChange={(e)=>updateUpdated(e.target.value)}
            style={{background:'transparent', border:'none', borderBottom:'1px dotted rgba(255,255,255,0.4)', color:'#fff', fontFamily:'var(--font-mono)', fontSize:11, width:80, padding:'2px 4px', fontWeight:600, textTransform:'uppercase'}}/></span>
        </div>
        <div className="row gap-m">
          {savedFlash && <span style={{color:'#7fff9e'}}>✓ Guardado</span>}
          {dirty && !savedFlash && <span style={{color:'#ffb84d'}}>● Cambios sin guardar</span>}
          <a href="/menu" target="_blank" rel="noreferrer" style={{color:'#fff'}}>↗ Ver carta</a>
          <button onClick={reset} style={{color:'rgba(255,255,255,0.6)'}}>Reset</button>
          <button onClick={onLogout} style={{color:'rgba(255,255,255,0.6)'}}>Salir</button>
          <button onClick={() => exportDataJsx(data)} className="btn" style={{padding:'8px 14px', fontSize:11, background:'#fff', color:'var(--ink)'}}>⤓ Exportar data.jsx</button>
          <button onClick={save} className="btn red" style={{padding:'8px 14px', fontSize:11}}>Guardar</button>
        </div>
      </div>

      <div className="admin-grid">
        {/* Sidebar */}
        <aside className="admin-side">
          <button
            type="button"
            onClick={() => setView({ type: "general" })}
            className="admin-row"
            style={{
              marginBottom:6,
              background: view.type === "general" ? 'var(--ink)' : 'transparent',
              color: view.type === "general" ? 'var(--bg)' : 'var(--ink)',
              gridTemplateColumns: '24px 1fr',
              textAlign:'left'
            }}>
            <span className="n">⚙</span>
            <div className="nm">Ajustes generales</div>
          </button>

          <button
            type="button"
            onClick={() => setView({ type: "gallery" })}
            className="admin-row"
            style={{
              marginBottom:14,
              background: view.type === "gallery" ? 'var(--ink)' : 'transparent',
              color: view.type === "gallery" ? 'var(--bg)' : 'var(--ink)',
              gridTemplateColumns: '24px 1fr',
              textAlign:'left'
            }}>
            <span className="n">▦</span>
            <div className="nm">Galería del espacio</div>
          </button>

          {data.sections.map((sec) => (
            <div key={sec.id} style={{marginBottom:20}}>
              <div className="row between" style={{marginBottom:6, gap: 8}}>
                <button
                  type="button"
                  onClick={() => setView({ type: "section", id: sec.id })}
                  className="tiny link-hover"
                  style={{
                    color: view.type === 'section' && view.id === sec.id ? 'var(--red)' : 'rgba(255,0,30,0.55)',
                    textAlign: 'left'
                  }}>
                  {sec.title} ✎
                </button>
                <button onClick={() => addItem(sec.id)} className="tiny" style={{color:'var(--red)'}}>+ Añadir</button>
              </div>
              <div className="lst">
                {sec.items.map((it) => (
                  <div key={it.id}
                    className={`admin-row ${selectedId === it.id ? "active" : ""}`}
                    onClick={() => setSelectedId(it.id)}>
                    <span className="n">{String(it.n).padStart(2, "0")}</span>
                    <div>
                      <div className="nm">{it.name}</div>
                      {it.tags?.length > 0 && (
                        <div className="tg" style={{color: selectedId===it.id ? 'rgba(255,255,255,0.55)' : 'rgba(255,0,30,0.45)'}}>
                          {it.tags.join(" · ")}
                        </div>
                      )}
                    </div>
                    {it.featured && <span className="tiny" style={{color: selectedId===it.id ? '#fff' : 'var(--red)'}}>★</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Main editor */}
        <main className="admin-main">
          {view.type === "general" && (
            <GeneralSettings
              data={data}
              onHeader={updateHeader}
              onDisclaimer={(v) => updateData({ disclaimer: v })}
              onFooterLine={updateFooterLine}
            />
          )}
          {view.type === "gallery" && (
            <GalleryEditor data={data} setData={setData} setDirty={setDirty} />
          )}
          {view.type === "section" && (
            <SectionEditor
              section={data.sections.find(s => s.id === view.id)}
              onChange={(patch) => updateSection(view.id, patch)}
            />
          )}
          {view.type === "dish" && found && <DishEditor
            section={found.section}
            item={found.item}
            onChange={updateItem}
            onMove={moveItem}
            onDelete={deleteItem}
          />}
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// EXPORTADOR · genera un data.jsx descargable con el menú actual
// ─────────────────────────────────────────────────────────────
// Convierte el objeto `data` (el menú en vivo) en el texto de un
// archivo data.jsx idéntico en estructura al original, pero con el
// INITIAL_MENU actualizado. Así los cambios viajan en el código y
// funcionan en Netlify (no dependen ya de localStorage).

// Cuenta cuántas imágenes están incrustadas como data: (pesadas)
function countEmbeddedImages(data) {
  const hits = [];
  const walk = (obj, path) => {
    if (obj == null) return;
    if (typeof obj === "string") {
      if (obj.startsWith("data:")) hits.push(path);
      return;
    }
    if (Array.isArray(obj)) { obj.forEach((v, i) => walk(v, `${path}[${i}]`)); return; }
    if (typeof obj === "object") {
      Object.keys(obj).forEach(k => walk(obj[k], path ? `${path}.${k}` : k));
    }
  };
  walk(data, "");
  return hits;
}

function exportDataJsx(data) {
  // Avisar si hay imágenes incrustadas (data:) que harían el archivo enorme
  const embedded = countEmbeddedImages(data);
  if (embedded.length > 0) {
    const ok = confirm(
      `Atención: hay ${embedded.length} imagen(es) subida(s) desde el editor que están ` +
      `incrustadas en el menú (formato data:). Eso hará que data.jsx pese mucho y la web ` +
      `cargue lenta.\n\n` +
      `RECOMENDADO: guarda esas fotos como archivos en la carpeta img/ y en el editor ` +
      `referencia su ruta (ej: img/dumplings/miplato.png) en lugar de subirlas.\n\n` +
      `¿Exportar de todas formas (con las imágenes incrustadas)?`
    );
    if (!ok) return;
  }

  // Serializa el menú con indentación de 2 espacios (JSON válido)
  const body = JSON.stringify(data, null, 2);

  const fileText =
`// ─────────────────────────────────────────────────────────────
// CARTA DUM DUM™ — datos
// Generado por el editor (Exportar data.jsx). Esta es ahora la
// "fuente de la verdad". Reemplaza src/data.jsx por este archivo
// y súbelo a Netlify para publicar el menú actualizado.
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "dumdum.menu.v1";
const AUTH_KEY = "dumdum.admin.v1";

const INITIAL_MENU = ${body};

// ─── Persistencia ─────────────────────────────────────────────
function loadMenu() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return INITIAL_MENU;
}
function saveMenu(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function resetMenu() {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Auth (demo, no producción) ───────────────────────────────
const ADMIN_PASSWORD = "desobediencia";
function isLoggedIn() {
  return sessionStorage.getItem(AUTH_KEY) === "1";
}
function login(pw) {
  if (pw === ADMIN_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, "1");
    return true;
  }
  return false;
}
function logout() {
  sessionStorage.removeItem(AUTH_KEY);
}

// ─── Logos "incrustados" como SVG inline ──────────────────────
const PRESET_LOGOS = {
  kpop: \`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="#FF001E"/><text x="30" y="38" font-family="JetBrains Mono,monospace" font-weight="600" font-size="16" fill="#fff" text-anchor="middle" letter-spacing="-0.5">K-POP</text></svg>\`,
  cheese: \`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="#FFC700"/><text x="30" y="26" font-family="Space Grotesk,sans-serif" font-weight="700" font-size="11" fill="#ff001e" text-anchor="middle">CHEESE</text><text x="30" y="40" font-family="Space Grotesk,sans-serif" font-weight="700" font-size="11" fill="#ff001e" text-anchor="middle">BURGER</text><circle cx="14" cy="50" r="3" fill="#ff001e"/><circle cx="46" cy="14" r="3" fill="#ff001e"/></svg>\`,
  castizo: \`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="#ff001e"/><text x="30" y="28" font-family="Space Grotesk,sans-serif" font-style="italic" font-weight="500" font-size="14" fill="#fff" text-anchor="middle">Castizo</text><line x1="10" y1="34" x2="50" y2="34" stroke="#fff" stroke-width="0.5"/><text x="30" y="46" font-family="JetBrains Mono,monospace" font-size="6" fill="#fff" text-anchor="middle" letter-spacing="2">MADRID·1925</text></svg>\`,
  custom: null
};

// ─── Export global ────────────────────────────────────────────
window.DumDumData = {
  STORAGE_KEY, AUTH_KEY,
  INITIAL_MENU,
  loadMenu, saveMenu, resetMenu,
  isLoggedIn, login, logout,
  PRESET_LOGOS
};
`;

  // Descargar como archivo
  const blob = new Blob([fileText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.jsx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Comprime una imagen al subirla para no saturar localStorage.
//    Re-escala al lado mayor `maxDim` (preserva ratio) y exporta JPEG.
function compressImage(file, maxDim = 1400, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const { width, height } = img;
        const scale = Math.min(1, maxDim / Math.max(width, height));
        const w = Math.round(width * scale);
        const h = Math.round(height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const out = canvas.toDataURL("image/jpeg", quality);
        URL.revokeObjectURL(url);
        resolve(out);
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

// ── Editor de galería ─────────────────────────────────────────
function GalleryEditor({ data, setData, setDirty }) {
  const [tab, setTab] = React.useState("espacio");

  const update = (sectionId, photos) => {
    setData({ ...data, gallery: { ...(data.gallery || {}), [sectionId]: photos } });
    setDirty(true);
  };

  const tabs = [
    { id: "espacio", label: "Espacio", visible: 2, hasUrl: false, ratio: "4 / 3" },
    { id: "producto", label: "Producto", visible: 3, hasUrl: false, ratio: "4 / 3" },
    { id: "prensa", label: "Prensa", visible: 3, hasUrl: true, ratio: "2 / 3" },
    { id: "redes", label: "Redes", visible: 3, hasUrl: true, ratio: "9 / 16", video: true },
    { id: "universo", label: "Universo", visible: 1, hasUrl: false, ratio: "16 / 9", upload: "video" }
  ];
  const current = tabs.find(t => t.id === tab);
  const photos = (data.gallery && data.gallery[tab]) || [];
  const setPhotos = (next) => update(tab, next);

  const uploadAt = (i, file) => {
    if (!file) return;
    // Vídeo: lo guardamos tal cual (data URL). Imagen: comprimimos.
    if (current.upload === "video" || /^video\//.test(file.type)) {
      const reader = new FileReader();
      reader.onload = () => {
        const next = photos.map((p, j) => j === i ? { ...p, src: reader.result } : p);
        setPhotos(next);
      };
      reader.readAsDataURL(file);
      return;
    }
    compressImage(file, 1400, 0.85).then((dataUrl) => {
      const next = photos.map((p, j) => j === i ? { ...p, src: dataUrl } : p);
      setPhotos(next);
    }).catch((err) => {
      console.error("compressImage failed, fallback to raw", err);
      const reader = new FileReader();
      reader.onload = () => {
        const next = photos.map((p, j) => j === i ? { ...p, src: reader.result } : p);
        setPhotos(next);
      };
      reader.readAsDataURL(file);
    });
  };
  const updatePos = (i, pos) => setPhotos(photos.map((p, j) => j === i ? { ...p, pos } : p));
  const updateUrl = (i, url) => setPhotos(photos.map((p, j) => j === i ? { ...p, url } : p));
  const move = (i, dir) => {
    const ni = i + dir;
    if (ni < 0 || ni >= photos.length) return;
    const next = [...photos];
    [next[i], next[ni]] = [next[ni], next[i]];
    setPhotos(next);
  };
  const clearAt = (i) => setPhotos(photos.map((p, j) => j === i ? { ...p, src: null } : p));
  const removeAt = (i) => {
    if (!confirm("¿Eliminar este slot? Quedará una foto menos en la galería.")) return;
    setPhotos(photos.filter((_, j) => j !== i));
  };
  const addSlot = () => {
    const blank = current.video
      ? { url: "" }
      : current.upload === "video"
        ? { src: null }
        : { src: null, pos: "50% 50%", ...(current.hasUrl ? { url: "" } : {}) };
    setPhotos([...photos, blank]);
  };

  return (
    <div>
      <div className="tiny muted">Galería</div>
      <h2 style={{marginTop:4}}>Galería · {current.label}</h2>

      <div className="row gap-s" style={{margin: '12px 0 24px', flexWrap:'wrap'}}>
        {tabs.map(t => (
          <button key={t.id} type="button"
            onClick={() => setTab(t.id)}
            className="tiny"
            style={{
              padding: '6px 12px',
              border: '1px solid var(--red)',
              borderRadius: 999,
              background: tab === t.id ? 'var(--red)' : 'transparent',
              color: tab === t.id ? 'var(--bg)' : 'var(--red)',
              cursor: 'pointer'
            }}>
            {t.label} · {((data.gallery || {})[t.id] || []).length}
          </button>
        ))}
      </div>

      <p className="tiny muted" style={{marginBottom:18}}>
        {current.video
          ? "Pega la URL de un reel o post de Instagram. Se incrusta como iframe 9:16 reproducible en la web."
          : current.upload === "video"
            ? "Sube clips MP4 cortos (recomendado <10 MB cada uno) en formato 4:5. Se reproducen automáticamente, en silencio, en bucle."
            : "Arrastra dentro de cada foto para reencuadrarla."}
        {" "}En la web se ven {current.visible} a la vez.
      </p>

      <div style={{display:'grid', gridTemplateColumns: current.video ? 'repeat(auto-fill, minmax(180px, 1fr))' : 'repeat(auto-fill, minmax(220px, 1fr))', gap:20}}>
        {photos.map((p, i) => current.video ? (
          <ReelSlot
            key={i}
            item={p}
            index={i}
            onUrl={(url) => updateUrl(i, url)}
            onUp={() => move(i, -1)}
            onDown={() => move(i, 1)}
            onRemove={() => removeAt(i)}
          />
        ) : current.upload === "video" ? (
          <VideoSlot
            key={i}
            item={p}
            index={i}
            ratio={current.ratio}
            onUpload={(file) => uploadAt(i, file)}
            onClear={() => clearAt(i)}
            onUp={() => move(i, -1)}
            onDown={() => move(i, 1)}
            onRemove={() => removeAt(i)}
          />
        ) : (
          <PhotoCrop
            key={i}
            photo={p}
            index={i}
            ratio={current.ratio}
            onPos={(pos) => updatePos(i, pos)}
            onUp={() => move(i, -1)}
            onDown={() => move(i, 1)}
            onUpload={(file) => uploadAt(i, file)}
            onClear={() => clearAt(i)}
            onUrl={current.hasUrl ? (url => updateUrl(i, url)) : null}
            onRemove={() => removeAt(i)}
          />
        ))}
      </div>

      <div style={{marginTop:20}}>
        <button type="button" onClick={addSlot}
          className="tiny"
          style={{
            padding: '10px 16px',
            border: '1px dashed var(--red)',
            borderRadius: 6,
            background: 'transparent',
            color: 'var(--red)',
            cursor: 'pointer'
          }}>
          + Añadir {current.video ? "reel" : current.upload === "video" ? "vídeo" : "foto"}
        </button>
      </div>
    </div>
  );
}

// ── VideoSlot · subir un MP4 ──────────────────────────────────
function VideoSlot({ item, index, ratio = "4 / 5", onUpload, onClear, onUp, onDown, onRemove }) {
  const fileRef = React.useRef(null);
  return (
    <div>
      <div
        onClick={() => { if (!item.src) fileRef.current?.click(); }}
        style={{
          aspectRatio: ratio,
          width: '100%',
          background: 'var(--bg)',
          border: '1px solid var(--red)',
          borderRadius: 6,
          overflow: 'hidden',
          cursor: item.src ? 'default' : 'pointer',
          position: 'relative'
        }}>
        {item.src ? (
          <video
            src={item.src}
            controls
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{
            position:'absolute', inset:0,
            backgroundImage:'repeating-linear-gradient(45deg, rgba(255,0,30,0.06) 0 6px, transparent 6px 14px)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'var(--font-mono)', fontSize:11, color:'rgba(255,0,30,0.55)',
            textTransform: 'uppercase'
          }}>
            + Subir vídeo
          </div>
        )}
        <div style={{
          position:'absolute', top:6, left:6,
          background:'var(--ink)', color:'var(--bg)',
          fontFamily:'var(--font-mono)', fontSize:9, padding:'3px 6px', borderRadius:3,
          letterSpacing: 0
        }}>
          {String(index + 1).padStart(2, "0")}
        </div>
        <input ref={fileRef} type="file" accept="video/*" style={{display:'none'}}
          onChange={(e) => onUpload(e.target.files?.[0])} />
      </div>

      <div className="row gap-s" style={{marginTop:6, justifyContent:'space-between', flexWrap:'wrap'}}>
        <div className="row gap-s">
          <button className="tiny link-hover" onClick={onUp}>←</button>
          <button className="tiny link-hover" onClick={onDown}>→</button>
        </div>
        <div className="row gap-s">
          <button className="tiny link-hover" onClick={() => fileRef.current?.click()}>
            {item.src ? "↻ reemplazar" : "+ subir"}
          </button>
          {item.src && (
            <button className="tiny link-hover" onClick={onClear} style={{color:'var(--red)'}}>× quitar</button>
          )}
          {onRemove && (
            <button className="tiny link-hover" onClick={onRemove} style={{color:'var(--red)', borderLeft:'1px solid var(--line-soft)', paddingLeft:8, marginLeft:4}}>⌫ eliminar slot</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── ReelSlot · editor de un reel de Instagram ─────────────────
function ReelSlot({ item, index, onUrl, onUp, onDown, onRemove }) {
  const url = item.url || "";
  let embed = url.trim();
  if (embed && !embed.endsWith("/embed") && !embed.endsWith("/embed/")) {
    embed = embed.replace(/\/?$/, "/embed/");
  }
  return (
    <div>
      <div style={{
        aspectRatio: '9 / 16',
        width: '100%',
        background: 'var(--bg)',
        border: '1px solid var(--red)',
        borderRadius: 6,
        overflow: 'hidden',
        position: 'relative'
      }}>
        {url ? (
          <iframe
            src={embed}
            title={`Reel ${index + 1}`}
            style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
            allow="encrypted-media; picture-in-picture; clipboard-write"
            allowFullScreen
            scrolling="no" />
        ) : (
          <div style={{
            position:'absolute', inset:0,
            backgroundImage:'repeating-linear-gradient(45deg, rgba(255,0,30,0.06) 0 6px, transparent 6px 14px)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'var(--font-mono)', fontSize:11, color:'rgba(255,0,30,0.55)',
            textTransform: 'uppercase'
          }}>
            Pega la URL abajo
          </div>
        )}
        <div style={{
          position:'absolute', top:6, left:6,
          background:'var(--ink)', color:'var(--bg)',
          fontFamily:'var(--font-mono)', fontSize:9, padding:'3px 6px', borderRadius:3,
          letterSpacing: 0
        }}>
          {String(index + 1).padStart(2, "0")}
        </div>
      </div>
      <div className="row gap-s" style={{marginTop:6, justifyContent:'space-between'}}>
        <div className="row gap-s">
          <button className="tiny link-hover" onClick={onUp}>←</button>
          <button className="tiny link-hover" onClick={onDown}>→</button>
        </div>
        {onRemove && (
          <button className="tiny link-hover" onClick={onRemove} style={{color:'var(--red)'}}>⌫ eliminar</button>
        )}
      </div>
      <div style={{marginTop:8}}>
        <input
          type="url"
          value={url}
          onChange={(e) => onUrl(e.target.value)}
          placeholder="https://www.instagram.com/reel/XXX/"
          style={{
            width:'100%',
            fontFamily:'var(--font-mono)',
            fontSize:11,
            padding:'6px 8px',
            border:'1px solid var(--line-soft)',
            borderRadius:4,
            background:'var(--bg)',
            color:'var(--ink)'
          }} />
      </div>
    </div>
  );
}

function PhotoCrop({ photo, index, ratio = "4 / 3", onPos, onUp, onDown, onUpload, onClear, onUrl, onRemove }) {
  const ref = React.useRef(null);
  const fileRef = React.useRef(null);
  const [drag, setDrag] = React.useState(false);

  const parsePos = (s) => {
    const m = (s || "50% 50%").match(/([\d.]+)%\s+([\d.]+)%/);
    return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : { x: 50, y: 50 };
  };
  const [pos, setPos] = React.useState(() => parsePos(photo.pos));
  React.useEffect(() => { setPos(parsePos(photo.pos)); }, [photo.pos]);

  const onMouseDown = (e) => {
    if (!photo.src) return;
    e.preventDefault();
    setDrag(true);
    const start = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
    let latest = pos;
    const onMove = (ev) => {
      const rect = ref.current.getBoundingClientRect();
      const dx = (ev.clientX - start.x) / rect.width * 100;
      const dy = (ev.clientY - start.y) / rect.height * 100;
      const x = Math.max(0, Math.min(100, start.px - dx));
      const y = Math.max(0, Math.min(100, start.py - dy));
      latest = { x, y };
      setPos(latest);
    };
    const onUp = () => {
      setDrag(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      onPos(`${latest.x.toFixed(0)}% ${latest.y.toFixed(0)}%`);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const reset = () => {
    setPos({ x: 50, y: 50 });
    onPos("50% 50%");
  };

  return (
    <div>
      <div
        ref={ref}
        onMouseDown={onMouseDown}
        style={{
          aspectRatio: ratio,
          width: '100%',
          background: 'var(--bg)',
          border: '1px solid var(--red)',
          borderRadius: 6,
          overflow: 'hidden',
          cursor: photo.src ? (drag ? 'grabbing' : 'grab') : 'pointer',
          position: 'relative'
        }}
        onClick={() => { if (!photo.src) fileRef.current?.click(); }}>
        {photo.src ? (
          <img
            src={photo.src}
            alt=""
            draggable="false"
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover',
              objectPosition: `${pos.x}% ${pos.y}%`,
              display: 'block',
              pointerEvents: 'none'
            }} />
        ) : (
          <div style={{
            position:'absolute', inset:0,
            backgroundImage:'repeating-linear-gradient(45deg, rgba(255,0,30,0.06) 0 6px, transparent 6px 14px)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'var(--font-mono)', fontSize:11, color:'rgba(255,0,30,0.55)',
            textTransform: 'uppercase'
          }}>
            + Subir foto
          </div>
        )}
        <div style={{
          position:'absolute', top:6, left:6,
          background:'var(--ink)', color:'var(--bg)',
          fontFamily:'var(--font-mono)', fontSize:9, padding:'3px 6px', borderRadius:3,
          letterSpacing: 0
        }}>
          {String(index + 1).padStart(2, "0")}{photo.src ? ` · ${pos.x.toFixed(0)} / ${pos.y.toFixed(0)}` : ''}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}}
          onChange={(e) => onUpload(e.target.files?.[0])} />
      </div>

      <div className="row gap-s" style={{marginTop:6, justifyContent:'space-between', flexWrap:'wrap'}}>
        <div className="row gap-s">
          <button className="tiny link-hover" onClick={onUp}>←</button>
          <button className="tiny link-hover" onClick={onDown}>→</button>
        </div>
        <div className="row gap-s">
          <button className="tiny link-hover" onClick={() => fileRef.current?.click()}>
            {photo.src ? "↻ reemplazar" : "+ subir"}
          </button>
          {photo.src && (
            <>
              <button className="tiny link-hover" onClick={reset}>↺ centrar</button>
              <button className="tiny link-hover" onClick={onClear} style={{color:'var(--red)'}}>× quitar</button>
            </>
          )}
          {onRemove && (
            <button className="tiny link-hover" onClick={onRemove} style={{color:'var(--red)', borderLeft:'1px solid var(--line-soft)', paddingLeft:8, marginLeft:4}}>⌫ eliminar slot</button>
          )}
        </div>
      </div>

      {onUrl && (
        <div style={{marginTop:8}}>
          <input
            type="url"
            value={photo.url || ""}
            onChange={(e) => onUrl(e.target.value)}
            placeholder="https://..."
            style={{
              width:'100%',
              fontFamily:'var(--font-mono)',
              fontSize:11,
              padding:'6px 8px',
              border:'1px solid var(--line-soft)',
              borderRadius:4,
              background:'var(--bg)',
              color:'var(--ink)'
            }} />
        </div>
      )}
    </div>
  );
}

// ── Ajustes generales ─────────────────────────────────────────
function GeneralSettings({ data, onHeader, onDisclaimer, onFooterLine }) {
  const header = data.header || {};
  const footer = data.footer || [];
  return (
    <div>
      <div className="tiny muted">Edición global</div>
      <h2 style={{marginTop:4}}>Ajustes generales</h2>
      <p className="tiny muted" style={{marginBottom:24, marginTop:8}}>
        Textos que rodean la carta: cabecera, aviso del comensal y pie.
      </p>

      <div className="field">
        <label>Título de la carta (h1 grande)</label>
        <input type="text" value={header.title || ""} onChange={(e) => onHeader({ title: e.target.value })} placeholder="Carta" />
      </div>
      <div className="field">
        <label>Subtítulo · prefijo a "Actualizada {data.updated}"</label>
        <input type="text" value={header.subtitle || ""} onChange={(e) => onHeader({ subtitle: e.target.value })} placeholder="DUM DUM™ · Actualizada" />
      </div>
      <div className="row2">
        <div className="field">
          <label>Línea derecha · 1</label>
          <input type="text" value={header.sideLine1 || ""} onChange={(e) => onHeader({ sideLine1: e.target.value })} placeholder="6 uds / ración" />
        </div>
        <div className="field">
          <label>Línea derecha · 2</label>
          <input type="text" value={header.sideLine2 || ""} onChange={(e) => onHeader({ sideLine2: e.target.value })} placeholder="IVA incluido" />
        </div>
      </div>

      <hr style={{border:'none', borderTop:'1px solid var(--line-soft)', margin:'24px 0'}}/>

      <div className="field">
        <label>Aviso (solo mobile) — admite HTML como &lt;strong&gt; y &lt;br/&gt;</label>
        <textarea
          value={data.disclaimer || ""}
          onChange={(e) => onDisclaimer(e.target.value)}
          rows={5}
          style={{ minHeight: 120 }}
          placeholder="Cada ración son 6 dumplings…" />
      </div>

      <hr style={{border:'none', borderTop:'1px solid var(--line-soft)', margin:'24px 0'}}/>

      <div className="field">
        <label>Pie de carta (3 líneas) — la última suma la fecha "{data.updated}" al final automáticamente.</label>
        {[0,1,2].map(i => (
          <input key={i} type="text" value={footer[i] || ""} onChange={(e) => onFooterLine(i, e.target.value)} placeholder={`Línea ${i+1}`} style={{marginTop: i===0 ? 0 : 8}} />
        ))}
      </div>
    </div>
  );
}

// ── Section editor (título + nota) ────────────────────────────
function SectionEditor({ section, onChange }) {
  return (
    <div>
      <div className="tiny muted">Sección</div>
      <h2 style={{marginTop:4}}>{section.title || "(sin título)"}</h2>
      <p className="tiny muted" style={{marginTop:8, marginBottom:24}}>
        Aparece como cabecera de la sección en la carta. La nota se muestra a la derecha en mono rojo.
      </p>

      <div className="field">
        <label>Título de la sección</label>
        <input type="text" value={section.title || ""} onChange={(e) => onChange({ title: e.target.value })} placeholder="Dumplings" />
      </div>
      <div className="field">
        <label>Nota</label>
        <input type="text" value={section.note || ""} onChange={(e) => onChange({ note: e.target.value })} placeholder="6 unidades por ración. Al vapor." />
      </div>
    </div>
  );
}

// ── Editor de un plato ────────────────────────────────────────
function DishEditor({ section, item, onChange, onMove, onDelete }) {
  const set = (k, v) => onChange({ ...item, [k]: v });

  const toggleTag = (t) => {
    const tags = item.tags || [];
    const next = tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t];
    set("tags", next);
  };

  const uploadLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("logo", reader.result);
    reader.readAsDataURL(file);
  };

  const uploadImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("image", reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="tiny muted">{section.title} / Editando</div>
      <h2 style={{marginTop:4}}>{item.name || "(sin nombre)"}</h2>
      <div className="row gap-m" style={{marginTop:8, marginBottom:24}}>
        <button className="tiny link-hover" onClick={() => onMove(-1)}>↑ Mover arriba</button>
        <button className="tiny link-hover" onClick={() => onMove(1)}>↓ Mover abajo</button>
        <button className="tiny link-hover" onClick={onDelete} style={{color:'var(--red)'}}>× Eliminar</button>
      </div>

      <div className="row2">
        <div className="field">
          <label>Número</label>
          <input type="number" value={item.n || 0} onChange={(e) => set("n", parseInt(e.target.value) || 0)} />
        </div>
        <div className="field">
          <label>Precio (€)</label>
          <input type="text" value={item.price} onChange={(e) => set("price", e.target.value)} placeholder="9,50" />
        </div>
      </div>

      <div className="field">
        <label>Nombre del plato</label>
        <input type="text" value={item.name} onChange={(e) => set("name", e.target.value)} placeholder="Gamba K-Pop" />
      </div>

      <div className="field">
        <label>Tagline / subtítulo en mayúsculas</label>
        <input type="text" value={item.tagline || ""} onChange={(e) => set("tagline", e.target.value)} placeholder="EL NAMBER GUAN!" />
      </div>

      <div className="field">
        <label>Ingredientes</label>
        <textarea value={item.ingredients} onChange={(e) => set("ingredients", e.target.value)} placeholder="Dumpling de gamba, col, mayo kimchi." />
      </div>

      <div className="field">
        <label>Etiquetas</label>
        <div className="tag-picker">
          {TAG_OPTIONS.map(t => (
            <button key={t} type="button"
              onClick={() => toggleTag(t)}
              className={item.tags?.includes(t) ? "on" : ""}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Plato destacado (caja roja)</label>
        <button type="button"
          onClick={() => set("featured", !item.featured)}
          style={{
            padding:'10px 16px',
            border:'1px solid var(--red)',
            borderRadius:6,
            background: item.featured ? 'var(--red)' : 'var(--bg)',
            color: item.featured ? 'var(--bg)' : 'var(--red)',
            fontWeight:600,
            cursor:'pointer',
            width:'fit-content'
          }}>
          {item.featured ? "★ DESTACADO" : "Marcar como destacado"}
        </button>
        <div className="tiny muted" style={{marginTop:6}}>
          En mobile el plato se ve dentro de un bloque rojo con texto crema. En desktop la ficha se invierte.
        </div>
      </div>

      <div className="field">
        <label>Foto del plato (formato 4:5, solo desktop)</label>
        <div className="logo-up">
          <div className="lg-pv" style={{width: 96, height: 120}}>
            {item.image
              ? <img src={item.image} alt="" />
              : <span>Sin foto</span>}
          </div>
          <div>
            <label className="btn" style={{cursor:'pointer'}}>
              {item.image ? "Reemplazar foto…" : "Subir foto…"}
              <input type="file" accept="image/*" style={{display:'none'}} onChange={uploadImage} />
            </label>
            {item.image && (
              <button onClick={() => set("image", null)} className="tiny link-hover" style={{display:'block', marginTop:8, color:'var(--red)'}}>× Quitar foto</button>
            )}
            <div className="tiny muted" style={{marginTop:8}}>
              En mobile (QR) no se muestra · solo en desktop. Recortada 4:5.
            </div>
          </div>
        </div>

        {/* Alternativa recomendada: ruta a un archivo en img/ (mantiene data.jsx ligero) */}
        <div style={{marginTop:12, paddingTop:12, borderTop:'1px dotted var(--line-soft)'}}>
          <label style={{display:'block', marginBottom:6}}>…o escribe la ruta de la foto <span className="tiny muted">(recomendado · más ligero)</span></label>
          <input
            type="text"
            value={(typeof item.image === "string" && !item.image.startsWith("data:")) ? item.image : ""}
            onChange={(e) => set("image", e.target.value.trim() || null)}
            placeholder="img/dumplings/miplato.png"
          />
          <div className="tiny muted" style={{marginTop:6}}>
            Guarda la foto como archivo dentro de <b>img/dumplings/</b> y escribe aquí su ruta.
            Así <b>data.jsx</b> no engorda y la web carga rápido.
            {typeof item.image === "string" && item.image.startsWith("data:") &&
              <span style={{color:'var(--red)', display:'block', marginTop:4}}>⚠ Ahora hay una foto incrustada (pesada). Escribe una ruta aquí para sustituirla.</span>}
          </div>
        </div>
      </div>

      <div className="field">
        <label>Logo de producto (opcional)</label>
        <div className="row gap-m" style={{flexWrap:'wrap'}}>
          {PRESET_OPTIONS.map(p => (
            <button key={p.id || "none"} type="button"
              onClick={() => set("logo", p.id)}
              className={(item.logo === p.id) ? "tag-picker-on" : ""}
              style={{
                padding:'8px 12px',
                border:'1px solid var(--line)',
                borderRadius:4,
                fontFamily:'var(--font-mono)', fontSize:10,
                letterSpacing:'0.06em',
                background: item.logo === p.id ? 'var(--ink)' : 'var(--bg)',
                color: item.logo === p.id ? 'var(--bg)' : 'var(--ink)',
                cursor:'pointer'
              , fontWeight:600, textTransform:'uppercase'}}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="logo-up" style={{marginTop:12}}>
          <div className="lg-pv">
            {item.logo
              ? (typeof item.logo === "string" && item.logo.startsWith("data:")
                  ? <img src={item.logo} alt="" />
                  : <div dangerouslySetInnerHTML={{__html: window.DumDumData.PRESET_LOGOS[item.logo] || ""}} />)
              : <span>Sin logo</span>}
          </div>
          <div>
            <label className="btn" style={{cursor:'pointer'}}>
              Subir logo propio…
              <input type="file" accept="image/*" style={{display:'none'}} onChange={uploadLogo} />
            </label>
            <div className="tiny muted" style={{marginTop:8}}>
              PNG / SVG transparente. Se usará en formato 1:1.
            </div>
          </div>
        </div>
      </div>

      {/* Preview en vivo */}
      <div className="preview-card">
        <div className="lbl">Vista previa · como se verá en la carta</div>
        <article className={`dish ${item.logo ? "with-logo" : ""}`}>
          <div className="num">[nº{String(item.n).padStart(2, "0")}]</div>
          <div className="body">
            <div className="name-row">
              <span className="name">{item.name || "(sin nombre)"}</span>
              {item.tags?.map(t => <span key={t} className={`tag ${tagClass(t)}`}>{t}</span>)}
            </div>
            {item.tagline && <div className="tagline">{item.tagline}</div>}
            {item.ingredients && <div className="ingr">{item.ingredients}</div>}
          </div>
          {item.logo && <DishLogo logo={item.logo} />}
          <div className="price tnum">{item.price} €</div>
        </article>
      </div>
    </div>
  );
}

function findItem(data, id) {
  for (const sec of data.sections) {
    const it = sec.items.find(i => i.id === id);
    if (it) return { section: sec, item: it };
  }
  return null;
}

Object.assign(window, { Admin });
