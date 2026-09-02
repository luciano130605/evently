
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import ThemeToggle from "../components/ThemeToggle";
import { QRCodeSVG } from "qrcode.react";
const DEMO_ROUTES = {
    normal: "/invitacion/demo",
    xv: "/invitacion/demo-xv",
    garden: "/invitacion/demo-garden"
};

const NEXT_DEMO_MODE = {
    normal: "xv",
    xv: "garden",
    garden: "normal"
};

export default function Home({ theme, onToggleTheme }) {
    const navigate = useNavigate();
    const [demoMode, setDemoMode] = useState("normal");

    const goToAdminQuick = () => {
        navigate("/admin");
    };

    const toggleDemo = () => {
        const nextMode = NEXT_DEMO_MODE[demoMode];
        setDemoMode(nextMode);
        navigate(DEMO_ROUTES[nextMode]);
    };

    const lavColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--lav")
        .trim();

    const ink = getComputedStyle(document.documentElement)
        .getPropertyValue("--ink")
        .trim();

    return (
        <main className="home-page">

            <div className="home-blob home-blob-1" />
            <div className="home-blob home-blob-2" />

            <header className="home-header">

                <div className="home-brand-lockup">
                    <img src="/favicon-512.png" alt="" className="home-brand-mark" width="32" height="32" />
                    <span className="brand">evently</span>
                </div>


                <div className="home-header-actions">
                    <button type="button" className="header-demo" onClick={toggleDemo}>
                        {demoMode === "normal" && "Ver demo"}
                        {demoMode === "xv" && "Ver demo XV"}
                        {demoMode === "garden" && "Ver demo Jardín"}
                    </button>

                    <button type="button" className="home-secondary" onClick={goToAdminQuick}>
                        Ir al admin
                    </button>


                    <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
                </div>
            </header>


            <section className="home-hero">

                <div className="home-copy">

                    <div className="home-pill">
                        INVITACIONES DIGITALES
                    </div>

                    <h1>
                        Tu evento.
                        <span>
                            Tu historia.
                        </span>
                    </h1>

                    <p>
                        Creá una invitación para cualquier festejo y recibí confirmaciones en un solo lugar.
                    </p>

                    <div className="home-actions">
                        <Link to="/crear" className="home-primary">
                            Crear mi evento
                        </Link>

                        <Link to="/invitacion/demo" className="home-secondary">
                            Ver demo
                        </Link>
                    </div>


                </div>


                <div className="home-preview">
                    <div
                        className="preview-3d-scene"
                        onClick={(e) => {
                            e.currentTarget.classList.toggle("is-flipped");
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label="Girar invitación"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.currentTarget.classList.toggle("is-flipped");
                            }
                        }}
                    >
                        <div className="preview-card">

                            {/* =========================
                FRENTE
            ========================= */}
                            <div className="preview-face preview-front">

                                <span className="preview-top">
                                    ESTÁS INVITADO/A
                                </span>

                                <strong>
                                    Juan
                                </strong>

                                <span className="preview-sub">
                                    Celebramos juntos
                                </span>

                                <div className="preview-date">
                                    15 · 11 · 2026
                                </div>

                                <div className="preview-line" />

                                <small>
                                    FALTAN
                                </small>

                                <div className="preview-count">
                                    <span>5</span>
                                    <small>Días</small>
                                </div>

                                <div className="preview-bottom">
                                    JUAN · EVENTO
                                </div>

                            </div>


                            {/* =========================
                ATRÁS
            ========================= */}
                            <div className="preview-face preview-back">

                                <span className="preview-top">
                                    ENTRADA DIGITAL
                                </span>

                                <strong>
                                    Sofi
                                </strong>

                                <span className="preview-sub">
                                    Acceso al evento
                                </span>

                                <div className="preview-qr-wrapper">
                                    <div className="preview-qr">
                                        <QRCodeSVG
                                            value={`${window.location.origin}/invitacion/entrada/demo`}
                                            size={190}
                                            bgColor="var(--lav)"
                                            fgColor="var(--ink)"
                                            level="H"
                                            includeMargin={true}
                                        />
                                    </div>
                                </div>

                                <span className="preview-qr-label">
                                    MOSTRAR EL QR AL INGRESAR
                                </span>

                                <div className="preview-bottom">
                                    EVENTLY · JUAN
                                </div>

                            </div>

                        </div>
                    </div>
                </div>

            </section>




        </main>
    );
}