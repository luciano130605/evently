import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import Crear from "./pages/Crear";
import EntradaDemo from "./pages/EntradaDemo";
import Entrada from "./pages/Entrada";
import Validar from "./pages/Validar";
import Escanear from "./pages/Escanear";
import Invitacion from "./pages/Invitacion";
import ConfirmarAsistencia from "./pages/ConfirmarAsistencia";
import Admin from "./pages/Admin";
import MetricsPanel from "./pages/MetricsPanel";
import NotFoundPage from "./pages/NotFound";

import { applyTheme, resolveThemePreference } from "./lib/theme";

import "./App.css";

function App() {
    const [theme, setTheme] = useState(() => resolveThemePreference());

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((current) => (current === "dark" ? "light" : "dark"));
    };

    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Home theme={theme} onToggleTheme={toggleTheme} />} />

                <Route
                    path="/crear"
                    element={<Crear />}
                />

                <Route
                    path="/invitacion/:slug"
                    element={<Invitacion />}
                />

                <Route
                    path="/confirmar/:slug"
                    element={<ConfirmarAsistencia />}
                />

                <Route
                    path="/admin/:slug"
                    element={<Admin theme={theme} onToggleTheme={toggleTheme} />}
                />

                              <Route
                    path="/invitacion/entrada/demo"
                    element={<EntradaDemo />}
                />

                <Route
                    path="/entrada/:slug/:ticketToken"
                    element={<Entrada />}
                />

                <Route
                    path="/validar/:slug/:ticketToken"
                    element={<Validar />}
                />

                <Route
                    path="/admin/:slug/escanear"
                    element={<Escanear />}
                />

                <Route
                    path="/admin"
                    element={<Admin theme={theme} onToggleTheme={toggleTheme} />}
                />

                <Route
                    path="/admin"
                    element={<Admin theme={theme} onToggleTheme={toggleTheme} />}
                />

                <Route
                    path="/metrics"
                    element={<MetricsPanel theme={theme} onToggleTheme={toggleTheme} />}
                />

                <Route
                    path="*"
                    element={<NotFoundPage />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
