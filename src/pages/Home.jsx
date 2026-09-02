

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import ThemeToggle from "../components/ThemeToggle";

export default function Home({ theme, onToggleTheme }) {
    const navigate = useNavigate();
    const [demoMode, setDemoMode] = useState("normal");

    const goToAdminQuick = () => {
        navigate("/admin");
    };

    const toggleDemo = () => {
        const nextMode = demoMode === "normal" ? "xv" : "normal";
        setDemoMode(nextMode);
        navigate(nextMode === "normal" ? "/invitacion/demo" : "/invitacion/demo-xv");
    };

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
                    <Link
                        to="/invitacion/demo"
                        className="header-demo"
                    >
                        Ver demo
                    </Link>

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

                    <div className="preview-card">

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
                            <span> 5</span>
                            <small>
                                Días
                            </small>
                        </div>

                        <div className="preview-bottom">
                            JUAN · EVENTO
                        </div>

                    </div>

                </div>

            </section>




        </main>
    );
}
