import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";

export default function Escanear() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const scannerRef = useRef(null);
    const isRunningRef = useRef(false);
    const [cameraError, setCameraError] = useState("");
    const [status, setStatus] = useState("Iniciando cámara...");
    const [manualLink, setManualLink] = useState("");

    const isAdmin = typeof window !== "undefined" &&
        window.sessionStorage.getItem(`mis15_admin_auth_${slug}`) === "true";

    useEffect(() => {
        if (!isAdmin) {
            return undefined;
        }

        let cancelled = false;
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        const stopScanner = async () => {
            if (!isRunningRef.current) {
                return;
            }

            isRunningRef.current = false;

            try {
                await scanner.stop();
                scanner.clear();
            } catch (stopError) {
                console.warn("html5-qrcode: error al detener", stopError);
            }
        };

        const goToScannedUrl = (decodedText) => {
            console.log("QR leído:", decodedText);

            stopScanner().finally(() => {
                goToValidar(decodedText);
            });
        };

        // Primero pedimos la lista de cámaras: esto fuerza el prompt de permisos
        // y nos deja ver en consola si el navegador directamente no puede acceder.
        Html5Qrcode.getCameras()
            .then((devices) => {
                console.log("Cámaras detectadas:", devices);

                if (cancelled) return;

                if (!devices || devices.length === 0) {
                    setCameraError("No se detectó ninguna cámara en este dispositivo.");
                    setStatus("");
                    return;
                }

                setStatus("Cámara detectada, iniciando video...");

                return scanner.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        if (!cancelled) {
                            goToScannedUrl(decodedText);
                        }
                    },
                    (scanErrorMessage) => {
                        // Se dispara en cada frame donde no hay QR: es normal, no es un error real.
                    }
                );
            })
            .then(() => {
                if (cancelled) {
                    stopScanner();
                    return;
                }

                isRunningRef.current = true;
                setStatus("");
            })
            .catch((err) => {
                console.error("Error de cámara:", err);

                if (cancelled) return;

                const message = String(err?.message || err || "");

                if (message.toLowerCase().includes("permission") || err?.name === "NotAllowedError") {
                    setCameraError("El navegador (o el túnel) bloqueó el permiso de cámara. Probá abrir el sitio en su dominio final (no en un link de devtunnels) o revisá los permisos de cámara del sitio en el navegador.");
                } else if (err?.name === "NotFoundError") {
                    setCameraError("No se encontró ninguna cámara disponible.");
                } else {
                    setCameraError(`No pudimos acceder a la cámara: ${message || "error desconocido"}.`);
                }

                setStatus("");
            });

        return () => {
            cancelled = true;
            stopScanner();
        };
    }, [isAdmin, navigate]);

    const goToValidar = (rawValue) => {
        const value = rawValue.trim();

        if (!value) {
            return;
        }

        // Sacamos el pathname, ya sea que hayan pegado una URL completa
        // (con http/https) o solo la parte relativa (/entrada/... o /validar/...)
        let path = value;

        try {
            path = new URL(value).pathname;
        } catch {
            // no era una URL completa, usamos el texto tal cual
        }

        // Soporta tanto /entrada/:slug/:token como /validar/:slug/:token
        // y siempre termina navegando a /validar
        const match = path.match(/\/(?:entrada|validar)\/([^/]+)\/([^/]+)\/?$/);

        if (match) {
            const [, slugFromLink, tokenFromLink] = match;
            navigate(`/validar/${slugFromLink}/${tokenFromLink}`);
            return;
        }

        // Fallback por si el link no matchea el patrón esperado
        navigate(path);
    };

    const submitManualLink = (event) => {
        event.preventDefault();
        goToValidar(manualLink);
    };

    if (!isAdmin) {
        return (
            <main className="center-page validar">
                <div className="admin-login-icon" style={{ marginBottom: 4 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="10" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </div>
                <h1>Necesitás iniciar sesión</h1>
                <p>Ingresá al panel de administración de esta invitación primero.</p>
                <Link to={`/admin/${slug}`} className="primary-button">Ir al panel</Link>
            </main>
        );
    }

    const scanState = cameraError ? "error" : status ? "loading" : "live";

    return (
        <main className="admin-page scan-page">
            <header className="admin-header">
                <Link to={`/admin/${slug}`}>Volver</Link>
            </header>

            <div className="scan-container">
                <div className="scan-intro">
                   
                    <h1 className="title">Escanear entrada</h1>
                    <p>Apuntá la cámara al código QR de la entrada del invitado.</p>
                </div>


                <div className="scan-frame-wrap">
                    <span className="scan-corner scan-corner-tl" />
                    <span className="scan-corner scan-corner-tr" />
                    <span className="scan-corner scan-corner-bl" />
                    <span className="scan-corner scan-corner-br" />
                    {scanState === "live" && <span className="scan-line" />}
                    <div id="qr-reader" className="scan-video" />
                </div>

                {cameraError && (
                    <div className="scan-error">
                        <strong>No pudimos abrir la cámara</strong>
                        <p>{cameraError}</p>
                    </div>
                )}

                <div className="scan-divider">
                    <span />
                </div>

                <div className="scan-manual">
                    <small>¿La cámara no funciona? Pegá el link de la entrada a mano:</small>

                    <form onSubmit={submitManualLink} className="scan-manual-row">
                        <input
                            type="text"
                            className="input-scan"
                            value={manualLink}
                            onChange={(event) => setManualLink(event.target.value)}
                            placeholder="https://.../entrada/slug/token o /validar/..."
                        />
                        <button type="submit" className="primary-button">
                            Ir
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}