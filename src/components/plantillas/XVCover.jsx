import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar02Icon, ChevronDown } from "@hugeicons/core-free-icons";
import "./Plantilla.css"
/* =========================================================
   ROSA REALISTA
========================================================= */

function Rose({
    x = 0,
    y = 0,
    scale = 1,
    rotate = 0,
    variant = "burgundy",
}) {
    const palettes = {
        burgundy: {
            shadow: "#4A0F22",
            outer: "#72172F",
            mid: "#982844",
            light: "#C44D63",
            highlight: "#E08A98",
            center: "#F0C6A8",
        },
        gold: {
            shadow: "#8A642C",
            outer: "#B28743",
            mid: "#D2A85D",
            light: "#E5C986",
            highlight: "#F5E2B8",
            center: "#8B203A",
        },
        cream: {
            shadow: "#A89578",
            outer: "#D5C3A7",
            mid: "#E9DCCB",
            light: "#F5ECE0",
            highlight: "#FFF9F0",
            center: "#8B203A",
        },
    };

    const p = palettes[variant] || palettes.burgundy;

    return (
        <g
            transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}
            className="xv-rose"
        >
            <defs>
                <radialGradient id={`rose-${x}-${y}`} cx="38%" cy="32%">
                    <stop offset="0%" stopColor={p.highlight} />
                    <stop offset="35%" stopColor={p.light} />
                    <stop offset="72%" stopColor={p.mid} />
                    <stop offset="100%" stopColor={p.shadow} />
                </radialGradient>

                <linearGradient
                    id={`petal-${x}-${y}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                >
                    <stop offset="0%" stopColor={p.highlight} />
                    <stop offset="42%" stopColor={p.light} />
                    <stop offset="100%" stopColor={p.outer} />
                </linearGradient>
            </defs>

            {/* sombra inferior de la flor */}
            <ellipse
                cx="0"
                cy="7"
                rx="20"
                ry="14"
                fill="#000"
                opacity=".16"
                filter="blur(2px)"
            />

            {/* pétalos exteriores */}
            <g
                fill={`url(#rose-${x}-${y})`}
                stroke={p.shadow}
                strokeWidth=".35"
            >
                <path d="M0 1 C-18-12-27-3-23 9 C-20 19-8 24 2 17 C-6 11-7 5 0 1Z" />
                <path d="M1 1 C-10-20 1-27 11-21 C20-16 22-4 14 5 C9-2 5-2 1 1Z" />
                <path d="M2 2 C15-13 26-8 27 3 C28 14 19 21 8 18 C13 10 10 5 2 2Z" />
                <path d="M1 5 C18 5 20 16 13 22 C5 29-7 24-9 14 C-1 16 3 12 1 5Z" />
                <path d="M-1 4 C-8 20-19 19-23 11 C-27 2-20-7-10-8 C-10-1-7 2-1 4Z" />
            </g>

            {/* pliegues de pétalos */}
            <g
                fill="none"
                stroke={p.highlight}
                strokeWidth=".75"
                opacity=".45"
                strokeLinecap="round"
            >
                <path d="M-18 2 C-12 8-7 11-2 10" />
                <path d="M-8-16 C-3-8-2-3 1 1" />
                <path d="M11-13 C8-7 7-3 5 2" />
                <path d="M20 6 C13 7 9 9 5 13" />
                <path d="M-15 13 C-9 12-5 11-2 8" />
            </g>

            {/* segunda corona */}
            <g
                fill={`url(#petal-${x}-${y})`}
                stroke={p.shadow}
                strokeWidth=".3"
            >
                <path d="M0 2 C-11-9-18-4-16 5 C-14 12-7 16 0 12 C-5 8-4 4 0 2Z" />
                <path d="M1 2 C-5-11 2-17 9-13 C15-10 15-2 9 4 C6 0 4 0 1 2Z" />
                <path d="M2 3 C10-5 17-1 16 6 C15 13 9 15 3 11 C7 7 6 5 2 3Z" />
                <path d="M0 4 C5 10 1 16-5 15 C-11 14-12 8-8 4 C-4 7-2 7 0 4Z" />
            </g>

            {/* centro enrollado */}
            <path
                d="
                    M-5 2
                    C-8-3-4-8 1-7
                    C7-6 9 0 5 4
                    C2 7-4 6-5 2
                    C-6-1-2-3 1-2
                    C4-1 4 2 2 3
                    C0 4-2 3-1 1
                "
                fill="none"
                stroke={p.center}
                strokeWidth="2"
                strokeLinecap="round"
            />

            <circle
                cx="-1"
                cy="1"
                r="1.5"
                fill={p.center}
                opacity=".9"
            />
        </g>
    );
}


/* =========================================================
   CAPULLO
========================================================= */

function RoseBud({
    x = 0,
    y = 0,
    scale = 1,
    rotate = 0,
    color = "#8B203A",
}) {
    return (
        <g
            transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}
        >
            {/* sépalos */}
            <path
                d="M0 10 C-7 6-8 1-5-4 C-3 0 0 2 0 4 C1 1 4-1 7-4 C8 2 5 7 0 10Z"
                fill="#294832"
            />

            {/* capullo */}
            <path
                d="
                    M0 8
                    C-7 6-9 0-7-6
                    C-5-13 4-15 8-9
                    C12-3 7 6 0 8Z
                "
                fill={color}
            />

            {/* pétalo frontal */}
            <path
                d="M0 6 C-4 1-4-7 1-11 C5-8 6-1 3 5"
                fill="#C04A60"
                opacity=".65"
            />

            <path
                d="M-4-7 C-1-10 2-10 4-8"
                stroke="#E88B99"
                strokeWidth="1"
                fill="none"
                opacity=".7"
                strokeLinecap="round"
            />
        </g>
    );
}


/* =========================================================
   HOJA MÁS NATURAL
========================================================= */

function Leaf({
    x = 0,
    y = 0,
    scale = 1,
    rotate = 0,
    flip = false,
}) {
    return (
        <g
            transform={`
                translate(${x} ${y})
                rotate(${rotate})
                scale(${flip ? -scale : scale} ${scale})
            `}
        >
            <path
                d="
                    M0 0
                    C7-7 17-6 22 1
                    C17 10 7 13 0 0Z
                "
                fill="#31543A"
            />

            <path
                d="M1 0 C8 1 14 2 20 2"
                stroke="#193A27"
                strokeWidth=".8"
                fill="none"
                opacity=".9"
            />

            <path
                d="M7 1 L10-3 M11 2 L15-1 M15 2 L18 0"
                stroke="#527653"
                strokeWidth=".55"
                fill="none"
                opacity=".7"
            />

            <path
                d="
                    M2 0
                    C7-5 14-5 18-1
                "
                stroke="#6D936B"
                strokeWidth=".45"
                fill="none"
                opacity=".55"
            />
        </g>
    );
}


/* =========================================================
   PEQUEÑAS FLORES SILVESTRES
========================================================= */

function SmallFlower({
    x = 0,
    y = 0,
    scale = 1,
    color = "#F6ECE2",
}) {
    return (
        <g transform={`translate(${x} ${y}) scale(${scale})`}>
            <g fill={color}>
                <ellipse cy="-3.5" rx="2" ry="3.5" />
                <ellipse cy="3.5" rx="2" ry="3.5" />
                <ellipse cx="-3.5" rx="3.5" ry="2" />
                <ellipse cx="3.5" rx="3.5" ry="2" />
            </g>

            <circle r="1.8" fill="#D9B26B" />
        </g>
    );
}


/* =========================================================
   RAMO DE ESQUINA
   ========================================================= */

function CornerGarland({ className }) {
    return (
        <svg
            className={`xv-flowers ${className}`}
            viewBox="0 0 190 190"
            aria-hidden="true"
        >
            <defs>
                <filter id="flower-shadow">
                    <feDropShadow
                        dx="0"
                        dy="2"
                        stdDeviation="2"
                        floodColor="#000"
                        floodOpacity=".28"
                    />
                </filter>
            </defs>

            {/* tallos principales */}
            <g
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path
                    d="M5 188 C12 151 8 121 31 91 C43 75 55 58 65 28"
                    stroke="#294832"
                    strokeWidth="3"
                />

                <path
                    d="M20 184 C35 154 38 127 59 103 C76 83 92 66 105 42"
                    stroke="#31543A"
                    strokeWidth="2.2"
                />

                <path
                    d="M0 150 C25 137 41 120 50 96"
                    stroke="#3C6244"
                    strokeWidth="1.6"
                />
            </g>

            {/* hojas grandes */}
            <Leaf x={13} y={153} rotate={-72} scale={1.05} />
            <Leaf x={25} y={136} rotate={28} scale={.95} flip />
            <Leaf x={22} y={111} rotate={-78} scale={.9} />
            <Leaf x={42} y={120} rotate={34} scale={.82} flip />
            <Leaf x={48} y={94} rotate={-55} scale={.8} />
            <Leaf x={59} y={76} rotate={38} scale={.72} flip />
            <Leaf x={67} y={53} rotate={-48} scale={.7} />

            <Leaf x={78} y={99} rotate={-18} scale={.7} />
            <Leaf x={91} y={76} rotate={43} scale={.62} flip />

            {/* rosas principales */}
            <g filter="url(#flower-shadow)">
                <Rose
                    x={27}
                    y={153}
                    scale={1.5}
                    rotate={-12}
                    variant="burgundy"
                />

                <Rose
                    x={12}
                    y={126}
                    scale={1.08}
                    rotate={18}
                    variant="burgundy"
                />

                <Rose
                    x={48}
                    y={128}
                    scale={.92}
                    rotate={-20}
                    variant="cream"
                />

                <Rose
                    x={58}
                    y={99}
                    scale={.78}
                    rotate={15}
                    variant="burgundy"
                />

                <Rose
                    x={76}
                    y={75}
                    scale={.62}
                    rotate={-12}
                    variant="gold"
                />
            </g>

            {/* capullos */}
            <RoseBud
                x={8}
                y={98}
                scale={.7}
                rotate={-28}
                color="#A72D49"
            />

            <RoseBud
                x={73}
                y={112}
                scale={.62}
                rotate={24}
                color="#C04A60"
            />

            <RoseBud
                x={89}
                y={59}
                scale={.48}
                rotate={-15}
                color="#8B203A"
            />

            {/* flores pequeñas */}
            <SmallFlower x={6} y={77} scale={.8} />
            <SmallFlower x={82} y={91} scale={.55} color="#FFF8EC" />
            <SmallFlower x={99} y={48} scale={.45} color="#F6ECE2" />

            {/* ramitas finas */}
            <g
                fill="none"
                stroke="#5D7652"
                strokeWidth=".8"
                opacity=".75"
            >
                <path d="M31 103 C45 83 56 69 63 47" />
                <path d="M53 116 C70 99 84 82 93 61" />
                <path d="M18 143 C34 130 44 116 51 101" />
            </g>

            {/* puntitos decorativos */}
            <g fill="#D9B26B">
                <circle cx="103" cy="35" r="1.4" />
                <circle cx="91" cy="27" r="1" />
                <circle cx="108" cy="62" r=".8" />
                <circle cx="72" cy="38" r="1" />
            </g>
        </svg>
    );
}

function CornerGarlandR({ className }) {
    return (
        <svg
            className={`xv-flowers ${className}`}
            viewBox="0 0 190 190"
            aria-hidden="true"
        >
            <defs>
                <filter id="flower-shadow">
                    <feDropShadow
                        dx="0"
                        dy="2"
                        stdDeviation="2"
                        floodColor="#000"
                        floodOpacity=".28"
                    />
                </filter>
            </defs>

            {/* TODO el diseño espejado horizontalmente */}
            <g transform="translate(190 0) scale(-1 1)">

                {/* tallos principales */}
                <g
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path
                        d="M5 188 C12 151 8 121 31 91 C43 75 55 58 65 28"
                        stroke="#294832"
                        strokeWidth="3"
                    />
                    <path
                        d="M20 184 C35 154 38 127 59 103 C76 83 92 66 105 42"
                        stroke="#31543A"
                        strokeWidth="2.2"
                    />
                    <path
                        d="M0 150 C25 137 41 120 50 96"
                        stroke="#3C6244"
                        strokeWidth="1.6"
                    />
                </g>

                {/* hojas */}
                <Leaf x={13} y={153} rotate={-72} scale={1.05} />
                <Leaf x={25} y={136} rotate={28} scale={.95} flip />
                <Leaf x={22} y={111} rotate={-78} scale={.9} />
                <Leaf x={42} y={120} rotate={34} scale={.82} flip />
                <Leaf x={48} y={94} rotate={-55} scale={.8} />
                <Leaf x={59} y={76} rotate={38} scale={.72} flip />
                <Leaf x={67} y={53} rotate={-48} scale={.7} />
                <Leaf x={78} y={99} rotate={-18} scale={.7} />
                <Leaf x={91} y={76} rotate={43} scale={.62} flip />

                {/* rosas principales */}
                <g filter="url(#flower-shadow)">
                    <Rose
                        x={27}
                        y={153}
                        scale={1.5}
                        rotate={-12}
                        variant="burgundy"
                    />
                    <Rose
                        x={12}
                        y={126}
                        scale={1.08}
                        rotate={18}
                        variant="burgundy"
                    />
                    <Rose
                        x={48}
                        y={128}
                        scale={.92}
                        rotate={-20}
                        variant="cream"
                    />
                    <Rose
                        x={58}
                        y={99}
                        scale={.78}
                        rotate={15}
                        variant="burgundy"
                    />
                    <Rose
                        x={76}
                        y={75}
                        scale={.62}
                        rotate={-12}
                        variant="gold"
                    />
                </g>

                {/* capullos */}
                <RoseBud
                    x={8}
                    y={98}
                    scale={.7}
                    rotate={-28}
                    color="#A72D49"
                />

                <RoseBud
                    x={73}
                    y={112}
                    scale={.62}
                    rotate={24}
                    color="#C04A60"
                />

                <RoseBud
                    x={89}
                    y={59}
                    scale={.48}
                    rotate={-15}
                    color="#8B203A"
                />

                {/* flores pequeñas */}
                <SmallFlower x={6} y={77} scale={.8} />
                <SmallFlower
                    x={82}
                    y={91}
                    scale={.55}
                    color="#FFF8EC"
                />
                <SmallFlower
                    x={99}
                    y={48}
                    scale={.45}
                    color="#F6ECE2"
                />

                {/* ramitas finas */}
                <g
                    fill="none"
                    stroke="#5D7652"
                    strokeWidth=".8"
                    opacity=".75"
                >
                    <path d="M31 103 C45 83 56 69 63 47" />
                    <path d="M53 116 C70 99 84 82 93 61" />
                    <path d="M18 143 C34 130 44 116 51 101" />
                </g>

                {/* puntitos decorativos */}
                <g fill="#D9B26B">
                    <circle cx="103" cy="35" r="1.4" />
                    <circle cx="91" cy="27" r="1" />
                    <circle cx="108" cy="62" r=".8" />
                    <circle cx="72" cy="38" r="1" />
                </g>

            </g>
        </svg>
    );
}



export default function XVCover({ invitation, onAddToCalendar, onScrollToCountdown }) {

    const isXV = invitation?.eventType === "xv"
    return (
        <section className="invitation-cover">
            <div className="cover-decoration cover-decoration-one" />
            <div className="cover-decoration cover-decoration-two" />

            {/* halo dorado ambiental */}
            <div className="xv-ambient-glow" />

            {/* campo de destellos disperso por toda la portada */}
            <div className="xv-sparkle-field" aria-hidden="true">
                {Array.from({ length: 16 }).map((_, i) => (
                    <span
                        key={i}
                        className="xv-field-sparkle"
                        style={{
                            left: `${(i * 37) % 100}%`,
                            top: `${(i * 53) % 100}%`,
                            animationDelay: `${(i % 8) * 0.4}s`,
                            animationDuration: `${3 + (i % 5) * 0.6}s`,
                        }}
                    />
                ))}
            </div>

            <div className="xv-disco">
                <div className="xv-disco-string" />

                <div className="xv-disco-ball">
                    {/* brillo principal */}
                    <div className="xv-disco-glint" />

                    {/* luces internas del disco */}
                    <span className="disco-light l1" />
                    <span className="disco-light l2" />
                    <span className="disco-light l3" />
                    <span className="disco-light l4" />
                    <span className="disco-light l5" />
                    <span className="disco-light l6" />
                    <span className="disco-light l7" />
                    <span className="disco-light l8" />
                    <span className="disco-light l9" />
                    <span className="disco-light l10" />
                    <span className="disco-light l11" />
                    <span className="disco-light l12" />
                    <span className="disco-light l13" />
                    <span className="disco-light l14" />
                    <span className="disco-light l15" />
                    <span className="disco-light l16" />
                    <span className="disco-light l17" />
                    <span className="disco-light l18" />
                    <span className="disco-light l19" />
                    <span className="disco-light l20" />
                    <span className="disco-light l21" />
                    <span className="disco-light l22" />
                    <span className="disco-light l23" />
                    <span className="disco-light l24" />
                    <span className="disco-light l25" />
                    <span className="disco-light l26" />
                    <span className="disco-light l27" />
                    <span className="disco-light l28" />
                    <span className="disco-light l29" />
                    <span className="disco-light l30" />
                </div>

                {/* destellos alrededor */}
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


            <CornerGarland className="xv-flowers-left" />
            <CornerGarlandR className="xv-flowers-right" />

            {/* pétalos cayendo, más cantidad y variedad */}
            {[
                { left: "8%", w: 10, h: 7, c: "#8B203A", dur: "9s", delay: "0s" },
                { left: "20%", w: 7, h: 5, c: "#D9B26B", dur: "11.5s", delay: "2.2s" },
                { left: "33%", w: 9, h: 6.5, c: "#F6ECE2", dur: "10s", delay: "4.5s" },
                { left: "45%", w: 6, h: 4.5, c: "#B24759", dur: "8s", delay: "1s" },
                { left: "57%", w: 8, h: 6, c: "#8B203A", dur: "12s", delay: "5.5s" },
                { left: "68%", w: 7, h: 5, c: "#D9B26B", dur: "9.5s", delay: "3s" },
                { left: "78%", w: 6, h: 4.5, c: "#F6ECE2", dur: "10.5s", delay: "6.2s" },
                { left: "88%", w: 9, h: 6.5, c: "#8B203A", dur: "13s", delay: "1.8s" },
                { left: "14%", w: 6, h: 4.5, c: "#B24759", dur: "8.8s", delay: "7s" },
                { left: "95%", w: 7, h: 5, c: "#D9B26B", dur: "11s", delay: "3.9s" },
            ].map((p, i) => (
                <span
                    key={i}
                    className="xv-petal"
                    style={{
                        left: p.left,
                        width: `${p.w}px`,
                        height: `${p.h}px`,
                        background: p.c,
                        animationDuration: p.dur,
                        animationDelay: p.delay,
                    }}
                />
            ))}

            <div className="cover-content">
                <span className="cover-kicker">ESTÁS INVITADO/A</span>
                {isXV ?
                    <>
                        <h1>{invitation.name} </h1>

                        <div className="cover-xv"
                            style={{
                                fontSize: 100
                            }}
                        >{invitation.eventType || "Evento"}</div>

                    </>
                    :
                    <>
                        <div className="cover-xv">{invitation.eventType || "Evento"}</div>
                        <h1>{invitation.name} </h1>

                    </>
                }

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