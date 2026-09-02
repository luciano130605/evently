
import { HugeiconsIcon } from "@hugeicons/react";
import { Check } from "@hugeicons/core-free-icons";

import {
    Link,
    useNavigate,
    useSearchParams
} from "react-router-dom";

import {
    useEffect,
    useState
} from "react";

import {
    demoInvitation
} from "../data/demoInvitation";
import { loadInvitationBySlug, saveInvitation, slugify, splitNameParts } from "../lib/invitations";

export const requiredFields = [
    ["firstName", "Nombre"],
    ["password", "Contraseña de administración"],
    ["date", "Fecha"],
    ["timeStart", "Desde"],
    ["venue", "Nombre del salón"],
    ["address", "Dirección"],
    ["mapsUrl", "Link de Google Maps"],
    ["dressCode", "Tipo de dress code"],
    ["dressColorsNotAllowed", "Colores que no se pueden usar"]
];

export const isRequiredFormComplete = (formData = {}) => {
    const hasFirstName = String(formData.firstName ?? "").trim().length > 0;
    const hasLegacyName = !hasFirstName && String(formData.name ?? "").trim().length > 0;
    const showDressCode = formData.showDressCode !== false;

    const fieldsToValidate = requiredFields.filter(([field]) => {
        if (!showDressCode && (field === "dressCode" || field === "dressColorsNotAllowed")) {
            return false;
        }

        return true;
    });

    if (hasLegacyName) {
        return fieldsToValidate
            .filter(([field]) => field !== "firstName")
            .every(([field]) => String(formData[field] ?? "").trim().length > 0);
    }

    return fieldsToValidate.every(([field]) => String(formData[field] ?? "").trim().length > 0);
};

export default function Crear() {

    const navigate =
        useNavigate();
    const [searchParams] = useSearchParams();
    const editSlug = searchParams.get("edit");

    const [form, setForm] =
        useState({
            ...demoInvitation,

            firstName: "",
            lastName: "",
            name: "",
            eventType: "Cumpleaños",
            slug: "",
            password: "",
            heroImage: "",
            isOver18: true,
            requireAgeConfirmation: false,
            showDressCode: true,
            showPhotoAlbum: true,
            showGiftSection: true,
            googlePhotosUrl: demoInvitation.googlePhotosUrl
        });
    const [saveError, setSaveError] = useState("");
    const [saving, setSaving] = useState(false);
    const [loadingEdit, setLoadingEdit] = useState(Boolean(editSlug));
    const [addressResults, setAddressResults] = useState([]);
    const [addressSearching, setAddressSearching] = useState(false);
    const [addressMessage, setAddressMessage] = useState("");

    useEffect(() => {
        if (!editSlug) {
            return undefined;
        }

        let active = true;

        async function loadExistingInvitation() {
            const invitation = await loadInvitationBySlug(editSlug);

            if (active && invitation) {
                const parsed = splitNameParts(invitation.name || "");
                setForm((previous) => ({
                    ...previous,
                    ...invitation,
                    firstName: invitation.firstName || parsed.firstName,
                    lastName: invitation.lastName || parsed.lastName,
                    isOver18: invitation.isOver18 ?? true,
                    requireAgeConfirmation: invitation.requireAgeConfirmation ?? false,
                    showDressCode: invitation.showDressCode ?? true,
                    showPhotoAlbum: invitation.showPhotoAlbum ?? true,
                    showGiftSection: invitation.showGiftSection ?? true,
                    eventType: invitation.eventType || "Cumpleaños",
                    googlePhotosUrl: invitation.googlePhotosUrl || demoInvitation.googlePhotosUrl
                }));
            }

            if (active) {
                setLoadingEdit(false);
            }
        }

        loadExistingInvitation();
        return () => {
            active = false;
        };
    }, [editSlug]);

    useEffect(() => {
        const query = form.address.trim();

        if (query.length < 3 || form.address === addressResults[0]?.display_name) {
            setAddressResults([]);
            setAddressMessage("");
            return undefined;
        }

        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            setAddressSearching(true);
            setAddressMessage("");

            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=ar&q=${encodeURIComponent(query)}`,
                    { signal: controller.signal }
                );
                const results = await response.json();
                setAddressResults(results);
                setAddressMessage(results.length ? "Elegí una dirección para generar el link." : "No encontramos ese lugar. Podés pegar un link manualmente.");
            } catch (error) {
                if (error.name !== "AbortError") {
                    setAddressResults([]);
                    setAddressMessage("No pudimos buscar ahora. Podés pegar un link manualmente.");
                }
            } finally {
                setAddressSearching(false);
            }
        }, 450);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [form.address]);

    const selectAddress = (result) => {
        const address = result.display_name;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

        setForm((previous) => ({ ...previous, address, mapsUrl }));
        setAddressResults([]);
        setAddressMessage("Link de Google Maps generado automáticamente.");
    };

    const update = (
        field,
        value
    ) => {

        setForm((previous) => ({
            ...previous,
            [field]: value
        }));

    };

    const buildGoogleMapsUrl = (address) => {
        if (!address || !String(address).trim()) {
            return "";
        }

        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`;
    };

    const generateSlug = () => {
        const nameToUse = form.firstName || form.name || "";

        return nameToUse
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /(^-|-$)/g,
                "");
    };

    const submit = async (event) => {

        event.preventDefault();

        const missingField = requiredFields.find(([field]) => {
            if (form.showDressCode === false && (field === "dressCode" || field === "dressColorsNotAllowed")) {
                return false;
            }

            return !String(form[field] || "").trim();
        });

        if (missingField) {
            const [, label] = missingField;
            setSaveError(`Completá el campo: ${label}.`);
            return;
        }

        const fullName = (form.firstName || form.name || "").trim();

        if (!fullName) {
            setSaveError("Completá el nombre.");
            return;
        }

        const slug = slugify(
            form.slug.trim() ||
            generateSlug()
        );

        setSaving(true);
        setSaveError("");

        try {
            const savedInvitation = await saveInvitation({
                ...form,
                name: fullName,
                slug,
                heroImage:
                    form.heroImage ||
                    demoInvitation.heroImage
            });

            navigate(
                `/admin/${savedInvitation.slug}`
            );
        } catch (error) {
            setSaveError(error.message);
            setSaving(false);
        }
    };

    const formIsComplete = isRequiredFormComplete(form);

    if (loadingEdit) {
        return <main className="center-page"><h1>Cargando invitación...</h1></main>;
    }

    return (
        <main className="creator-page">

            <header className="creator-header">

                <Link
                    to="/"
                    className="creator-back"
                >
                    Volver
                </Link>

                <span className="brand">
                    evently
                </span>

                <span className="creator-label">
                    {editSlug ? "EDITAR INVITACIÓN" : "CREAR INVITACIÓN"}
                </span>

            </header>


            <div className="creator-layout">

                <div className="creator-intro">

                    <span className="section-kicker">
                        TU INVITACIÓN
                    </span>

                    <h1>
                        {editSlug ? "Editá tu" : "Creá algo"}
                        <em>{editSlug ? "invitación." : "inolvidable."}</em>
                    </h1>

                    <p>
                        Completá los datos de
                        tu fiesta. Después vas
                        a recibir una URL única
                        para compartir.
                    </p>

                    <div className="creator-note">


                        <span>
                            Tus invitados no
                            necesitan crear una cuenta.
                        </span>

                    </div>

                </div>


                <form
                    className="creator-form"
                    onSubmit={submit}
                >

                    <fieldset>

                        <legend>
                            01 · INFORMACIÓN
                        </legend>

                        <label>
                            <div>
                                Nombre <span title="Obligatorio" style={{ color: "var(--purple)" }}>*</span>
                            </div>
                            <input
                                value={form.firstName || ""}
                                onChange={(event) =>
                                    update(
                                        "firstName",
                                        event.target.value
                                    )
                                }
                                placeholder="Sofía"
                                required
                            />
                        </label>

                        <label>
                            <div>
                                Tipo de evento
                            </div>
                            <select
                                placeholder={form.eventType || "Cumpleaños"}
                                onChange={(event) => update("eventType", event.target.value)}
                            >
                                <option value="Cumpleaños">Cumpleaños</option>
                                <option value="Fiesta">Fiesta</option>
                                <option value="Casamiento">Casamiento</option>
                                <option value="Fin de año">Fin de año</option>
                                <option value="Cena">Cena</option>
                                <option value="Evento especial">Evento especial</option>
                            </select>
                        </label>

                        <label>


                            <div>
                                URL personalizada <span title="Obligatorio" style={{ color: "var(--purple)" }}>*</span>
                            </div>

                            <div className="input-prefix">

                                <span>
                                    evently-one.vercel.app/invitacion/
                                </span>

                                <input
                                    value={form.slug}
                                    onChange={(event) =>
                                        update(
                                            "slug",
                                            event.target.value
                                        )
                                    }
                                    placeholder="sofia"
                                    onBlur={(event) => {
                                        const nextSlug = event.target.value.trim();
                                        if (!nextSlug) {
                                            update("slug", generateSlug());
                                        }
                                    }}
                                />

                            </div>

                            <small>
                                Si se deja vacío, se usará el nombre del evento.
                            </small>

                        </label>


                        <label className="checkbox-row">
                            <input
                                type="checkbox"
                                checked={Boolean(form.requireAgeConfirmation)}
                                onChange={(event) => update("requireAgeConfirmation", event.target.checked)}
                            />
                            <span>Solicitar edad en la confirmación</span>
                        </label>

                       

                        <label>
                            <div>
                                Contraseña de administración <span title="Obligatorio" style={{ color: "var(--purple)" }}>*</span>
                            </div>



                            <input
                                type="password"
                                value={form.password}
                                onChange={(event) =>
                                    update(
                                        "password",
                                        event.target.value
                                    )
                                }
                                placeholder="••••••••"
                                required
                            />

                            <small>
                                Esta contraseña será
                                necesaria para editar
                                tu invitación.
                            </small>

                        </label>

                    </fieldset>


                    <fieldset>
                        <legend>
                            02 · FECHA Y HORA
                        </legend>

                        <label>
                            <div>
                                Fecha <span title="Obligatorio" style={{ color: "var(--purple)" }}>*</span>
                            </div>
                            <input
                                type="date"
                                placeholder={form.date || ""}
                                onChange={(event) =>
                                    update(
                                        "date",
                                        event.target.value
                                    )
                                }
                                required
                                style={{
                                    width: "90%"
                                }}
                            />
                        </label>

                        <div className="time-range">
                            <label>
                                <div>
                                    Desde <span title="Obligatorio" style={{ color: "var(--purple)" }}>*</span>
                                </div>
                                <input
                                    type="time"
                                    placeholder={form.timeStart || ""}
                                    onChange={(event) =>
                                        update(
                                            "timeStart",
                                            event.target.value
                                        )
                                    }
                                    required
                                    style={{
                                        width: "90%"
                                    }}
                                />
                            </label>


                            <label>
                                <div>
                                    Hasta
                                </div>
                                <input
                                    type="time"
                                    placeholder={form.timeEnd || ""}
                                    onChange={(event) =>
                                        update(
                                            "timeEnd",
                                            event.target.value
                                        )
                                    }
                                    style={{
                                        width: "90%"
                                    }}
                                />
                            </label>
                        </div>
                    </fieldset>



                    <fieldset>

                        <legend>
                            03 · UBICACIÓN
                        </legend>

                        <label>


                            <div>
                                Nombre del salón <span title="Obligatorio" style={{ color: "var(--purple)" }}>*</span>
                            </div>
                            <input
                                placeholder={form.venue || ""}
                                onChange={(event) =>
                                    update(
                                        "venue",
                                        event.target.value
                                    )
                                }
                                required
                            />

                        </label>

                        <label>

                            <div>
                                Dirección <span title="Obligatorio" style={{ color: "var(--purple)" }}>*</span>
                            </div>

                            <div className="address-search">
                                <input
                                    placeholder={form.address || ""}
                                    onChange={(event) => {
                                        const address = event.target.value;
                                        setForm((previous) => ({
                                            ...previous,
                                            address,
                                            mapsUrl: buildGoogleMapsUrl(address)
                                        }));
                                    }}
                                    required
                                />
                                {addressSearching && <small>Buscando lugares...</small>}
                                {addressMessage && <small>{addressMessage}</small>}
                                {addressResults.length > 0 && (
                                    <div className="address-results">
                                        {addressResults.map((result) => (
                                            <button type="button" key={result.place_id} onClick={() => selectAddress(result)}>
                                                <strong>{result.name || result.display_name.split(",")[0]}</strong>
                                                <span>{result.display_name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </label>

                        <label>

                            <div>
                                Link de Google Maps <span title="Obligatorio" style={{ color: "var(--purple)" }}>*</span>
                            </div>

                            <input
                                readOnly
                                placeholder="Se completa automáticamente con la dirección"
                                required
                            />

                        </label>

                    </fieldset>


                    <fieldset>
                        <legend>
                            04 · DRESS CODE
                        </legend>

                        <label className="checkbox-row">
                            <input
                                type="checkbox"
                                checked={Boolean(form.showDressCode)}
                                onChange={(event) => update("showDressCode", event.target.checked)}
                            />
                            <span>Mostrar dress code</span>
                        </label>

                        <div className={form.showDressCode === false ? "section-toggle-off" : ""}>
                            <label>
                                <div>
                                    Tipo de dress code {form.showDressCode !== false && <span title="Obligatorio" style={{ color: "var(--purple)" }}>*</span>}
                                </div>
                                <input
                                    placeholder={form.dressCode || ""}
                                    onChange={(event) => update("dressCode", event.target.value)}
                                    required={form.showDressCode !== false}
                                    disabled={form.showDressCode === false}
                                />
                            </label>

                            <label>
                                Descripción
                                <textarea
                                    placeholder={form.dressDescription || ""}
                                    onChange={(event) => update("dressDescription", event.target.value)}
                                    disabled={form.showDressCode === false}
                                />
                            </label>

                            <label>
                                <div>
                                    Colores que no se pueden usar {form.showDressCode !== false && <span title="Obligatorio" style={{ color: "var(--purple)" }}>*</span>}
                                </div>
                                <input
                                    placeholder={form.dressColorsNotAllowed || ""}
                                    onChange={(event) => update("dressColorsNotAllowed", event.target.value)}
                                    required={form.showDressCode !== false}
                                    disabled={form.showDressCode === false}
                                />
                                <small>
                                    Separalos con comas para mostrarlos claramente en la invitación.
                                </small>
                            </label>
                        </div>
                    </fieldset>


                    <fieldset>
                        <legend>05 · FOTOS</legend>

                        <label className="checkbox-row">
                            <input
                                type="checkbox"
                                checked={Boolean(form.showPhotoAlbum)}
                                onChange={(event) => update("showPhotoAlbum", event.target.checked)}
                            />
                            <span>Mostrar álbum de fotos</span>
                        </label>

                        <div className={form.showPhotoAlbum === false ? "section-toggle-off" : ""}>
                            <label>
                                Álbum de Google Fotos
                                <input
                                    onChange={(event) => update("googlePhotosUrl", event.target.value.trim())}
                                    placeholder="https://photos.google.com/share/..."
                                    disabled={form.showPhotoAlbum === false}
                                />
                                <small>
                                    Si lo agregás, se mostrará un botón en la invitación para abrir el álbum.
                                </small>
                            </label>
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>06 · REGALOS</legend>

                        <label className="checkbox-row">
                            <input
                                type="checkbox"
                                checked={Boolean(form.showGiftSection)}
                                onChange={(event) => update("showGiftSection", event.target.checked)}
                            />
                            <span>Mostrar sección de regalos</span>
                        </label>

                        <div className={form.showGiftSection === false ? "section-toggle-off" : ""}>
                            <label>
                                Alias
                                <input
                                    placeholder={form.alias || ""}
                                    onChange={(event) => update("alias", event.target.value)}
                                    disabled={form.showGiftSection === false}
                                />
                            </label>

                            <label>
                                CBU
                                <input
                                    placeholder={form.cbu || ""}
                                    onChange={(event) => update("cbu", event.target.value)}
                                    disabled={form.showGiftSection === false}
                                />
                            </label>
                        </div>
                    </fieldset>


                  


                    <fieldset>
                        <legend>
                            07 · DISEÑO
                        </legend>

                        <div className="design-intro">
                            <strong>Elegí el estilo de tu invitación</strong>
                            <span>
                                Los colores se aplicarán automáticamente a toda la página.
                            </span>
                        </div>

                        <div className="theme-grid">
                            {[
                                {
                                    id: "lavender",
                                    name: "Lavanda",
                                    description: "Suave y romántico",
                                    color: "#9B8AFB",
                                    background: "#F7F3FF"
                                },
                                {
                                    id: "rose",
                                    name: "Rosa",
                                    description: "Dulce y elegante",
                                    color: "#E88CA7",
                                    background: "#FFF4F7"
                                },
                                {
                                    id: "sage",
                                    name: "Sage",
                                    description: "Natural y delicado",
                                    color: "#82A88E",
                                    background: "#F3F8F4"
                                },
                                {
                                    id: "blue",
                                    name: "Celeste",
                                    description: "Fresco y moderno",
                                    color: "#6F9DD8",
                                    background: "#F2F7FC"
                                },
                                {
                                    id: "peach",
                                    name: "Durazno",
                                    description: "Cálido y alegre",
                                    color: "#E99A78",
                                    background: "#FFF6F1"
                                },
                                {
                                    id: "midnight",
                                    name: "Midnight",
                                    description: "Elegante y sofisticado",
                                    color: "#7668A8",
                                    background: "#F5F3FA"
                                },
                                {
                                    id: "xv",
                                    name: "XV",
                                    description: "Romántica y sofisticada",
                                    color: "#8B203A",
                                    background: "#171B33"
                                }
                            ].map((theme) => (
                                <button
                                    type="button"
                                    key={theme.id}
                                    className={`theme-option ${form.template === theme.id
                                        ? "selected"
                                        : ""
                                        }`}
                                    onClick={() =>
                                        update("template", theme.id)
                                    }
                                >
                                    <div
                                        className="theme-preview"
                                        style={{
                                            "--theme-color": theme.color,
                                            "--theme-background": theme.background
                                        }}
                                    >
                                        <span>{theme.name.slice(0, 2).toUpperCase()}</span>
                                    </div>

                                    <div className="theme-info">
                                        <strong>{theme.name}</strong>
                                        <span>{theme.description}</span>
                                    </div>

                                    <span className="theme-check">
                                        {form.template === theme.id && (
                                            <HugeiconsIcon icon={Check} size={13} />
                                        )}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </fieldset>


                    <button
                        type="submit"
                        className="primary-button full"
                        disabled={saving || !formIsComplete}
                    >

                        {saving ? "Guardando..." : editSlug ? "Guardar cambios" : "Crear invitación"}


                    </button>

                    {saveError && (
                        <small className="error-message">{saveError}</small>
                    )}

                </form>

            </div>

        </main>
    );
}
