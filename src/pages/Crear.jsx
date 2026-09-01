
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
import { loadInvitationBySlug, saveInvitation, slugify } from "../lib/invitations";

export default function Crear() {

    const navigate =
        useNavigate();
    const [searchParams] = useSearchParams();
    const editSlug = searchParams.get("edit");

    const [form, setForm] =
        useState({
            ...demoInvitation,

            name: "",

            slug: "",

            password: "",

            heroImage: ""
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
                setForm((previous) => ({ ...previous, ...invitation }));
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

    const generateSlug = () => {

        return form.name
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

        const slug = slugify(
            form.slug.trim() ||
            generateSlug()
        );

        if (!form.name.trim()) {
            return;
        }

        setSaving(true);
        setSaveError("");

        try {
            const savedInvitation = await saveInvitation({
                ...form,
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
                    mis15
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
                            Nombre de la quinceañera

                            <input
                                value={form.name}
                                onChange={(event) =>
                                    update(
                                        "name",
                                        event.target.value
                                    )
                                }
                                placeholder="Sofía"
                                required
                            />

                        </label>


                        <label>

                            URL personalizada

                            <div className="input-prefix">

                                <span>
                                    mis15-one.vercel.app/invitacion/
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
                                />

                            </div>

                        </label>


                        <label>

                            Contraseña de administración

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
                            Fecha
                            <input
                                type="date"
                                value={form.date || ""}
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
                                Desde
                                <input
                                    type="time"
                                    value={form.timeStart || ""}
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
                                Hasta
                                <input
                                    type="time"
                                    value={form.timeEnd || ""}
                                    onChange={(event) =>
                                        update(
                                            "timeEnd",
                                            event.target.value
                                        )
                                    }
                                    style={{
                                        width: "90%"
                                    }}
                                    required
                                />
                            </label>
                        </div>
                    </fieldset>



                    <fieldset>

                        <legend>
                            03 · UBICACIÓN
                        </legend>

                        <label>

                            Nombre del salón

                            <input
                                value={form.venue || ""}
                                onChange={(event) =>
                                    update(
                                        "venue",
                                        event.target.value
                                    )
                                }
                            />

                        </label>

                        <label>

                            Dirección

                            <div className="address-search">
                                <input
                                    value={form.address || ""}
                                    onChange={(event) => {
                                        const address = event.target.value;
                                        setForm((previous) => ({
                                            ...previous,
                                            address,
                                            mapsUrl: address.trim()
                                                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
                                                : ""
                                        }));
                                    }}
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

                            Link de Google Maps

                            <input
                                value={form.mapsUrl || ""}
                                onChange={(event) =>
                                    update(
                                        "mapsUrl",
                                        event.target.value
                                    )
                                }
                            />

                        </label>

                    </fieldset>


                    <fieldset>

                        <legend>
                            04 · DRESS CODE
                        </legend>

                        <label>

                            Tipo

                            <input
                                value={form.dressCode || ""}
                                onChange={(event) =>
                                    update(
                                        "dressCode",
                                        event.target.value
                                    )
                                }
                            />

                        </label>

                        <label>

                            Descripción

                            <textarea
                                value={form.dressDescription || ""}
                                onChange={(event) =>
                                    update(
                                        "dressDescription",
                                        event.target.value
                                    )
                                }
                            />

                        </label>

                        <label>

                            Colores que no se pueden usar

                            <input
                                value={form.dressColorsNotAllowed || ""}
                                onChange={(event) =>
                                    update(
                                        "dressColorsNotAllowed",
                                        event.target.value
                                    )
                                }
                                placeholder="Blanco, rojo"
                            />

                            <small>
                                Separalos con comas para mostrarlos claramente en la invitación.
                            </small>

                        </label>

                    </fieldset>


                    <fieldset>

                        <legend>
                            05 · REGALOS
                        </legend>

                        <label>

                            Alias

                            <input
                                value={form.alias || ""}
                                onChange={(event) =>
                                    update(
                                        "alias",
                                        event.target.value
                                    )
                                }
                            />

                        </label>

                        <label>

                            CBU

                            <input
                                value={form.cbu || ""}
                                onChange={(event) =>
                                    update(
                                        "cbu",
                                        event.target.value
                                    )
                                }
                            />

                        </label>

                    </fieldset>


                    <fieldset>
                        <legend>
                            06 · DISEÑO
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
                                        <span>XV</span>
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
                        disabled={saving}
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
