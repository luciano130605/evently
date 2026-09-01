import { useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { Check } from "@hugeicons/core-free-icons";

import { saveRsvp } from "../lib/invitations";

export default function RSVPForm({ slug, name }) {
    const [form, setForm] = useState({
        name: "",
        restriction: "Ninguna",
        allergy: "",
        detail: ""
    });

    const [sent, setSent] = useState(false);

    const update = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value
        }));
    };

    const submit = async (event) => {
        event.preventDefault();

        if (!form.name.trim()) {
            return;
        }

        await saveRsvp(slug, form);
        setSent(true);
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
                    {` ${form.name}`}. 
                </p>

                <span>Nos vemos en los 15 de {name}</span>
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
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    required
                />
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
