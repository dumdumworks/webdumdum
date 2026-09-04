# Panel de carta en /admin — montaje (Fase 1)

Guía para conectar el nuevo editor de carta. Lo que hace Claude (código) ya está
en la rama `feat/admin-carta`. Lo de aquí lo haces **tú** en el panel de
Cloudflare (son clics, no código). Cuando termines los pasos 1–3, avísame.

## Qué estamos montando

- La carta se guarda en **Cloudflare KV** (base de datos) y las fotos en **R2**.
- Tu web la lee **en vivo** vía las funciones de `functions/` → editar es
  **instantáneo, sin build**.
- **Red de seguridad:** si KV o R2 aún no existen, la web sigue sirviendo tu
  carta actual (copia del build). No se rompe nada por desplegar antes de tiempo.

## Paso 1 · Base de datos de la carta (KV)

1. Cloudflare → **Workers & Pages** → pestaña **KV** → **Create a namespace**.
   Nombre: `dumdum-menu`.
2. Ve a tu proyecto **Workers & Pages → webdumdum → Settings → Bindings**
   (o "Functions" → "KV namespace bindings").
3. **Add binding**:
   - Variable name: **`MENU`**  ← exactamente así, en mayúsculas.
   - KV namespace: `dumdum-menu`.
   - Aplícalo al entorno **Production**.

> No hace falta "rellenar" la base a mano: la primera vez que guardes en el
> panel, la carta se escribe en KV. Hasta entonces, la web usa el respaldo.

## Paso 2 · Almacén de fotos (R2)

1. Cloudflare → **R2** → **Create bucket**. Nombre: `dumdum-fotos`.
2. Proyecto **webdumdum → Settings → Bindings** → **Add binding** → **R2 bucket**:
   - Variable name: **`PHOTOS`**  ← exactamente así.
   - Bucket: `dumdum-fotos`.
   - Entorno **Production**.

## Paso 3 · Login del panel (Cloudflare Access)

Para que solo entres tú a `/admin` (y nadie pueda tocar la carta):

1. Cloudflare → **Zero Trust** → **Access** → **Applications** → **Add an
   application** → **Self-hosted**.
2. Application name: `DUM DUM admin`.
3. **Application domain**: añade dos rutas del dominio `dum-dum.es`:
   - `dum-dum.es` / `admin`
   - `dum-dum.es` / `api`
   (Mientras probamos usaremos `/panel` en vez de `/admin`; te aviso del cambio.)
4. **Policy**: Action **Allow**, e Include → **Emails** → tu correo
   (`yerai87@gmail.com`). Así solo tú entras (por email con código).

## Paso 4 · Desplegar (cuando te avise)

El editor (`/panel`) lo estoy terminando. Cuando esté:
1. Publicas la rama `feat/admin-carta` y la mergeas (como siempre, GitHub Desktop).
2. Cloudflare despliega. Entras a la ruta del panel, te pide login (Access),
   editas un plato, **Guardar** → sale en la web en segundos.
3. Cuando funcione, movemos el panel a `/admin` y jubilamos Sveltia.

## Si algo va mal

- La web pública **nunca** se queda sin carta: si KV falla, sirve el respaldo
  del build (`/menu.base.json`).
- Para volver atrás del todo: revertir el merge de `feat/admin-carta` deja la web
  exactamente como estaba (Sveltia incluido).
