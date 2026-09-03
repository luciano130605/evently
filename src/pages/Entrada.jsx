import { useParams, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Calendar03Icon,
    Clock01Icon,
    PinLocation03Icon,
    TieIcon,
    LinkCircleIcon,
    Download04Icon,
} from "@hugeicons/core-free-icons";
import { loadInvitationBySlug, findRsvpByToken } from "../lib/invitations";
import InstallPwaGuide from "../components/Installpwaguide";
import "./EntradaDemo.css";
import "../components/InstallPwaGuide.css";

export default function Entrada() {
    const { slug, ticketToken } = useParams();
    const [invitation, setInvitation] = useState(null);
    const [rsvp, setRsvp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const qrModalFrameRef = useRef(null);

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

    useEffect(() => {
        if (!qrModalOpen) {
            return undefined;
        }

        const closeOnEscape = (event) => {
            if (event.key === "Escape") {
                setQrModalOpen(false);
            }
        };

        document.addEventListener("keydown", closeOnEscape);

        return () => {
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [qrModalOpen]);

    if (loading) return <main className="center-page"><h1>Cargando entrada...</h1></main>;
    if (notFound) return <main className="center-page"><h1>Entrada no encontrada</h1></main>;

    const validationUrl = `${window.location.origin}/validar/${slug}/${ticketToken}`;

    // Convierte el QR (SVG) mostrado en el modal a un PNG y dispara la descarga
    const downloadQR = () => {
        const svg = qrModalFrameRef.current?.querySelector("svg");
        if (!svg) return;

        const rootStyles = getComputedStyle(document.documentElement);
        const surfaceColor = rootStyles.getPropertyValue("--surface").trim() || "#ffffff";
        const purpleColor = rootStyles.getPropertyValue("--purple").trim() || "#6c5ce7";

        let svgMarkup = new XMLSerializer().serializeToString(svg);
        svgMarkup = svgMarkup
            .replaceAll("var(--surface)", surfaceColor)
            .replaceAll("var(--purple)", purpleColor);

        const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            const scale = 6; // resolución alta para que se pueda imprimir o escanear bien
            const padding = 40 * scale;
            const size = img.width * scale;

            const canvas = document.createElement("canvas");
            canvas.width = size + padding * 2;
            canvas.height = size + padding * 2;

            const ctx = canvas.getContext("2d");
            ctx.fillStyle = surfaceColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, padding, padding, size, size);

            URL.revokeObjectURL(svgUrl);

            canvas.toBlob((blob) => {
                if (!blob) return;
                const fileSafeName = (rsvp.name || "entrada")
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "");
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `entrada-${fileSafeName || "invitado"}.png`;
                document.body.appendChild(link);
                link.click();
                link.remove();
                URL.revokeObjectURL(link.href);
            }, "image/png");
        };
        img.src = svgUrl;
    };

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
                            <button
                                type="button"
                                className="entry-qr-frame entry-qr-frame-button"
                                onClick={() => setQrModalOpen(true)}
                                aria-label="Ver QR en grande"
                            >
                                <QRCodeSVG
                                    value={validationUrl}
                                    size={180}
                                    bgColor="var(--surface)"
                                    fgColor="var(--purple)"
                                    level="H"
                                    includeMargin={false}
                                />
                            </button>
                            <p>Tocá el código para verlo en grande y mostrarlo al ingresar.</p>
                        </div>
                    </div>

                    <InstallPwaGuide guestName={rsvp.name} />
                </article>

                <footer className="entry-footer">
                    <p>Esta entrada fue generada con <strong>evently</strong></p>
                    <Link to="/">Crear mi invitación</Link>
                </footer>
            </section>

            {qrModalOpen && (
                <div
                    className="modal-backdrop qr-modal-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setQrModalOpen(false);
                        }
                    }}
                >
                    <section
                        className="qr-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Código QR de la entrada"
                    >
                        <button
                            type="button"
                            className="qr-modal-close"
                            onClick={() => setQrModalOpen(false)}
                            aria-label="Cerrar"
                        >
                            X
                        </button>

                        <span className="entry-kicker">ACCESO</span>
                        <h3>{rsvp.name}</h3>

                        <div className="qr-modal-frame" ref={qrModalFrameRef}>
                            <QRCodeSVG
                                value={validationUrl}
                                size={280}
                                bgColor="var(--surface)"
                                fgColor="var(--purple)"
                                level="H"
                                includeMargin={false}
                            />
                        </div>

                        <p>Mostrá este código al ingresar al evento.</p>

                        <button
                            type="button"
                            className="qr-download-button"
                            onClick={downloadQR}
                        >
                            Descargar QR
                        </button>
                    </section>
                </div>
            )}
        </main>
    );
}