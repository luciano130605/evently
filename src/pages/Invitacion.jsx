import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import Countdown from "../components/Countdown";
import RSVPForm from "../components/RSVPForm";
import GiftSection from "../components/GiftSection";

import { demoInvitation } from "../data/demoInvitation";
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
    }
};

export default function Invitacion() {
    const { slug } = useParams();
    const [invitation, setInvitation] = useState(demoInvitation);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function loadData() {
            setIsLoading(true);
            const nextInvitation = await loadInvitationBySlug(slug);

            if (active) {
                setInvitation(nextInvitation || demoInvitation);
                setIsLoading(false);
            }
        }

        loadData();

        return () => {
            active = false;
        };
    }, [slug]);

    const invitationTheme = THEMES[invitation.template] || THEMES.lavender;

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
            `SUMMARY:${escapeICS(`XV ${invitation.name}`)}`,
            `LOCATION:${escapeICS(invitation.address || "")}`,
            `DESCRIPTION:${escapeICS(`Celebración de los 15 años de ${invitation.name}`)}`,
            "END:VEVENT",
            "END:VCALENDAR"
        ].join("\r\n");

        const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `XV-${invitation.name}.ics`;

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
            `&text=${encodeURIComponent(`XV ${invitation.name}`)}` +
            `&dates=${startFormatted}/${endFormatted}` +
            `&location=${encodeURIComponent(invitation.address || "")}` +
            `&details=${encodeURIComponent(`Celebración de los 15 años de ${invitation.name}`)}`;

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
            className="public-invitation"
            style={{
                "--invite-primary": invitationTheme.primary,
                "--invite-secondary": "#F4F0FF",
                "--invite-background": "#FFFFFF",
                "--invite-soft": "#F8F6FC",
                "--invite-text": "#302A43"
            }}
        >
            <section className="invitation-cover">
                <div className="cover-decoration cover-decoration-one" />
                <div className="cover-decoration cover-decoration-two" />

                <div className="cover-content">
                    <span className="cover-kicker">ESTÁS INVITADO/A</span>
                    <div className="cover-xv">XV</div>

                    <h1>{invitation.name}</h1>
                    <p>{"Mis 15"}</p>

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
                    <h2>Donde es</h2>

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

            {invitation.googlePhotosUrl && (
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

                    <RSVPForm slug={slug} name={invitation.name} />
                </div>
            </section>

            <GiftSection
                alias={invitation.alias}
                cbu={invitation.cbu}
                text={"Lo más importante es compartir este momento con vos. Si además querés hacerme un regalo, podés hacerlo por estos medios."}
            />

            <section className="invitation-cta">



            </section>

            <footer className="invitation-footer">
                <span>XV</span>
                <p>Gracias por ser parte de este momento.</p>
                <small>{invitation.name} · Mis 15 años</small>

                <div className="button-crear">
                    <Link to="/" className="home-secondary">
                        Crear la tuya
                    </Link>
                </div>
            </footer>
        </main >
    );
}