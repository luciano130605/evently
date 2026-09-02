import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar02Icon, ChevronDown } from "@hugeicons/core-free-icons";
import "./Plantilla.css"

export default function NormalCover({ invitation, onAddToCalendar, onScrollToCountdown }) {
    return (
        <section className="invitation-cover">
            <div className="cover-decoration cover-decoration-one" />
            <div className="cover-decoration cover-decoration-two" />

            <div className="cover-content">
                <span className="cover-kicker">ESTÁS INVITADO/A</span>
                <div className="cover-xv">{invitation.eventType || "Evento"}</div>

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

                <button className="calendar-button" onClick={onAddToCalendar}>
                    <HugeiconsIcon icon={Calendar02Icon} size={17} />
                    Guardar fecha
                </button>

                <button
                    type="button"
                    className="cover-arrow-button"
                    aria-label="Ir a cuánto falta"
                    onClick={onScrollToCountdown}
                >
                    <HugeiconsIcon icon={ChevronDown} className="cover-arrow" size={20} />
                </button>
            </div>
        </section>
    );
}