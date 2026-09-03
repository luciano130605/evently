import { useState } from "react";
import { Link } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import { Check, Alert02Icon } from "@hugeicons/core-free-icons";

import { saveRsvp } from "../lib/invitations";


export default function RSVPForm({ slug, name, requireAgeConfirmation = false, sendQr = false }) {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        restriction: "Ninguna",
        allergy: "",
        detail: "",
        isOver18: false
    });

    const [contactMethod, setContactMethod] = useState("email");
    const [contactValue, setContactValue] = useState("");

    const [sent, setSent] = useState(false);
    const [savedRsvp, setSavedRsvp] = useState(null);
    const [error, setError] = useState("");
    const [full, setFull] = useState(false);

    const update = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value
        }));
    };

    const fullName = [form.firstName, form.lastName].filter(Boolean).join(" ").trim();

    const submit = async (event) => {
        event.preventDefault();

        if (!form.firstName.trim() || !form.lastName.trim()) {
            return;
        }

        if (sendQr && !contactValue.trim()) {
            return;
        }

        try {
            const payload = {
                ...form,
                name: fullName,
                contactEmail: contactMethod === "email" ? contactValue.trim() : "",
                contactPhone: contactMethod === "whatsapp" ? contactValue.trim() : ""
            };

            const savedRow = await saveRsvp(slug, payload, { sendQr });

            setSavedRsvp(savedRow);
            setError("");
            setSent(true);
        } catch (submitError) {
            setSent(false);
            const message = submitError.message || "No se pudo guardar la confirmación.";

            if (message.toLowerCase().includes("cupo")) {
                setFull(true);
            } else {
                setError(message);
            }
        }
    };

    if (full) {
        return (
            <div className="rsvp-error">
                <div className="error-icon"><HugeiconsIcon icon={Alert02Icon} size={25} /></div>
                <h3>Cupo completo</h3>
                <p>Se alcanzó el límite de invitados para este evento. Contactate directamente con el organizador si creés que es un error.</p>
            </div>
        );
    }

    if (sent) {
        const ticketUrl = savedRsvp?.ticketToken
            ? `${window.location.origin}/entrada/${slug}/${savedRsvp.ticketToken}`
            : "";

        return (
            <div className="rsvp-success">
                <div className="success-icon">
                    <HugeiconsIcon icon={Check} size={25} />
                </div>

                <h3>¡Listo!</h3>
                <p>
                    Gracias por confirmar,
                    {` ${fullName}`}.
                </p>

                <span>Nos vemos en el evento de {name}</span>

                {sendQr && ticketUrl && (
                    <div className="rsvp-ticket-share">
                        <p>Guardá o enviá tu entrada con QR:</p>

                        <div className="rsvp-ticket-share-actions">
                            {/* <div style={{
                                display:"flex",
                                gap:4
                            }}>
                                <a
                                    href={`mailto:?subject=${encodeURIComponent(`Tu entrada para ${name}`)}&body=${encodeURIComponent(`Acá está tu entrada: ${ticketUrl}`)}`}
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
                            </div> */}
                            <Link to={`/entrada/${slug}/${savedRsvp.ticketToken}`} className="primary-button">
                                Ver mi entrada
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (error) {
        return (
            <div className="rsvp-error">
                <div className="error-icon"><HugeiconsIcon icon={Alert02Icon} size={25} /></div>

                <h3>Ya existe esa confirmación</h3>
                <p>{error}</p>

                <button
                    type="button"
                    className="primary-button full"
                    onClick={() => setError("")}
                >
                    Intentar de nuevo
                </button>
            </div>
        );
    }

    return (
        <form className="rsvp-form" onSubmit={submit}>
            <div className="form-field">
                <label>Nombre</label>
                <input
                    type="text"
                    placeholder="Tu nombre"
                    value={form.firstName}
                    onChange={(event) => update("firstName", event.target.value)}
                    required
                />
            </div>

            <div className="form-field">
                <label>Apellido</label>
                <input
                    type="text"
                    placeholder="Tu apellido"
                    value={form.lastName}
                    onChange={(event) => update("lastName", event.target.value)}
                    required
                />
            </div>

            {requireAgeConfirmation && (
                <div className="form-field">
                    <label>¿Sos mayor de 18 años?</label>
                    <div className="age-toggle" role="tablist" aria-label="Mayor de edad">
                        <button
                            type="button"
                            className={`age-toggle-option ${form.isOver18 ? "active" : ""}`}
                            onClick={() => update("isOver18", true)}
                        >
                            Sí
                        </button>
                        <button
                            type="button"
                            className={`age-toggle-option ${!form.isOver18 ? "active" : ""}`}
                            onClick={() => update("isOver18", false)}
                        >
                            No
                        </button>
                    </div>
                </div>
            )}

            <div className="form-field select">
                <label>Restricciones alimentarias</label>
                <select
                    value={form.restriction}
                    onChange={(event) => update("restriction", event.target.value)}
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
                        onChange={(event) => update("allergy", event.target.value)}
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
                        onChange={(event) => update("detail", event.target.value)}
                    />
                </div>
            )}

            {sendQr && (
                <>
                    <div className="form-field select">
                        <label>¿Cómo querés recibir tu entrada?</label>
                        <select
                            value={contactMethod}
                            onChange={(event) => {
                                setContactMethod(event.target.value);
                                setContactValue("");
                            }}
                        >
                            <option value="email">Email</option>
                            <option value="whatsapp">WhatsApp</option>
                        </select>
                    </div>

                    <div className="form-field">
                        <label>{contactMethod === "email" ? "Tu email" : "Tu WhatsApp"}</label>
                        <input
                            type={contactMethod === "email" ? "email" : "tel"}
                            placeholder={contactMethod === "email" ? "tu@email.com" : "+54 9 11 ..."}
                            value={contactValue}
                            onChange={(event) => setContactValue(event.target.value)}
                            required
                        />
                    </div>
                </>
            )}

            <button className="primary-button full" type="submit">
                Confirmar asistencia
            </button>
        </form>
    );
}