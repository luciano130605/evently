import { useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { Check, Alert02Icon } from "@hugeicons/core-free-icons";

import { saveRsvp } from "../lib/invitations";


export default function RSVPForm({ slug, name }) {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        restriction: "Ninguna",
        allergy: "",
        detail: "",
        isOver18: true
    });

    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

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

        try {
            await saveRsvp(slug, {
                ...form,
                name: fullName
            });
            setError("");
            setSent(true);
        } catch (submitError) {
            setSent(false);
            setError(submitError.message || "No se pudo guardar la confirmación.");
        }
    };

    if (sent) {
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

                <span>Nos vemos en los 15 de {name}</span>
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

            <div className="form-field">
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

            <button className="primary-button full" type="submit">
                Confirmar asistencia
            </button>
        </form>
    );
}
