import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar02Icon, ChevronDown } from "@hugeicons/core-free-icons";

/* ---------------------------------------------------------
   Rosa SVG — más orgánica y elegante
--------------------------------------------------------- */

function Rose({ x = 0, y = 0, scale = 1, flip = false }) {
    return (
        <g
            transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}
        >
            {/* Hojas */}
            <path
                d="M8 48 C-4 38 -2 26 12 24 C18 34 17 42 8 48Z"
                fill="#91A98A"
            />
            <path
                d="M34 40 C39 27 50 25 57 31 C52 42 43 46 34 40Z"
                fill="#819C7D"
            />

            {/* Rosa exterior */}
            <path
                d="M20 34
                   C5 31 3 19 10 11
                   C17 3 29 5 35 12
                   C43 5 55 9 58 18
                   C61 28 52 37 41 40
                   C34 44 25 41 20 34Z"
                fill="#D59AA5"
            />

            {/* Pétalos claros */}
            <path
                d="M15 27
                   C8 21 10 12 17 10
                   C24 8 31 13 31 20
                   C25 17 19 19 15 27Z"
                fill="#E7BEC5"
            />

            <path
                d="M31 20
                   C29 11 37 7 44 11
                   C51 15 49 24 42 29
                   C43 21 38 18 31 20Z"
                fill="#E8C1C7"
            />

            <path
                d="M19 30
                   C21 23 27 19 34 21
                   C40 23 42 29 38 34
                   C32 39 23 37 19 30Z"
                fill="#C98592"
            />

            {/* Centro enrollado */}
            <path
                d="M25 29
                   C22 25 25 21 30 21
                   C35 21 38 25 36 29
                   C34 33 29 34 26 31
                   C24 29 25 26 28 25
                   C31 24 33 26 32 28
                   C31 30 28 30 28 28"
                stroke="#A96D78"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
            />

            {/* Detalles suaves de pétalos */}
            <path
                d="M12 18 C16 14 21 14 25 17"
                stroke="#C17F8A"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.7"
            />

            <path
                d="M42 14 C47 17 48 21 46 25"
                stroke="#C17F8A"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.7"
            />

            {/* Tallo */}
            <path
                d="M31 39 C29 49 25 58 20 67"
                stroke="#789471"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
            />

            {/* Hoja inferior */}
            <path
                d="M24 53
                   C13 48 7 53 9 62
                   C16 64 22 61 24 53Z"
                fill="#8EA786"
            />

            <path
                d="M22 54 C17 56 14 58 10 60"
                stroke="#708C69"
                strokeWidth="0.8"
                fill="none"
            />
        </g>
    );
}


function RoseDivider() {
    return (
        <svg
            className="garden-divider"
            viewBox="0 0 220 80"
            fill="none"
            aria-hidden="true"
        >
            {/* tallos */}
            <path
                d="M20 46 C55 62 78 62 110 40 C142 62 165 62 200 46"
                stroke="#829B78"
                strokeWidth="1.8"
                strokeLinecap="round"
            />

            {/* hojas */}
            <path
                d="M58 55 C47 43 38 45 34 51 C41 62 50 63 58 55Z"
                fill="#9CAF94"
            />

            <path
                d="M162 55 C173 43 182 45 186 51 C179 62 170 63 162 55Z"
                fill="#9CAF94"
            />

            {/* rosa central más grande */}
            <Rose
                x={83}
                y={-2}
                scale={0.8}
            />

            {/* pequeños pétalos */}
            <circle
                cx="42"
                cy="47"
                r="2.8"
                fill="#D9A0AA"
            />

            <circle
                cx="178"
                cy="47"
                r="2.8"
                fill="#D9A0AA"
            />
        </svg>
    );
}

/* ---------------------------------------------------------
   Enredadera lateral
--------------------------------------------------------- */

function RoseVine({ side = "left" }) {
    return (
        <svg
            className={`garden-vine garden-vine-${side}`}
            viewBox="0 0 180 420"
            fill="none"
            aria-hidden="true"
        >
            <defs>
                <linearGradient
                    id={`vineGradient-${side}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                >
                    <stop offset="0" stopColor="#789471" />
                    <stop offset="1" stopColor="#A1B394" />
                </linearGradient>
            </defs>

            {/* tallo principal */}
            <path
                d="M20 5
                   C72 55 36 105 58 150
                   C80 195 25 225 48 275
                   C69 320 39 365 74 415"
                stroke={`url(#vineGradient-${side})`}
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
            />

            {/* ramitas */}
            <path
                d="M48 95 C30 82 18 79 7 84"
                stroke="#829B78"
                strokeWidth="1.4"
                strokeLinecap="round"
            />

            <path
                d="M52 180 C72 165 84 164 96 169"
                stroke="#829B78"
                strokeWidth="1.4"
                strokeLinecap="round"
            />

            <path
                d="M45 285 C27 272 14 271 4 277"
                stroke="#829B78"
                strokeWidth="1.4"
                strokeLinecap="round"
            />

            {/* rosas */}
            <Rose x={3} y={58} scale={0.72} />
            <Rose x={70} y={150} scale={0.55} flip />
            <Rose x={0} y={250} scale={0.66} />
            <Rose x={48} y={355} scale={0.48} flip />

            {/* hojas adicionales */}
            <path
                d="M28 120 C13 108 4 112 2 122 C12 129 21 128 28 120Z"
                fill="#8FA888"
            />

            <path
                d="M67 225 C81 213 91 216 93 226 C83 233 74 232 67 225Z"
                fill="#91A98A"
            />

            <path
                d="M43 335 C28 325 18 328 16 338 C27 345 36 343 43 335Z"
                fill="#819C7D"
            />
        </svg>
    );
}


export default function RoseGardenCover({
    invitation,
    onAddToCalendar,
    onScrollToCountdown
}) {
    const isXvEvent = /(xv|quince|15)/i.test(
        String(invitation?.eventType || "")
    );

    return (
        <section className="invitation-cover garden-cover">
            <RoseVine side="left" />
            <RoseVine side="right" />

            <div className="cover-content garden-cover-content">
                <span className="garden-kicker">
                    {isXvEvent
                        ? "ESTÁS INVITADO/A"
                        : "ESTÁS INVITADO/A"}
                </span>

                <div className="garden-xv">
                    {isXvEvent
                        ? "XV"
                        : invitation.eventType || "Evento"}
                </div>

                <h1 className="garden-name">
                    {invitation.name}
                </h1>

                <RoseDivider />

                <div className="garden-date">
                    {new Date(
                        `${invitation.date}T12:00:00`
                    ).toLocaleDateString("es-AR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    })}
                </div>

                <div className="garden-time">
                    {invitation.timeStart ||
                        invitation.time ||
                        "21:00"}{" "}
                    hs
                </div>

                <button
                    className="calendar-button garden-calendar-button"
                    onClick={onAddToCalendar}
                >
                    <HugeiconsIcon
                        icon={Calendar02Icon}
                        size={17}
                    />
                    Guardar fecha
                </button>

                <button
                    type="button"
                    className="cover-arrow-button garden-arrow-button"
                    aria-label="Ir a cuánto falta"
                    onClick={onScrollToCountdown}
                >
                    <HugeiconsIcon
                        icon={ChevronDown}
                        size={20}
                    />
                </button>
            </div>
        </section>
    );
}
