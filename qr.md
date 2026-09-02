# Sistema de entradas digitales con QR y check-in en el evento

Plan completo: qué se agrega al modelo de datos, qué componentes/rutas nuevas hacen falta, y el paso a paso para dejarlo funcional.

---

## 1. Resumen del flujo

1. Al **crear** la invitación, el organizador activa un toggle: *"Enviar entrada con QR"*.
2. Si está activo, cuando un invitado confirma asistencia en el **RSVPForm**, se le pide **email o WhatsApp**.
3. Al confirmar, se genera un **ticket único** para ese invitado (token random) y una página tipo `EntradaDemo` pero con sus datos reales (nombre, si es mayor/menor, fecha, lugar, dress code) + un QR.
4. Esa entrada se comparte por mail o WhatsApp (el invitado la recibe o la reenvía).
5. El día del evento, el **admin** entra a un modo "Escanear" en el panel, lee el QR con la cámara del celu, ve los datos del invitado (nombre / mayor o menor / alergia) y toca **"Confirmar llegada"**.
6. En las stats del admin aparecen dos números separados: **Anotados** (RSVP confirmado) y **Asistencia** (efectivamente llegaron y se escaneó su QR).

---

## 2. Modelo de datos — qué se agrega

### 2.1 Invitación (lo que ya arma `form` en `Crear.jsx` y guarda `saveInvitation`)

| Campo | Tipo | Descripción |
|---|---|---|
| `sendQr` | boolean | Si está en `true`, se activa todo el flujo de entrada + QR. Default `false`. No es obligatorio, no se agrega a `requiredFields`. |

### 2.2 RSVP (lo que guarda `RSVPForm` al confirmar)

| Campo | Tipo | Descripción |
|---|---|---|
| `contactEmail` | string \| null | Email del invitado. Solo se pide si `sendQr` está activo. |
| `contactPhone` | string \| null | WhatsApp del invitado. Alternativa al email (podés pedir uno de los dos, no ambos). |
| `ticketToken` | string | Identificador único, random, no adivinable (16-20 caracteres, tipo nanoid). **Esto es lo que va en el QR, nunca el nombre ni un índice.** Se genera solo si `sendQr` es `true`. |
| `checkedIn` | boolean | Default `false`. Pasa a `true` cuando el admin confirma la llegada escaneando el QR. |
| `checkedInAt` | timestamp \| null | Se completa en el momento del check-in. |

> **Por qué `ticketToken` random y no un índice o el nombre:** si el QR codificara `slug + índice de invitado`, cualquiera podría cambiar el número en la URL y ver o "confirmar" la entrada de otra persona. Un token random largo generado en el momento del RSVP evita eso — es la misma lógica que un link de restablecer contraseña.

---

## 3. Rutas y componentes nuevos

| Ruta / Componente | Qué hace |
|---|---|
| `Crear.jsx` (editar) | Agrega el toggle `sendQr` en una fieldset nueva o dentro de una existente. |
| `RSVPForm.jsx` (editar) | Si `sendQr` es `true`, muestra el campo de contacto (email o WhatsApp) antes de confirmar. |
| `lib/invitations.js` (editar) | Al guardar el RSVP, si `sendQr` es `true`: generar `ticketToken`, guardar `checkedIn: false`. Agregar función `checkInRsvp(slug, ticketToken)` que marca `checkedIn: true` y `checkedInAt`. |
| `Entrada.jsx` (nuevo, reemplaza el rol de `EntradaDemo.jsx` para casos reales) | Ruta `/entrada/:slug/:ticketToken`. Busca la invitación y el RSVP por token, arma la vista tipo "entrada digital" con los datos reales y el QR (el QR codifica la URL de **validación**, no la de la propia entrada). |
| `Validar.jsx` (nuevo) | Ruta `/validar/:slug/:ticketToken`. Es la página a la que apunta el QR. Si no hay sesión de admin, muestra solo "Entrada válida" sin datos personales. Si hay sesión de admin (mismo `sessionStorage` que ya usa `Admin.jsx`), muestra nombre / mayor-menor / alergia y el botón "Confirmar llegada". |
| `Escanear.jsx` (nuevo) | Ruta `/admin/:slug/escanear`. Usa la cámara para leer el QR (librería `html5-qrcode` o `@zxing/browser`) y redirige a `/validar/:slug/:ticketToken` apenas detecta un código. |
| `Admin.jsx` (editar) | Agrega botón "Escanear entradas" que lleva a `/admin/:slug/escanear`. Agrega stat nueva "Asistencia" (`checkedIn === true`) separada de "Anotados" (total de RSVPs). Agrega badge/tilde en cada fila de la lista si `checkedIn` es `true`, y botón "Ver entrada" por invitado (por si hay que reenviarla). |

---

## 4. Paso a paso de implementación

### Paso 1 — Toggle en Crear

En `Crear.jsx`, agregar al estado inicial del `form`:

```jsx
sendQr: false,
```

Y en el JSX, una fieldset nueva (por ejemplo después de "06 · REGALOS"):

```jsx
<fieldset>
    <legend>08 · ENTRADA DIGITAL</legend>

    <label className="checkbox-row">
        <input
            type="checkbox"
            checked={Boolean(form.sendQr)}
            onChange={(event) => update("sendQr", event.target.checked)}
        />
        <span>Enviar entrada digital con QR a los invitados</span>
    </label>

    <small>
        Si lo activás, al confirmar asistencia se le va a pedir el email o WhatsApp
        al invitado para mandarle su entrada con QR. El día del evento vas a poder
        escanearlo desde el panel de admin para registrar quién llegó.
    </small>
</fieldset>
```

No hace falta tocar `requiredFields` ni `isRequiredFormComplete`: es opcional.

---

### Paso 2 — Generar el token al confirmar

En `lib/invitations.js`, agregar una función para generar el token (no hace falta instalar `nanoid`, alcanza con algo simple basado en `crypto`):

```js
export function generateTicketToken() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID().replace(/-/g, "");
    }
    // fallback simple
    return Array.from({ length: 24 }, () =>
        "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]
    ).join("");
}
```

Y en la función que ya usás para guardar un RSVP (la que llama `RSVPForm` al confirmar), sumar la lógica:

```js
export async function saveRsvp(slug, rsvpData, { sendQr } = {}) {
    const payload = {
        ...rsvpData,
        createdAt: new Date().toISOString(),
        checkedIn: false,
        checkedInAt: null
    };

    if (sendQr) {
        payload.ticketToken = generateTicketToken();
        payload.contactEmail = rsvpData.contactEmail || null;
        payload.contactPhone = rsvpData.contactPhone || null;
    }

    // ... el resto de la lógica existente para guardar en tu storage/backend
    return payload; // devolvés el rsvp guardado para poder armar el link de la entrada
}
```

Agregar también la función de check-in:

```js
export async function checkInRsvp(slug, ticketToken) {
    // buscar el rsvp por slug + ticketToken, actualizar:
    // checkedIn: true, checkedInAt: new Date().toISOString()
    // devolver el rsvp actualizado (o null si no se encontró / ya estaba marcado)
}

export async function findRsvpByToken(slug, ticketToken) {
    // buscar y devolver el rsvp que matchea slug + ticketToken, o null
}
```

> Adaptá estos dos según cómo esté guardando/leyendo `loadRsvpsBySlug` hoy (localStorage, API propia, Supabase, etc.) — la firma de las funciones es lo importante, la implementación interna depende de tu backend actual.

---

### Paso 3 — Pedir contacto en el RSVPForm

`Invitacion.jsx` ya renderiza `<RSVPForm slug={slug} name={invitation.name} requireAgeConfirmation={...} isFull={...} />`. Sumar la prop:

```jsx
<RSVPForm
    slug={slug}
    name={invitation.name}
    requireAgeConfirmation={Boolean(invitation.requireAgeConfirmation)}
    isFull={Boolean(invitation.maxGuests) && confirmedCount >= Number(invitation.maxGuests)}
    sendQr={Boolean(invitation.sendQr)}
/>
```

Dentro de `RSVPForm.jsx` (no incluido en lo que pegaste, pero el patrón es igual al resto del form): agregar un estado `contactMethod` ("email" | "whatsapp") y un input condicionado a `sendQr`:

```jsx
{sendQr && (
    <div className="rsvp-contact">
        <label>
            <div>¿Cómo querés recibir tu entrada? *</div>
            <select value={contactMethod} onChange={(e) => setContactMethod(e.target.value)}>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
            </select>
        </label>

        <label>
            <input
                type={contactMethod === "email" ? "email" : "tel"}
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={contactMethod === "email" ? "tu@email.com" : "+54 9 11 ..."}
                required
            />
        </label>
    </div>
)}
```

Al hacer submit, armar el `rsvpData` incluyendo `contactEmail`/`contactPhone` según corresponda, y llamar a `saveRsvp(slug, rsvpData, { sendQr })`.

Después de guardar, si `sendQr` es `true`, mostrar en pantalla (en vez de solo un mensaje de "confirmado") un bloque con el link a la entrada y los dos botones de compartir:

```jsx
const ticketUrl = `${window.location.origin}/entrada/${slug}/${savedRsvp.ticketToken}`;

<div className="rsvp-ticket-share">
    <p>¡Confirmado! Guardá o enviá tu entrada:</p>

    <a
        href={`mailto:?subject=${encodeURIComponent("Tu entrada")}&body=${encodeURIComponent(ticketUrl)}`}
        className="secondary-button"
    >
        Enviar por email
    </a>

    <a
        href={`https://wa.me/?text=${encodeURIComponent(`Acá está tu entrada: ${ticketUrl}`)}`}
        target="_blank"
        rel="noreferrer"
        className="secondary-button"
    >
        Enviar por WhatsApp
    </a>

    <Link to={`/entrada/${slug}/${savedRsvp.ticketToken}`} className="primary-button">
        Ver mi entrada
    </Link>
</div>
```

Esta es la versión **"nivel simple"**: no hay envío automático desde el servidor, el invitado dispara el mail/WhatsApp desde su propio dispositivo con el link ya armado. Ver Paso 8 para la versión automática.

---

### Paso 4 — Página de la entrada real (`Entrada.jsx`)

Nuevo archivo, adaptando la estructura visual de `EntradaDemo.jsx` pero con datos dinámicos:

```jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon, Clock01Icon, PinLocation03Icon, TieIcon, LinkCircleIcon } from "@hugeicons/core-free-icons";
import { loadInvitationBySlug, findRsvpByToken } from "../lib/invitations";
import "./EntradaDemo.css";

export default function Entrada() {
    const { slug, ticketToken } = useParams();
    const [invitation, setInvitation] = useState(null);
    const [rsvp, setRsvp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let active = true;

        async function load() {
            const inv = await loadInvitationBySlug(slug);
            const foundRsvp = inv ? await findRsvpByToken(slug, ticketToken) : null;

            if (!active) return;

            if (!inv || !foundRsvp) {
                setNotFound(true);
            } else {
                setInvitation(inv);
                setRsvp(foundRsvp);
            }

            setLoading(false);
        }

        load();
        return () => { active = false; };
    }, [slug, ticketToken]);

    if (loading) return <main className="center-page"><h1>Cargando entrada...</h1></main>;
    if (notFound) return <main className="center-page"><h1>Entrada no encontrada</h1></main>;

    const validationUrl = `${window.location.origin}/validar/${slug}/${ticketToken}`;

    return (
        <main className="entry-page">
            <div className="entry-background" />
            <section className="entry-container">
                <article className="entry-card">
                    <div className="entry-card-top">
                        <span className="entry-kicker">ENTRADA DIGITAL</span>
                        <div className="entry-event">
                            <p className="entry-event-type">{invitation.eventType || "Evento"}</p>
                            <h1>{invitation.name}</h1>
                        </div>
                    </div>

                    <div className="entry-guest">
                        <span className="entry-label">INVITADO</span>
                        <h2>{rsvp.name}</h2>
                        <p>Esta entrada es personal e intransferible.</p>
                    </div>

                    <div className="entry-details">
                        <div className="entry-detail">
                            <div className="entry-detail-icon"><HugeiconsIcon icon={Calendar03Icon} size={21} /></div>
                            <div>
                                <span>FECHA</span>
                                <strong>{invitation.date}</strong>
                            </div>
                        </div>

                        <div className="entry-detail">
                            <div className="entry-detail-icon"><HugeiconsIcon icon={Clock01Icon} size={21} /></div>
                            <div>
                                <span>HORARIO</span>
                                <strong>{invitation.timeStart}{invitation.timeEnd ? ` — ${invitation.timeEnd}` : ""} hs</strong>
                            </div>
                        </div>
                    </div>

                    <div className="entry-location">
                        <div className="entry-location-icon"><HugeiconsIcon icon={PinLocation03Icon} size={23} /></div>
                        <div className="entry-location-content">
                            <span>¿DÓNDE ES?</span>
                            <h3>{invitation.venue || "Salón"}</h3>
                            <p>{invitation.address}</p>
                            {invitation.mapsUrl && (
                                <a href={invitation.mapsUrl} target="_blank" rel="noreferrer" className="entry-map-link">
                                    Cómo llegar <HugeiconsIcon icon={LinkCircleIcon} size={13} />
                                </a>
                            )}
                        </div>
                    </div>

                    {invitation.showDressCode && (
                        <div className="entry-dress">
                            <div className="entry-dress-icon"><HugeiconsIcon icon={TieIcon} size={22} /></div>
                            <div>
                                <span>DRESS CODE</span>
                                <h3>{invitation.dressCode}</h3>
                                <p>{invitation.dressDescription}</p>
                            </div>
                        </div>
                    )}

                    <div className="entry-divider"><span /></div>

                    <div className="entry-access">
                        <div className="entry-access-header">
                            <div>
                                <span>ACCESO</span>
                                <h3>Presentá esta entrada</h3>
                            </div>
                        </div>

                        <div className="entry-qr">
                            <div className="entry-qr-frame">
                                <QRCodeSVG
                                    value={validationUrl}
                                    size={180}
                                    bgColor="var(--surface)"
                                    fgColor="var(--purple)"
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>
                            <p>Mostrá este código al ingresar al evento.</p>
                        </div>
                    </div>
                </article>

                <footer className="entry-footer">
                    <p>Esta entrada fue generada con <strong>evently</strong></p>
                    <Link to="/">Crear mi invitación</Link>
                </footer>
            </section>
        </main>
    );
}
```

**Punto clave:** el QR codifica `validationUrl` (`/validar/...`), no la URL de la propia entrada. Así, quien escanea (el admin) llega directo a la pantalla de check-in.

---

### Paso 5 — Página de validación (`Validar.jsx`)

```jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { findRsvpByToken, checkInRsvp } from "../lib/invitations";

export default function Validar() {
    const { slug, ticketToken } = useParams();
    const [rsvp, setRsvp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [justConfirmed, setJustConfirmed] = useState(false);

    const isAdmin = typeof window !== "undefined" &&
        window.sessionStorage.getItem(`mis15_admin_auth_${slug}`) === "true";

    useEffect(() => {
        let active = true;

        async function load() {
            const found = await findRsvpByToken(slug, ticketToken);
            if (active) {
                setRsvp(found);
                setLoading(false);
            }
        }

        load();
        return () => { active = false; };
    }, [slug, ticketToken]);

    const confirmArrival = async () => {
        setConfirming(true);
        const updated = await checkInRsvp(slug, ticketToken);
        setRsvp(updated);
        setJustConfirmed(true);
        setConfirming(false);
    };

    if (loading) return <main className="center-page"><h1>Verificando...</h1></main>;

    if (!rsvp) {
        return (
            <main className="center-page">
                <h1>Entrada no válida</h1>
                <p>No encontramos esta entrada para este evento.</p>
            </main>
        );
    }

    // Vista pública (sin sesión de admin): solo confirma que el QR es válido, sin datos personales.
    if (!isAdmin) {
        return (
            <main className="center-page">
                <h1>Entrada válida ✓</h1>
                <p>Mostrale esta pantalla al organizador para ingresar.</p>
            </main>
        );
    }

    // Vista del admin: acá sí se ven los datos y se puede confirmar la llegada.
    return (
        <main className="center-page admin-validation">
            <h1>{rsvp.name}</h1>

            <p>{rsvp.isOver18 === false ? "Menor de 18" : "Mayor de 18"}</p>

            {rsvp.restriction && rsvp.restriction !== "Ninguna" && (
                <p>Restricción: {rsvp.restriction}{rsvp.allergy ? ` — ${rsvp.allergy}` : ""}</p>
            )}

            {rsvp.checkedIn ? (
                <p className="already-checked-in">
                    Ya había confirmado su llegada
                    {rsvp.checkedInAt ? ` a las ${new Date(rsvp.checkedInAt).toLocaleTimeString("es-AR")}` : ""}.
                </p>
            ) : (
                <button
                    type="button"
                    className="primary-button full"
                    onClick={confirmArrival}
                    disabled={confirming}
                >
                    {confirming ? "Confirmando..." : "Confirmar llegada"}
                </button>
            )}

            {justConfirmed && <p className="success-message">¡Listo, ingreso registrado!</p>}
        </main>
    );
}
```

---

### Paso 6 — Escáner en el Admin (`Escanear.jsx`)

Instalar una librería de lectura de QR por cámara:

```bash
npm install html5-qrcode
```

```jsx
import { useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";

export default function Escanear() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const scannerRef = useRef(null);

    useEffect(() => {
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        scanner
            .start(
                { facingMode: "environment" },
                { fps: 10, qrbox: 250 },
                (decodedText) => {
                    // decodedText es la validationUrl completa: /validar/slug/token
                    scanner.stop().then(() => {
                        try {
                            const url = new URL(decodedText);
                            navigate(url.pathname);
                        } catch {
                            navigate(decodedText);
                        }
                    });
                },
                () => {} // errores de lectura frame a frame, se ignoran
            )
            .catch((err) => console.error("No se pudo iniciar la cámara", err));

        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {});
            }
        };
    }, [navigate]);

    return (
        <main className="admin-page">
            <header className="admin-header">
                <Link to={`/admin/${slug}`}>Volver</Link>
                <span className="brand">evently</span>
            </header>

            <div className="scan-page">
                <h1>Escanear entrada</h1>
                <p>Apuntá la cámara al QR de la entrada del invitado.</p>
                <div id="qr-reader" style={{ width: "100%", maxWidth: 400, margin: "0 auto" }} />
            </div>
        </main>
    );
}
```

Agregar la ruta en el router principal (`App.jsx` o donde tengas las `<Route>`):

```jsx
<Route path="/entrada/:slug/:ticketToken" element={<Entrada />} />
<Route path="/validar/:slug/:ticketToken" element={<Validar />} />
<Route path="/admin/:slug/escanear" element={<Escanear />} />
```

---

### Paso 7 — Stats de asistencia en el Admin

En `Admin.jsx`, la función `getRsvpStats` ya calcula `total`, `adults`, `restrictions`, `allergies` a partir de `visibleRsvps`. Sumarle el cálculo de asistencia (puede ir donde se llama, sin tocar la función si no querés modificar `lib/invitations.js`):

```jsx
const checkedInCount = visibleRsvps.filter((r) => r.checkedIn).length;
```

Y agregar un stat más, junto a los existentes:

```jsx
<div className="admin-stat">
    <div className="admin-stat-icon">
        <HugeiconsIcon icon={UserGroup02Icon} size={18} />
    </div>

    <div style={{ display: "flex", alignItems: "end", gap: 10 }}>
        <strong>{checkedInCount} / {stats.total}</strong>
        <span style={{ marginBottom: 5 }}>ASISTENCIA</span>
    </div>
</div>
```

Botón para ir al escáner, junto a los otros botones del header del admin:

```jsx
<Link className="secondary-button" to={`/admin/${slug}/escanear`}>
    Escanear entradas
</Link>
```

En cada fila de `rsvp-admin-row`, un indicador de si ya llegó:

```jsx
{rsvp.checkedIn && (
    <small className="rsvp-checked-in">✓ Llegó {rsvp.checkedInAt ? `a las ${new Date(rsvp.checkedInAt).toLocaleTimeString("es-AR")}` : ""}</small>
)}
```

---

### Paso 8 — (Opcional, después) Envío automático por email

Si más adelante querés que el email salga solo (sin que el invitado toque "Enviar por email"), se agrega una **serverless function** de Vercel:

- `api/send-ticket.js`: recibe `{ slug, ticketToken, contactEmail }`, arma el `ticketUrl` y llama a un proveedor tipo **Resend** (`npm install resend`, con `RESEND_API_KEY` en las variables de entorno de Vercel).
- Se dispara desde `RSVPForm` justo después de guardar el RSVP exitosamente, con un `fetch("/api/send-ticket", { method: "POST", body: JSON.stringify({...}) })`.

WhatsApp automático es más complejo (requiere WhatsApp Business API vía Twilio, aprobación de plantillas de mensaje, número verificado) — conviene dejarlo en modo "compartir manual" (el botón `wa.me` del Paso 3) hasta que valga la pena automatizarlo.

---

## 5. Orden recomendado para construirlo

1. Modelo de datos: `sendQr` en invitación, `ticketToken` / `checkedIn` / `checkedInAt` / contacto en RSVP.
2. Toggle en Crear (Paso 1).
3. Funciones en `lib/invitations.js`: `generateTicketToken`, `saveRsvp` actualizado, `checkInRsvp`, `findRsvpByToken` (Paso 2).
4. Campo de contacto + pantalla de "compartir entrada" en RSVPForm (Paso 3).
5. Página `/entrada/:slug/:ticketToken` (Paso 4) — en este punto ya podés probar el flujo de punta a punta manualmente (confirmar → ver entrada → ver QR).
6. Página `/validar/:slug/:ticketToken` (Paso 5).
7. Escáner con cámara en el admin (Paso 6).
8. Stats de asistencia + badges (Paso 7).
9. Opcional: envío automático por email (Paso 8).

## 6. Cosas a tener en cuenta

- **Seguridad del check-in:** la vista de validación diferencia admin logueado vs público, así que aunque alguien intercepte o comparta el link `/validar/...`, sin sesión de admin no ve datos personales ni puede confirmar llegada.
- **Doble escaneo:** ya contemplado — si `checkedIn` ya es `true`, se avisa en vez de sobreescribir.
- **Invitaciones sin QR activado:** si `sendQr` es `false`, todo este flujo no se muestra ni en el RSVP ni en el admin; el check-in manual (tocando la fila) queda como mejora futura si hace falta.
- **HTTPS y permisos de cámara:** `html5-qrcode` necesita contexto seguro (HTTPS) para pedir permiso de cámara — en Vercel esto ya viene por default, no requiere configuración extra.