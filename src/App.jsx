import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Crear from "./pages/Crear";
import Invitacion from "./pages/Invitacion";
import Admin from "./pages/Admin";

import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Home />} />

                <Route
                    path="/crear"
                    element={<Crear />}
                />

                <Route
                    path="/invitacion/:slug"
                    element={<Invitacion />}
                />

                <Route
                    path="/admin/:slug"
                    element={<Admin />}
                />

                <Route
                    path="/admin"
                    element={<Admin />}
                />

                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
