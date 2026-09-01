import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import ThemeToggle from "../components/ThemeToggle";

import {
    Alert02Icon,
    BeefOffFreeIcons,
    CopyCheck,
    CopyCheckIcon,
    CopyIcon,
    Delete03Icon,
    LockedIcon,
    Share08Icon,
    UserGroup02Icon
} from "@hugeicons/core-free-icons";

import {
    deleteInvitation,
    loadInvitationBySlug,
    loadRsvpsBySlug
} from "../lib/invitations";

function AdminEntry({ theme, onToggleTheme }) {
    const navigate = useNavigate();

    const [slug, setSlug] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setError("");

        const invitation = await loadInvitationBySlug(slug);

        if (!invitation) {
            setError("No encontramos una invitación con ese nombre.");
            setLoading(false);
            return;
        }

        if (password !== invitation.password) {
            setError("La contraseña no es correcta.");
            setLoading(false);
            return;
        }

        window.sessionStorage.setItem(`mis15_admin_auth_${invitation.slug}`, "true");
        navigate(`/admin/${invitation.slug}`, {
            state: { authenticated: true }
        });
    };

    return (
        <main className="admin-page">
            <header className="admin-header">
                <Link to="/">Volver</Link>
                <span className="brand">mis15</span>
                <div className="admin-header-actions">
                    <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
                </div>
            </header>

            <form className="admin-login" onSubmit={submit}>
                <div className="admin-login-icon">
                    <HugeiconsIcon icon={LockedIcon} size={24} />
                </div>

                <span className="section-kicker">ADMINISTRACIÓN</span>

                <h1>Ingresar al panel</h1>

                <p>
                    Usá el nombre de la invitación y la contraseña que elegiste.
                </p>

                <input
                    type="text"
                    value={slug}
                    onChange={(event) => setSlug(event.target.value)}
                    placeholder="Nombre"
                    required
                />

                <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Contraseña"
                    required
                />

                {error && (
                    <small className="error-message">
                        {error}
                    </small>
                )}

                <button
                    className="primary-button full"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Verificando..." : "Ingresar"}
                </button>
            </form>
        </main>
    );
}

export default function Admin({ theme, onToggleTheme }) {
    const { slug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const authenticatedInSession = typeof window !== "undefined" &&
        window.sessionStorage.getItem(`mis15_admin_auth_${slug}`) === "true";

    const [invitation, setInvitation] = useState(null);
    const [rsvps, setRsvps] = useState([]);
    const [password, setPassword] = useState("");
    const [logged, setLogged] = useState(
        () => location.state?.authenticated === true || authenticatedInSession
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [page, setPage] = useState(1);
    const [demoRsvps, setDemoRsvps] = useState([]);

    // Estado para saber si el link fue copiado
    const [copied, setCopied] = useState(false);

    const visibleRsvps = demoRsvps.length > 0 ? demoRsvps : rsvps;
    const totalPages = Math.max(1, Math.ceil(visibleRsvps.length / 10));
    const paginatedRsvps = visibleRsvps.slice((page - 1) * 10, page * 10);

    useEffect(() => {
        let active = true;

        async function fetchData() {
            setLoading(true);

            const invitationData = await loadInvitationBySlug(slug);
            const rsvpData = await loadRsvpsBySlug(slug);

            if (!active) {
                return;
            }

            setInvitation(invitationData);
            setRsvps(rsvpData);
            setLoading(false);
        }

        fetchData();

        return () => {
            active = false;
        };
    }, [slug]);

    useEffect(() => {
        if (!showDeleteModal) {
            return undefined;
        }

        const closeOnEscape = (event) => {
            if (event.key === "Escape" && !deleting) {
                setShowDeleteModal(false);
            }
        };

        document.addEventListener("keydown", closeOnEscape);

        return () => {
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [showDeleteModal, deleting]);

    const login = () => {
        if (password === invitation?.password) {
            setLogged(true);
            setError("");
            return;
        }

        setError("La contraseña no es correcta.");
    };

    const invitationUrl = `${window.location.origin}/invitacion/${slug}`;

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(invitationUrl);

            setCopied(true);

            // Volver al icono de copiar después de 2 segundos
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch {
            window.prompt("Copia este enlace:", invitationUrl);
        }
    };

    const shareLink = async () => {
        const shareData = {
            title: `Invitación de ${invitation?.name || "mi fiesta"}`,
            text: `Te invito a mi fiesta ${invitation?.name || ""}`,
            url: invitationUrl
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch {
                // fallback al portapapeles
            }
        }

        await copyLink();
    };

    const removeInvitation = async () => {
        setDeleting(true);
        setError("");

        try {
            await deleteInvitation(invitation.slug);
            navigate("/admin", { replace: true });
        } catch (deleteError) {
            setError(deleteError.message);
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const createDemoRsvps = () => {
        const restrictions = ["Ninguna", "Vegetariano", "Vegano", "Alergia"];
        const generated = Array.from({ length: 20 }, (_, index) => ({
            name: `Invitado de prueba ${String(index + 1).padStart(2, "0")}`,
            restriction: restrictions[index % restrictions.length],
            allergy: index % restrictions.length === 3 ? "Frutos secos" : "",
            createdAt: new Date(Date.now() - index * 86400000).toISOString()
        }));

        setDemoRsvps(generated);
        setPage(1);
    };

    if (!slug) {
        return <AdminEntry theme={theme} onToggleTheme={onToggleTheme} />;
    }

    if (loading) {
        return (
            <main className="center-page">
                <h1>Cargando invitación...</h1>
            </main>
        );
    }

    if (!invitation) {
        return (
            <main className="center-page">
                <h1>Invitación no encontrada</h1>

                <Link to="/crear" className="primary-button">
                    Crear invitación
                </Link>
            </main>
        );
    }

    if (!logged) {
        return (
            <main className="admin-page">
                <header className="admin-header">
                    <Link to="/">Volver</Link>
                    <span className="brand">mis15</span>
                    <div className="admin-header-actions">
                        <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
                    </div>
                </header>

                <div className="admin-login">
                    <div className="admin-login-icon">
                        <HugeiconsIcon icon={LockedIcon} size={24} />
                    </div>

                    <span className="section-kicker">
                        ADMINISTRACIÓN
                    </span>

                    <h1>Tu invitación</h1>

                    <p>
                        Ingresá la contraseña que elegiste al crearla.
                    </p>

                    <input
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                login();
                            }
                        }}
                        placeholder="Contraseña"
                    />

                    {error && (
                        <small className="error-message">
                            {error}
                        </small>
                    )}

                    <button
                        className="primary-button full"
                        onClick={login}
                    >
                        Ingresar
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="admin-page">
            <header className="admin-header">
                <Link to={`/invitacion/${slug}`}>
                    Ver invitación
                </Link>

                <span className="brand">mis15</span>
                <div className="admin-header-actions">
                    <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
                </div>
            </header>

            <section className="admin-head">
                <div>
                    <span className="section-kicker">
                        MI INVITACIÓN
                    </span>

                    <h1>{invitation.name}</h1>

                    <p>
                        mis15.com/invitacion/{slug}
                    </p>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap"
                    }}
                >
                    <Link
                        className="secondary-button"
                        to={`/invitacion/${slug}`}
                    >
                        Ver invitación
                    </Link>
                    <Link
                        className="secondary-button"
                        to={`/crear?edit=${encodeURIComponent(
                            invitation.slug
                        )}`}
                    >
                        Editar invitación
                    </Link>

                    <div style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center"
                    }}>

                        <button
                            type="button"
                            className="secondary-button"
                            title={copied ? "¡Copiado!" : "Copiar link"}
                            aria-label={copied ? "¡Copiado!" : "Copiar link"}
                            onClick={copyLink}
                        >
                            <HugeiconsIcon
                                icon={copied ? CopyCheckIcon : CopyIcon}
                                size={15}
                            />
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            title="Compartir"
                            aria-label="Compartir"
                            onClick={shareLink}
                        >
                            <HugeiconsIcon
                                icon={Share08Icon}
                                size={15}
                            />
                        </button>

                        <button
                            type="button"
                            className="danger-button"
                            title="Eliminar"
                            aria-label="Eliminar"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            <HugeiconsIcon
                                icon={Delete03Icon}
                                size={15}
                            />
                        </button>
                    </div>
                </div>
            </section>

            {error && (
                <p className="error-message admin-action-error">
                    {error}
                </p>
            )}

            {showDeleteModal && (
                <div
                    className="modal-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !deleting
                        ) {
                            setShowDeleteModal(false);
                        }
                    }}
                >
                    <section
                        className="delete-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-title"
                    >
                        <div className="delete-modal-mark"><HugeiconsIcon icon={Alert02Icon} size={14} /></div>

                        <span className="section-kicker">
                            ACCIÓN IRREVERSIBLE
                        </span>

                        <h2 id="delete-title">
                            ¿Eliminar esta invitación?
                        </h2>

                        <p>
                            Se borrará{" "}
                            <strong>{invitation.name}</strong>{" "}
                            junto con todas sus confirmaciones.
                        </p>

                        <div className="delete-modal-actions">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    setShowDeleteModal(false)
                                }
                                disabled={deleting}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="danger-button"
                                onClick={removeInvitation}
                                disabled={deleting}
                            >
                                {deleting
                                    ? "Eliminando..."
                                    : "Sí, eliminar"}
                            </button>
                        </div>
                    </section>
                </div>
            )}

            <section className="admin-stats">
                <div className="admin-stat">
                    <div className="admin-stat-icon">
                        <HugeiconsIcon
                            icon={UserGroup02Icon}
                            size={18}
                        />
                    </div>

                    <div>
                        <strong>{visibleRsvps.length}</strong>
                        <span>CONFIRMADOS</span>
                    </div>
                </div>

                <div className="admin-stat">
                    <div className="admin-stat-icon restriction-icon">
                        <HugeiconsIcon
                            icon={BeefOffFreeIcons}
                            size={18}
                        />
                    </div>

                    <div>
                        <strong>
                            {
                                visibleRsvps.filter(
                                    (item) =>
                                        item.restriction &&
                                        item.restriction !== "Ninguna"
                                ).length
                            }
                        </strong>

                        <span>RESTRICCIONES</span>
                    </div>
                </div>
            </section>

            <section className="admin-rsvps">
                <div className="admin-section-title">
                    <div>
                        <h2>Confirmaciones</h2>
                    </div>
                   
                </div>

                {visibleRsvps.length === 0 ? (
                    <div className="empty-state">
                        <HugeiconsIcon
                            icon={UserGroup02Icon}
                            size={24}
                        />

                        <h3>
                            Todavía no hay confirmaciones
                        </h3>

                        <p>
                            Cuando tus invitados confirmen aparecerán acá.
                        </p>
                    </div>
                ) : (
                    <div className="rsvp-list">
                        {paginatedRsvps.map((rsvp, index) => (
                            <div
                                className="rsvp-admin-row"
                                key={`${rsvp.name}-${index}`}
                            >
                                <div>
                                    <strong>{rsvp.name}</strong>
                                    <span>{rsvp.restriction}</span>
                                    <small className="rsvp-age-status">
                                        {rsvp.isOver18 === false ? "Menor de 18" : "Mayor de 18"}
                                    </small>
                                    {rsvp.restriction === "Alergia" && rsvp.allergy && (
                                        <small className="rsvp-allergy">
                                            Alergia: {rsvp.allergy}
                                        </small>
                                    )}
                                </div>

                                <small>
                                    {new Date(
                                        rsvp.createdAt ||
                                        rsvp.created_at
                                    ).toLocaleDateString("es-AR")}
                                </small>
                            </div>
                        ))}
                    </div>
                )}

                {visibleRsvps.length > 10 && (
                    <div className="pagination-controls">
                        <button
                            type="button"
                            className="secondary-button"
                            disabled={page === 1}
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                        >
                            Anterior
                        </button>
                        <span>Página {page} de {totalPages}</span>
                        <button
                            type="button"
                            className="secondary-button"
                            disabled={page === totalPages}
                            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}
