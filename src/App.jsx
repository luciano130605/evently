import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import Crear from "./pages/Crear";
import Invitacion from "./pages/Invitacion";
import ConfirmarAsistencia from "./pages/ConfirmarAsistencia";
import Admin from "./pages/Admin";
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
                    path="/admin"
                    element={<Admin theme={theme} onToggleTheme={toggleTheme} />}
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
