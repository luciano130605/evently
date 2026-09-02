import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Check, Alert02Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";

import { loadInvitationBySlug, saveRsvp } from "../lib/invitations";

export default function ConfirmarAsistencia() {
    const { slug } = useParams();
    const [invitation, setInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        restriction: "Ninguna",
        allergy: "",
        detail: "",
        isOver18: true
    });

    useEffect(() => {
        let active = true;

        async function loadData() {
            const nextInvitation = await loadInvitationBySlug(slug);
            if (active) {
                setInvitation(nextInvitation);
                setLoading(false);
            }
        }

        loadData();

        return () => {
            active = false;
        };
    }, [slug]);

    const updateField = (field, value) => {
        setForm((current) => ({
            ...current,
            [field]: value
        }));
    };

    const fullName = [form.firstName, form.lastName].filter(Boolean).join(" ").trim();

    const submit = async (event) => {
        event.preventDefault();

        if (!form.firstName.trim() || !form.lastName.trim()) {
            setError("Completá nombre y apellido para confirmar tu asistencia.");
            return;
        }

        try {
            await saveRsvp(slug, {
                ...form,
                name: fullName
            });
            setError("");
            setSent(true);
        } catch (submitError) {
            setSent(false);
            setError(submitError.message || "No se pudo guardar tu confirmación.");
        }
    };

    if (loading) {
        return (
            <main className="center-page">
                <h1>Cargando confirmación...</h1>
            </main>
        );
    }

    if (!invitation) {
        return (
            <main className="center-page">
                <h1>Invitación no encontrada</h1>
                <Link to="/" className="primary-button">Volver al inicio</Link>
            </main>
        );
    }

    if (sent) {
        return (
            <main className="confirm-page">
                <section className="confirm-card success-card">
                    <div className="success-icon">
                        <HugeiconsIcon icon={Check} size={28} />
                    </div>
                    <span className="section-kicker">CONFIRMACIÓN</span>
                    <h1>¡Listo!</h1>
                    <p>Gracias {fullName}, tu asistencia quedó confirmada para {invitation.name}.</p>
                   
                </section>
            </main>
        );
    }

    return (
        <main className="confirm-page">
            <section className="confirm-card">
              
                <span className="section-kicker">CONFIRMAR ASISTENCIA</span>
                <h1>{invitation.name}</h1>
                <p className="confirm-subtitle">Completá tus datos para confirmar tu presencia.</p>

                {error && (
                    <div className="rsvp-error confirm-error">
                        <div className="error-icon"><HugeiconsIcon icon={Alert02Icon} size={22} /></div>
                        <p>{error}</p>
                        <button type="button" className="primary-button full" onClick={() => setError("")}>
                            Intentar de nuevo
                        </button>
                    </div>
                )}

                {!error && (
                    <form className="rsvp-form" onSubmit={submit}>
                        <div className="form-field">
                            <label>Nombre</label>
                            <input
                                type="text"
                                placeholder="Tu nombre"
                                value={form.firstName}
                                onChange={(event) => updateField("firstName", event.target.value)}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label>Apellido</label>
                            <input
                                type="text"
                                placeholder="Tu apellido"
                                value={form.lastName}
                                onChange={(event) => updateField("lastName", event.target.value)}
                                required
                            />
                        </div>

                        {Boolean(invitation.requireAgeConfirmation) && (
                            <div className="form-field">
                                <label>¿Sos mayor de 18 años?</label>
                                <div className="age-toggle" role="tablist" aria-label="Mayor de edad">
                                    <button
                                        type="button"
                                        className={`age-toggle-option ${form.isOver18 ? "active-c" : ""}`}
                                        onClick={() => updateField("isOver18", true)}
                                    >
                                        Sí
                                    </button>
                                    <button
                                        type="button"
                                        className={`age-toggle-option ${!form.isOver18 ? "active-c" : ""}`}
                                        onClick={() => updateField("isOver18", false)}
                                    >
                                        No
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="form-field">
                            <label>Restricciones alimentarias</label>
                            <select
                                value={form.restriction}
                                onChange={(event) => updateField("restriction", event.target.value)}
                            >
                                <option>Ninguna</option>
                                <option>Vegetariano</option>
                                <option>Vegano</option>
                                <option>Celíaco</option>
                                <option>Alergia</option>
                                <option>Otra</option>
                            </select>
                        </div>

                        {form.restriction === "Alergia" && (
                            <div className="form-field">
                                <label>¿Cuál alergia tenés?</label>
                                <input
                                    type="text"
                                    placeholder="Por ejemplo: maní, frutos secos"
                                    value={form.allergy}
                                    onChange={(event) => updateField("allergy", event.target.value)}
                                    required
                                />
                            </div>
                        )}

                        {form.restriction === "Otra" && (
                            <div className="form-field">
                                <label>Datos adicionales</label>
                                <textarea
                                    placeholder="Contanos si hay algo que debamos saber..."
                                    value={form.detail}
                                    onChange={(event) => updateField("detail", event.target.value)}
                                />
                            </div>
                        )}

                        <button className="primary-button full" type="submit">
                            Confirmar asistencia
                        </button>
                    </form>
                )}
            </section>
        </main>
    );
}
