

import { Link, useNavigate } from "react-router-dom";

import ThemeToggle from "../components/ThemeToggle";

export default function Home({ theme, onToggleTheme }) {
    const navigate = useNavigate();

    const goToAdminQuick = () => {
        navigate("/admin");
    };

    return (
        <main className="home-page">

            <div className="home-blob home-blob-1" />
            <div className="home-blob home-blob-2" />

            <header className="home-header">

                <Link
                    to="/inicio"
                    className="brand"
                >
                    mis15
                </Link>


                <div className="home-header-actions">
                    <Link
                        to="/invitacion/sofia"
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
                        Tu noche.
                        <span>
                            Tu historia.
                        </span>
                    </h1>

                    <p>
                        Creá una invitación de 15
                        elegante, moderna y hecha
                        para compartir.
                    </p>

                    <div className="home-actions">
                        <Link to="/crear" className="home-primary">
                            Crear mi invitación
                        </Link>

                        <Link to="/invitacion/sofia" className="home-secondary">
                            Ver cómo queda
                        </Link>

                    </div>


                </div>


                <div className="home-preview">

                    <div className="preview-card">

                        <span className="preview-top">
                            ESTÁS INVITADO/A
                        </span>

                        <strong>
                            Sofía
                        </strong>

                        <span className="preview-sub">
                            Mis 15 años
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
                            SOFÍA · XV
                        </div>

                    </div>

                </div>

            </section>




        </main>
    );
}
