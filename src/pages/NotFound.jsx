import { Link } from "react-router-dom";

export default function NotFoundPage({
    title = "La página no existe",
    description = "La URL que intentaste abrir no coincide con ninguna página de la aplicación."
}) {
    return (
        <main className="not-found-page">
            <div className="home-blob home-blob-1" />
            <div className="home-blob home-blob-2" />

            <div className="not-found-shell">
                <span className="section-kicker">ERROR 404</span>

                <div className="not-found-code">404</div>

                <h1>{title}</h1>

                <p>{description}</p>

                <div className="not-found-actions">
                    <Link to="/" className="home-primary">Volver al inicio</Link>
                    <Link to="/crear" className="home-secondary">Crear una invitación</Link>
                </div>
            </div>
        </main>
    );
}
