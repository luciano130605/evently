import { useEffect, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
    Calendar02Icon,
    Clock01Icon
} from "@hugeicons/core-free-icons";

function getTimeRemaining(date, time) {
    const target = new Date(
        `${date}T${time}:00`
    ).getTime();

    const now = Date.now();

    const difference = Math.max(
        0,
        target - now
    );

    return {
        days: Math.floor(
            difference / (1000 * 60 * 60 * 24)
        ),
        hours:
            Math.floor(
                difference / (1000 * 60 * 60)
            ) % 24,
        minutes:
            Math.floor(
                difference / (1000 * 60)
            ) % 60,
        seconds:
            Math.floor(difference / 1000) % 60
    };
}

function createICS({
    date,
    timeStart,
    timeEnd
}) {
    const start = new Date(
        `${date}T${timeStart}:00`
    );

    let end = new Date(
        `${date}T${timeEnd}:00`
    );

    // Si termina después de medianoche
    if (end <= start) {
        end.setDate(end.getDate() + 1);
    }

    const formatICSDate = (value) => {
        return value
            .toISOString()
            .replace(/[-:]/g, "")
            .replace(/\.\d{3}/, "");
    };

    const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//mis15//Invitacion//ES",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",

        `UID:mis15-${date}-${timeStart}@mis15.com`,

        `DTSTAMP:${formatICSDate(new Date())}`,

        `DTSTART:${formatICSDate(start)}`,

        `DTEND:${formatICSDate(end)}`,

        "SUMMARY:Mis 15",

        "DESCRIPTION:Te esperamos para celebrar una noche inolvidable.",

        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob(
        [ics],
        {
            type: "text/calendar;charset=utf-8"
        }
    );

    const url = URL.createObjectURL(blob);

    window.location.href = url;

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 5000);
}

export default function Countdown({
    id,
    date,
    timeStart,
    timeEnd
}) {
    const [remaining, setRemaining] =
        useState(
            () =>
                getTimeRemaining(
                    date,
                    timeStart
                )
        );

    useEffect(() => {
        const interval = setInterval(() => {
            setRemaining(
                getTimeRemaining(
                    date,
                    timeStart
                )
            );
        }, 1000);

        return () =>
            clearInterval(interval);
    }, [date, timeStart]);

    const values = [
        {
            value: remaining.days,
            label: "DÍAS"
        },
        {
            value: remaining.hours,
            label: "HORAS"
        },
        {
            value: remaining.minutes,
            label: "MINUTOS"
        },
        {
            value: remaining.seconds,
            label: "SEGUNDOS"
        }
    ];

    const handleCalendar = () => {
        createICS({
            date,
            timeStart,
            timeEnd
        });
    };

    return (
        <section id={id} className="countdown-section">

            <div className="section-heading">
                <span className="section-kicker">
                    PRÓXIMO EVENTO
                </span>

                <h2>
                    Cuánto falta
                </h2>

                <p>
                    Cada segundo nos acerca
                    a una noche inolvidable.
                </p>
            </div>

            <div className="countdown-grid">
                {values.map((item) => (
                    <div
                        className="countdown-item"
                        key={item.label}
                    >
                        <strong>
                            {String(
                                item.value
                            ).padStart(2, "0")}
                        </strong>

                        <span>
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>

            <div className="countdown-date">
                <HugeiconsIcon
                    icon={Clock01Icon}
                    size={16}
                />

                <span>
                    {new Date(
                        `${date}T12:00:00`
                    ).toLocaleDateString(
                        "es-AR",
                        {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        }
                    )}

                    {" · "}

                    {timeStart} — {timeEnd} hs
                </span>
            </div>

            <button
                type="button"
                className="primary-button"
                onClick={handleCalendar}
            >
                <HugeiconsIcon
                    icon={Calendar02Icon}
                    size={18}
                />

                Agregar al calendario
            </button>

        </section>
    );
}
