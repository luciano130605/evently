import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import Countdown from "../components/Countdown";
import RSVPForm from "../components/RSVPForm";
import GiftSection from "../components/GiftSection";
import NotFoundPage from "./NotFound";
import RoseGardenCover from "../components/plantillas/RoseGardenCover";
import NormalCover from "../components/plantillas/NormalCover";
import XVCover from "../components/plantillas/XVCover";
import { demoInvitation, gardenDemoInvitation, xvDemoInvitation } from "../data/demoInvitation";
import { loadInvitationBySlug, loadRsvpsBySlug } from "../lib/invitations";
import { HugeiconsIcon } from "@hugeicons/react";
import { Album01FreeIcons, LinkCircleIcon, PinLocation02Icon, PinLocation03Icon, TieIcon } from "@hugeicons/core-free-icons";

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
    },
    garden: {
        primary: "#A9707A",
        secondary: "#F3E4E9",
        background: "#FBF3F1",
        soft: "#F7E9E6",
        text: "#5C3A3E"
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
    const [confirmedCount, setConfirmedCount] = useState(0);
    const isDemoScreen = slug === "demo" || slug === "demo-xv" || slug === "demo-15" || slug === "demo-quince" || slug === "xv-demo" || slug === "demo-garden";

    const demoMode = ["demo-xv", "demo-15", "demo-quince", "xv-demo"].includes(slug)
        ? "xv"
        : slug === "demo-garden"
            ? "garden"
            : "normal";


    const handleDemoSwitch = (nextMode) => {
        if (nextMode === "xv") {
            navigate("/invitacion/demo-xv", { replace: true });
            return;
        }

        if (nextMode === "garden") {
            navigate("/invitacion/demo-garden", { replace: true });
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

            if (safeSlug === "demo-garden") {
                if (active) {
                    setInvitation(gardenDemoInvitation);
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

                if (nextInvitation.maxGuests) {
                    const rsvps = await loadRsvpsBySlug(safeSlug);
                    if (active) setConfirmedCount(rsvps.length);
                }

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
    const isGardenTheme = String(invitation?.template || "").toLowerCase() === "garden";
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
            className={`public-invitation${isXvTheme ? " xv-theme" : ""}${isGardenTheme ? " garden-theme" : ""}`}
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
                                1
                            </button>
                            <button
                                type="button"
                                className={`demo-switch-option ${demoMode === "garden" ? "active" : ""}`}
                                onClick={() => handleDemoSwitch("garden")}
                            >
                                2
                            </button>
                            <button
                                type="button"
                                className={`demo-switch-option ${demoMode === "xv" ? "active" : ""}`}
                                onClick={() => handleDemoSwitch("xv")}
                            >
                                3
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {isGardenTheme ? (
                <RoseGardenCover
                    invitation={invitation}
                    onAddToCalendar={addToCalendar}
                    onScrollToCountdown={scrollToCountdown}
                />
            ) : isXvTheme ? (
                <XVCover
                    invitation={invitation}
                    onAddToCalendar={addToCalendar}
                    onScrollToCountdown={scrollToCountdown}
                />
            ) : (
                <NormalCover
                    invitation={invitation}
                    onAddToCalendar={addToCalendar}
                    onScrollToCountdown={scrollToCountdown}
                />
            )}


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

                            <h3>{invitation.venue || ""}</h3>
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
                        <h2>{invitation.dressCode || ""}</h2>
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
                        isFull={Boolean(invitation.maxGuests) && confirmedCount >= Number(invitation.maxGuests)}
                        sendQr={Boolean(invitation.sendQr)}
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