import { useParams, Link } from "react-router-dom";
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

    // VERIFICANDO
    if (loading) {
        return (
            <main className="admin-page scan-page validar">
                <div className="scan-container">
                    <div className="scan-intro">

                        <h1 className="title">Verificando</h1>
                        <p>Estamos revisando esta entrada, un segundo...</p>
                    </div>

                    <div className="scan-status-pill" data-state="loading">
                        <span className="scan-status-dot" />
                        Buscando entrada
                    </div>
                </div>
            </main>
        );
    }

    // NO ENCONTRADA
    if (!rsvp) {
        return (
            <main className="admin-page scan-page validar">
                <div className="scan-container">
                    <div className="scan-intro">

                        <h1 className="title">No válida</h1>
                    </div>

                    <div className="scan-status-pill" data-state="error">
                        <span className="scan-status-dot" />
                        Entrada no encontrada
                    </div>

                    <div className="scan-error">
                        <strong>No pudimos verificarla</strong>
                        <p>Esta entrada no corresponde a este evento. Revisá el enlace o pedile al invitado que muestre su confirmación original.</p>
                    </div>
                </div>
            </main>
        );
    }

    // VÁLIDA — VISTA INVITADO
    if (!isAdmin) {
        return (
            <main className="admin-page scan-page validar">
                <div className="scan-container">
                    <div className="scan-intro">

                        <h1 className="title">Entrada válida</h1>
                        <p>Mostrale esta pantalla al organizador para ingresar.</p>
                    </div>

                    <div className="scan-status-pill" data-state="live">
                        <span className="scan-status-dot" />
                        Verificada
                    </div>
                </div>
            </main>
        );
    }

    // VISTA ADMIN
    return (
        <main className="admin-page scan-page validar">
            <div className="scan-container">
                <Link to={`/admin/${slug}`} className="top">Volver al panel</Link>

                <div className="scan-intro">

                    <h1 className="title">{rsvp.name}</h1>
                    <p>{rsvp.isOver18 === false ? "Menor de 18 años" : "Mayor de 18 años"}</p>
                </div>

                <div className="scan-status-pill" data-state={rsvp.checkedIn ? "live" : "loading"}>
                    {rsvp.checkedIn ? "Ya ingresó" : "Pendiente de ingreso"}
                </div>

                {rsvp.restriction && rsvp.restriction !== "Ninguna" && (
                    <div className="scan-restriccion" style={{ marginTop: 18 }}>
                        <strong>Restricción alimentaria</strong>
                        <p>
                            {rsvp.restriction}
                            {rsvp.allergy ? ` — ${rsvp.allergy}` : ""}
                            {rsvp.restriction === "Otra" && rsvp.detail ? ` — ${rsvp.detail}` : ""}
                        </p>
                    </div>
                )}

                <div className="scan-ok">
                    {rsvp.checkedIn ? (
                        <small>
                            Confirmó su llegada
                            {rsvp.checkedInAt ? ` a las ${new Date(rsvp.checkedInAt).toLocaleTimeString("es-AR")}` : ""}.
                        </small>
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

                    {justConfirmed && (
                        <small className="rsvp-checked-in">¡Listo, ingreso registrado!</small>
                    )}
                </div>

            </div>


        </main>
    );
}