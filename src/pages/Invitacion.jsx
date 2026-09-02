import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import Countdown from "../components/Countdown";
import RSVPForm from "../components/RSVPForm";
import GiftSection from "../components/GiftSection";
import NotFoundPage from "./NotFound";

import { demoInvitation, xvDemoInvitation } from "../data/demoInvitation";
import { loadInvitationBySlug } from "../lib/invitations";
import { HugeiconsIcon } from "@hugeicons/react";
import { Album01FreeIcons, Calendar02Icon, ChevronDown, LinkCircleIcon, PinLocation02Icon, PinLocation03Icon, TieIcon } from "@hugeicons/core-free-icons";

const THEMES = {
    lavender: {
        primary: "#9B8AFB",
        secondary: "#EEE9FF",
        background: "#FBF9FF",
        soft: "#F4F0FF",
        text: "#302A43"
    },
    rose: {
        primary: "#E88CA7",
        secondary: "#FFE8EE",
        background: "#FFF9FA",
        soft: "#FFF1F5",
        text: "#422D35"
    },
    sage: {
        primary: "#82A88E",
        secondary: "#E5F1E8",
        background: "#FAFCFA",
        soft: "#EFF7F1",
        text: "#2F3932"
    },
    blue: {
        primary: "#6F9DD8",
        secondary: "#E6F0FC",
        background: "#FAFCFF",
        soft: "#F0F6FD",
        text: "#293746"
    },
    peach: {
        primary: "#E99A78",
        secondary: "#FFEADF",
        background: "#FFFBF8",
        soft: "#FFF2EB",
        text: "#432F27"
    },
    midnight: {
        primary: "#7668A8",
        secondary: "#EAE6F5",
        background: "#FAF9FD",
        soft: "#F1EFF8",
        text: "#302B3D"
    },
    xv: {
        primary: "#8B203A",
        gold: "#D9B26B",
        secondary: "#F6ECE2",
        background: "#171B33",
        background2: "#0D1226",
        soft: "#1E2340",
        text: "#F4EFE4",
        textSoft: "#C9CEE8",
        textStrong: "#FFFCF6"
    }
};

export function getInvitationThemeConfig(templateKey) {
    return THEMES[templateKey] || THEMES.lavender;
}

export default function Invitacion() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [invitation, setInvitation] = useState(demoInvitation);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const isDemoScreen = slug === "demo" || slug === "demo-xv" || slug === "demo-15" || slug === "demo-quince" || slug === "xv-demo";
    const demoMode = slug === "demo-xv" || slug === "demo-15" || slug === "demo-quince" || slug === "xv-demo" ? "xv" : "normal";

    const handleDemoSwitch = (nextMode) => {
        if (nextMode === "xv") {
            navigate("/invitacion/demo-xv", { replace: true });
            return;
        }

        navigate("/invitacion/demo", { replace: true });
    };

    useEffect(() => {
        let active = true;

        async function loadData() {
            setIsLoading(true);
            setNotFound(false);

            const safeSlug = String(slug || "").trim();

            if (!safeSlug) {
                if (active) {
                    setInvitation(demoInvitation);
                    setNotFound(false);
                    setIsLoading(false);
                }
                return;
            }

            if (safeSlug === "demo") {
                if (active) {
                    setInvitation(demoInvitation);
                    setNotFound(false);
                    setIsLoading(false);
                }
                return;
            }

            if (["demo-xv", "demo-15", "demo-quince", "xv-demo"].includes(safeSlug)) {
                if (active) {
                    setInvitation(xvDemoInvitation);
                    setNotFound(false);
                    setIsLoading(false);
                }
                return;
            }

            const nextInvitation = await loadInvitationBySlug(safeSlug);

            if (active) {
                if (!nextInvitation) {
                    setInvitation(null);
                    setNotFound(true);
                    setIsLoading(false);
                    return;
                }

                setInvitation(nextInvitation);
                setNotFound(false);
                setIsLoading(false);
            }
        }

        loadData();

        return () => {
            active = false;
        };
    }, [slug]);

    if (!isLoading && notFound) {
        return (
            <NotFoundPage
                title="La invitación no existe"
                description="No encontramos una invitación asociada a esta URL. Revisá el enlace o volvé al inicio para crear una nueva invitación."
            />
        );
    }

    const invitationTheme = getInvitationThemeConfig(invitation?.template || "lavender");
    const isXvEvent = /(xv|quince|15)/i.test(String(invitation?.eventType || ""));
    const isXvTheme = String(invitation?.template || "").toLowerCase() === "xv";
    const showDressCode = Boolean(invitation?.showDressCode ?? isXvEvent);
    const showPhotoAlbum = Boolean(invitation?.showPhotoAlbum ?? Boolean(invitation?.googlePhotosUrl));

    function isAppleDevice() {
        const userAgent = navigator.userAgent || navigator.vendor || "";

        return /iPhone|iPad|iPod/.test(userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    }

    function createICS({ invitation }) {
        const start = new Date(`${invitation.date}T${invitation.timeStart || invitation.time || "21:00"}:00`);
        const end = new Date(start.getTime() + 5 * 60 * 60 * 1000);

        const formatICSDate = (date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
        const escapeICS = (text = "") => String(text).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

        const ics = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//mis15//Invitacion//ES",
            "CALSCALE:GREGORIAN",
            "BEGIN:VEVENT",
            `UID:mis15-${invitation.date}-${invitation.timeStart || invitation.time}@mis15.com`,
            `DTSTAMP:${formatICSDate(new Date())}`,
            `DTSTART:${formatICSDate(start)}`,
            `DTEND:${formatICSDate(end)}`,
            `SUMMARY:${escapeICS(`${invitation.eventType || "Evento"} ${invitation.name}`)}`,
            `LOCATION:${escapeICS(invitation.address || "")}`,
            `DESCRIPTION:${escapeICS(`${invitation.eventType || "Evento"} de ${invitation.name}`)}`,
            "END:VEVENT",
            "END:VCALENDAR"
        ].join("\r\n");

        const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${(invitation.eventType || "Evento").replace(/\s+/g, "-")}-${invitation.name}.ics`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function openGoogleCalendar({ invitation }) {
        const start = new Date(`${invitation.date}T${invitation.timeStart || invitation.time || "21:00"}:00`);
        const end = new Date(start.getTime() + 5 * 60 * 60 * 1000);

        const formatGoogleDate = (date) => {
            return (
                date.getFullYear() +
                String(date.getMonth() + 1).padStart(2, "0") +
                String(date.getDate()).padStart(2, "0") +
                "T" +
                String(date.getHours()).padStart(2, "0") +
                String(date.getMinutes()).padStart(2, "0") +
                "00"
            );
        };

        const startFormatted = formatGoogleDate(start);
        const endFormatted = formatGoogleDate(end);

        const url =
            "https://calendar.google.com/calendar/render" +
            "?action=TEMPLATE" +
            `&text=${encodeURIComponent(`${invitation.eventType || "Evento"} ${invitation.name}`)}` +
            `&dates=${startFormatted}/${endFormatted}` +
            `&location=${encodeURIComponent(invitation.address || "")}` +
            `&details=${encodeURIComponent(`${invitation.eventType || "Evento"} de ${invitation.name}`)}`;

        window.open(url, "_blank", "noopener,noreferrer");
    }

    const addToCalendar = () => {
        if (isAppleDevice()) {
            createICS({ invitation });
        } else {
            openGoogleCalendar({ invitation });
        }
    };

    const scrollToCountdown = () => {
        const target = document.getElementById("countdown-section");

        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    };

    if (isLoading) {
        return <main className="center-page"><h1>Cargando invitación...</h1></main>;
    }

    return (
        <main
            className={`public-invitation${isXvTheme ? " xv-theme" : ""}`}
            style={
                isXvTheme
                    ? {
                        "--invite-primary": invitationTheme.primary,
                        "--invite-gold": invitationTheme.gold,
                        "--invite-secondary": invitationTheme.secondary,
                        "--invite-background": invitationTheme.background,
                        "--invite-background-2": invitationTheme.background2,
                        "--invite-soft": invitationTheme.soft,
                        "--invite-text": invitationTheme.text,
                        "--invite-text-soft": invitationTheme.textSoft,
                        "--invite-text-strong": invitationTheme.textStrong
                    }
                    : {
                        "--invite-primary": invitationTheme.primary,
                        "--invite-secondary": "#F4F0FF",
                        "--invite-background": "#FFFFFF",
                        "--invite-soft": "#F8F6FC",
                        "--invite-text": "#302A43"
                    }
            }
        >
            {isDemoScreen && (
                <div className="demo-switch-wrap">
                    <div className="demo-switch-panel">
                        <div className="demo-switch" role="tablist" aria-label="Seleccionar demo">
                            <button
                                type="button"
                                className={`demo-switch-option ${demoMode === "normal" ? "active" : ""}`}
                                onClick={() => handleDemoSwitch("normal")}
                            >
                                Normal
                            </button>
                            <button
                                type="button"
                                className={`demo-switch-option ${demoMode === "xv" ? "active" : ""}`}
                                onClick={() => handleDemoSwitch("xv")}
                            >
                                XV
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <section className="invitation-cover">
                <div className="cover-decoration cover-decoration-one" />
                <div className="cover-decoration cover-decoration-two" />

                {isXvTheme && (
                    <>
                        <div className="xv-disco">
                            <div className="xv-disco-string" />
                            <div className="xv-disco-ball" />
                            <span className="xv-sparkle" />
                            <span className="xv-sparkle" />
                            <span className="xv-sparkle" />
                            <span className="xv-sparkle" />
                            <span className="xv-sparkle" />
                            <span className="xv-sparkle" />
                            <span className="xv-sparkle" />
                            <span className="xv-sparkle" />
                        </div>
                        <div className="xv-disco-beam" />
                        <div className="xv-disco-beam" />
                        <div className="xv-disco-beam" />

                        <svg className="xv-flowers xv-flowers-left" viewBox="0 0 168 168" aria-hidden="true">
                            <g fill="#3a5a3f">
                                <ellipse cx="22" cy="158" rx="2.6" ry="38" transform="rotate(18 22 158)" />
                                <ellipse cx="56" cy="164" rx="2.2" ry="30" transform="rotate(-12 56 164)" />
                                <ellipse cx="8" cy="150" rx="1.8" ry="22" transform="rotate(38 8 150)" />
                                <path d="M24 128 Q36 112 24 96" stroke="#3a5a3f" strokeWidth="2" fill="none" />
                                <path d="M50 132 Q40 118 50 104" stroke="#3a5a3f" strokeWidth="1.6" fill="none" />
                            </g>
                            <g fill="#8B203A">
                                <ellipse cx="42" cy="122" rx="20" ry="11" transform="rotate(15 42 122)" />
                                <ellipse cx="24" cy="104" rx="20" ry="11" transform="rotate(-28 24 104)" />
                                <ellipse cx="16" cy="136" rx="17" ry="10" transform="rotate(62 16 136)" />
                                <ellipse cx="52" cy="142" rx="16" ry="9" transform="rotate(95 52 142)" />
                                <circle cx="32" cy="123" r="8.5" fill="#D9B26B" />
                            </g>
                            <g fill="#F6ECE2">
                                <ellipse cx="70" cy="108" rx="12" ry="7" transform="rotate(-20 70 108)" />
                                <ellipse cx="78" cy="126" rx="11" ry="6.5" transform="rotate(30 78 126)" />
                                <ellipse cx="60" cy="90" rx="10" ry="6" transform="rotate(-46 60 90)" />
                                <circle cx="72" cy="116" r="4.6" fill="#8B203A" />
                                <circle cx="58" cy="93" r="3.6" fill="#D9B26B" />
                            </g>
                            <g fill="#8B203A" opacity=".85">
                                <ellipse cx="96" cy="94" rx="9" ry="5.5" transform="rotate(-10 96 94)" />
                                <circle cx="96" cy="94" r="3" fill="#D9B26B" />
                            </g>
                            <circle cx="92" cy="74" r="2.8" fill="#D9B26B" />
                            <circle cx="106" cy="60" r="1.8" fill="#D9B26B" />
                            <circle cx="112" cy="82" r="1.4" fill="#F6ECE2" />
                        </svg>

                        <svg className="xv-flowers xv-flowers-right" viewBox="0 0 168 168" aria-hidden="true">
                            <g fill="#3a5a3f">
                                <ellipse cx="22" cy="158" rx="2.6" ry="38" transform="rotate(18 22 158)" />
                                <ellipse cx="56" cy="164" rx="2.2" ry="30" transform="rotate(-12 56 164)" />
                                <ellipse cx="8" cy="150" rx="1.8" ry="22" transform="rotate(38 8 150)" />
                                <path d="M24 128 Q36 112 24 96" stroke="#3a5a3f" strokeWidth="2" fill="none" />
                                <path d="M50 132 Q40 118 50 104" stroke="#3a5a3f" strokeWidth="1.6" fill="none" />
                            </g>
                            <g fill="#8B203A">
                                <ellipse cx="42" cy="122" rx="20" ry="11" transform="rotate(15 42 122)" />
                                <ellipse cx="24" cy="104" rx="20" ry="11" transform="rotate(-28 24 104)" />
                                <ellipse cx="16" cy="136" rx="17" ry="10" transform="rotate(62 16 136)" />
                                <ellipse cx="52" cy="142" rx="16" ry="9" transform="rotate(95 52 142)" />
                                <circle cx="32" cy="123" r="8.5" fill="#D9B26B" />
                            </g>
                            <g fill="#F6ECE2">
                                <ellipse cx="70" cy="108" rx="12" ry="7" transform="rotate(-20 70 108)" />
                                <ellipse cx="78" cy="126" rx="11" ry="6.5" transform="rotate(30 78 126)" />
                                <ellipse cx="60" cy="90" rx="10" ry="6" transform="rotate(-46 60 90)" />
                                <circle cx="72" cy="116" r="4.6" fill="#8B203A" />
                                <circle cx="58" cy="93" r="3.6" fill="#D9B26B" />
                            </g>
                            <g fill="#8B203A" opacity=".85">
                                <ellipse cx="96" cy="94" rx="9" ry="5.5" transform="rotate(-10 96 94)" />
                                <circle cx="96" cy="94" r="3" fill="#D9B26B" />
                            </g>
                            <circle cx="92" cy="74" r="2.8" fill="#D9B26B" />
                            <circle cx="106" cy="60" r="1.8" fill="#D9B26B" />
                            <circle cx="112" cy="82" r="1.4" fill="#F6ECE2" />
                        </svg>

                        <svg className="xv-flowers xv-flowers-topleft" viewBox="0 0 100 100" aria-hidden="true">
                            <g fill="#3a5a3f"><path d="M10 90 Q20 60 8 30" stroke="#3a5a3f" strokeWidth="2" fill="none" /></g>
                            <g fill="#8B203A">
                                <ellipse cx="16" cy="34" rx="12" ry="7" transform="rotate(20 16 34)" />
                                <ellipse cx="6" cy="20" rx="11" ry="6.5" transform="rotate(-30 6 20)" />
                                <circle cx="12" cy="27" r="4.5" fill="#D9B26B" />
                            </g>
                            <g fill="#F6ECE2">
                                <ellipse cx="32" cy="14" rx="9" ry="5.5" transform="rotate(-15 32 14)" />
                                <circle cx="32" cy="14" r="3.4" fill="#8B203A" />
                            </g>
                        </svg>

                        <svg className="xv-flowers xv-flowers-topright" viewBox="0 0 100 100" aria-hidden="true">
                            <g fill="#3a5a3f"><path d="M10 90 Q20 60 8 30" stroke="#3a5a3f" strokeWidth="2" fill="none" /></g>
                            <g fill="#8B203A">
                                <ellipse cx="16" cy="34" rx="12" ry="7" transform="rotate(20 16 34)" />
                                <ellipse cx="6" cy="20" rx="11" ry="6.5" transform="rotate(-30 6 20)" />
                                <circle cx="12" cy="27" r="4.5" fill="#D9B26B" />
                            </g>
                            <g fill="#F6ECE2">
                                <ellipse cx="32" cy="14" rx="9" ry="5.5" transform="rotate(-15 32 14)" />
                                <circle cx="32" cy="14" r="3.4" fill="#8B203A" />
                            </g>
                        </svg>

                        <span className="xv-petal" style={{ left: "18%", width: "9px", height: "6px", background: "#8B203A", animationDuration: "9s", animationDelay: "0s" }} />
                        <span className="xv-petal" style={{ left: "36%", width: "7px", height: "5px", background: "#D9B26B", animationDuration: "11s", animationDelay: "2.5s" }} />
                        <span className="xv-petal" style={{ left: "58%", width: "8px", height: "6px", background: "#F6ECE2", animationDuration: "10s", animationDelay: "4.5s" }} />
                        <span className="xv-petal" style={{ left: "74%", width: "7px", height: "5px", background: "#8B203A", animationDuration: "8.5s", animationDelay: "1.2s" }} />
                        <span className="xv-petal" style={{ left: "87%", width: "6px", height: "4.5px", background: "#D9B26B", animationDuration: "12s", animationDelay: "6s" }} />
                        <span className="xv-petal" style={{ left: "12%", width: "6px", height: "4.5px", background: "#F6ECE2", animationDuration: "9.5s", animationDelay: "3.4s" }} />
                    </>
                )}

                <div className="cover-content">
                    <span className="cover-kicker">ESTÁS INVITADO/A</span>
                    <div className="cover-xv">{(invitation.eventType || "Evento")}</div>

                    <h1>{invitation.name}</h1>
                    <p></p>

                    <div className="cover-date">
                        {new Date(`${invitation.date}T12:00:00`).toLocaleDateString("es-AR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        })}
                    </div>

                    <div className="cover-time">
                        {invitation.timeStart || invitation.time || "21:00"} — {invitation.timeEnd || "23:00"} hs
                    </div>



                    <button className="calendar-button" onClick={addToCalendar}>
                        <HugeiconsIcon icon={Calendar02Icon} size={17} />
                        Guardar fecha
                    </button>

                    <button
                        type="button"
                        className="cover-arrow-button"
                        aria-label="Ir a cuánto falta"
                        onClick={scrollToCountdown}
                    >
                        <HugeiconsIcon icon={ChevronDown} className="cover-arrow" size={20} />
                    </button>
                </div>
            </section>

            

            <Countdown
                id="countdown-section"
                date={invitation.date}
                timeStart={invitation.timeStart || invitation.time || "21:00"}
                timeEnd={invitation.timeEnd || "23:00"}
            />

            <section className="invitation-section location-section">
                <div className="section-content">
                    <span className="section-kicker">EL LUGAR</span>
                    <h2>Dónde es</h2>

                    <div className="location-card">
                        <div className="location-info">
                            <div className="round-icon">
                                <HugeiconsIcon icon={PinLocation03Icon} size={22} />
                            </div>

                            <h3>{invitation.venue || "Salón"}</h3>
                            <p>{invitation.address || "Dirección por confirmar"}</p>

                            {invitation.mapsUrl && (
                                <a href={invitation.mapsUrl} target="_blank" rel="noreferrer" className="secondary-button">
                                    Cómo llegar
                                    <HugeiconsIcon icon={LinkCircleIcon} size={15} />
                                </a>
                            )}
                        </div>

                        <div className="location-decoration">
                            <HugeiconsIcon icon={PinLocation02Icon} size={60} />
                        </div>
                    </div>
                </div>
            </section>

            {showDressCode && (
                <section className="dress-section">
                    <div className="dress-content">
                        <span className="section-kicker">DRESS CODE</span>
                        <h2>{invitation.dressCode || "Elegante"}</h2>
                        <p>{invitation.dressDescription || "Elegí tu mejor look para acompañarnos."}</p>
                        {invitation.dressColorsNotAllowed && (
                            <div className="dress-colors-not-allowed">
                                <strong>Colores no permitidos</strong>
                                <span>{invitation.dressColorsNotAllowed}</span>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {showPhotoAlbum && invitation.googlePhotosUrl && (
                <section className="invitation-section photo-album-section">
                    <div className="section-content">
                        <span className="section-kicker">ÁLBUM DE FOTOS</span>
                        <h2>Reviví este momento</h2>
                        <p>
                            Sumá fotos de la fiesta, de los momentos más lindos y de esta noche inolvidable.
                        </p>

                        <a
                            href={invitation.googlePhotosUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="secondary-button photo-album-button"
                            onClick={(event) => {
                                if (!invitation.googlePhotosUrl) {
                                    event.preventDefault();
                                }
                            }}
                        >
                            <span>Ver álbum</span>
                            <HugeiconsIcon icon={Album01FreeIcons} size={14} />
                        </a>
                    </div>
                </section>
            )
            }

            <section className="rsvp-section">
                <div className="rsvp-card">
                    <h2>Confirmar asistencia</h2>
                    <p className="rsvp-description">
                        Confirmá tu asistencia. También podés indicarnos si necesitás que tengamos en cuenta alguna alergia o restricción alimentaria.
                    </p>

                    <RSVPForm
                        slug={slug}
                        name={invitation.name}
                        requireAgeConfirmation={Boolean(invitation.requireAgeConfirmation)}
                    />
                </div>
            </section>

            {Boolean(invitation.showGiftSection) && (
                <GiftSection
                    alias={invitation.alias}
                    cbu={invitation.cbu}
                    text={"Lo más importante es compartir este momento con vos. Si además querés hacerme un regalo, podés hacerlo por estos medios."}
                />
            )}

          

            <footer className="invitation-footer">
                <img
                    src="/favicon-32.png"
                    alt={invitation.eventType || "Evento"}
                    className="event-type-icon"
                />
                <p>Gracias por ser parte de este momento.</p>
                <small>{invitation.name} · {invitation.eventType || "Evento"}</small>

                <div className="button-crear">
                    <Link to="/" className="home-secondary">
                        Crear la tuya
                    </Link>
                </div>
            </footer>
        </main >
    );
}