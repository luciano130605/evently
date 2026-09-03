import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Download04Icon,
    Share03Icon,
    Share08Icon,
    AddSquareIcon,
    MoreVerticalIcon,
    CheckmarkCircle02Icon,
    MonitorDownIcon,
} from "@hugeicons/core-free-icons";
import "./InstallPwaGuide.css";

// Detecta la plataforma / navegador para mostrar el instructivo correcto
function getPlatformInfo() {
    const ua = window.navigator.userAgent || "";
    const isIOS = /iphone|ipad|ipod/i.test(ua) && !window.MSStream;
    const isAndroid = /android/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios|chrome/i.test(ua);
    const isStandalone =
        window.matchMedia?.("(display-mode: standalone)")?.matches ||
        window.navigator.standalone === true;

    return { isIOS, isAndroid, isSafari, isStandalone };
}

export default function InstallPwaGuide({ guestName }) {
    const [platform, setPlatform] = useState(() => getPlatformInfo());
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [guideOpen, setGuideOpen] = useState(false);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        setPlatform(getPlatformInfo());

        const handleBeforeInstall = (event) => {
            event.preventDefault();
            setDeferredPrompt(event);
        };

        const handleInstalled = () => {
            setInstalled(true);
            setDeferredPrompt(null);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstall);
        window.addEventListener("appinstalled", handleInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
            window.removeEventListener("appinstalled", handleInstalled);
        };
    }, []);

    // Ya está instalada / abierta como app: no mostramos nada
    if (platform.isStandalone || installed) {
        return null;
    }

    const handleNativeInstall = async () => {
        if (!deferredPrompt) {
            setGuideOpen(true);
            return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setInstalled(true);
        }
        setDeferredPrompt(null);
    };

    return (
        <>
            <div className="install-pwa-banner">
                <div className="install-pwa-text">
                    <span className="entry-label">NO LA PIERDAS</span>
                    <p>Guardá esta entrada en tu celular como una app.</p>
                </div>
                <button
                    type="button"
                    className="install-pwa-button"
                    onClick={deferredPrompt ? handleNativeInstall : () => setGuideOpen(true)}
                >
                    Guardar entrada
                </button>
            </div>

            {guideOpen && (
                <div
                    className="modal-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setGuideOpen(false);
                    }}
                >
                    <section
                        className="install-pwa-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Cómo instalar la entrada"
                    >
                        <button
                            type="button"
                            className="qr-modal-close"
                            onClick={() => setGuideOpen(false)}
                            aria-label="Cerrar"
                        >
                            X
                        </button>

                        <span className="entry-kicker">INSTALAR</span>
                        <h3>Guardá tu entrada, {guestName?.split(" ")[0] || "invitado"}</h3>
                        <p className="install-pwa-subtitle">
                            Instalala como una app para tenerla siempre a mano, incluso sin señal.
                        </p>

                        {platform.isIOS ? (
                            <ol className="install-pwa-steps">
                                <li>
                                    <span className="install-pwa-step-icon">
                                        <HugeiconsIcon icon={Share03Icon} size={18} />
                                    </span>
                                    <div>
                                        <strong>Tocá el botón "Compartir"</strong>
                                        <p>Es el ícono del cuadrado con la flecha hacia arriba, abajo en Safari.</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="install-pwa-step-icon">

                                        <HugeiconsIcon icon={AddSquareIcon} size={18} />

                                    </span>
                                    <div>
                                        <strong>Elegí "Agregar a inicio"</strong>
                                        <p>Deslizá la lista de opciones hasta encontrar "Agregar a pantalla de inicio".</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="install-pwa-step-icon">
                                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                                    </span>
                                    <div>
                                        <strong>Confirmá tocando "Agregar"</strong>
                                        <p>Va a aparecer un ícono nuevo en tu pantalla de inicio, listo para usar.</p>
                                    </div>
                                </li>
                            </ol>
                        ) : platform.isAndroid ? (
                            <ol className="install-pwa-steps">
                                <li>
                                    <span className="install-pwa-step-icon">
                                        <HugeiconsIcon icon={MoreVerticalIcon} size={18} />
                                    </span>
                                    <div>
                                        <strong>Abrí el menú del navegador</strong>
                                        <p>Tocá los tres puntos arriba a la derecha de Chrome.</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="install-pwa-step-icon">2</span>
                                    <div>
                                        <strong>Elegí "Instalar app"</strong>
                                        <p>También puede figurar como "Agregar a pantalla de inicio".</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="install-pwa-step-icon">
                                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                                    </span>
                                    <div>
                                        <strong>Confirmá la instalación</strong>
                                        <p>Listo, ya tenés la entrada como una app en tu celular.</p>
                                    </div>
                                </li>
                            </ol>
                        ) : (
                            <ol className="install-pwa-steps">
                                <li>
                                    <span className="install-pwa-step-icon">
                                        <HugeiconsIcon icon={MoreVerticalIcon} size={18} />
                                    </span>
                                    <div>
                                        <strong>Buscá el ícono de instalar</strong>
                                        <p>En la barra de direcciones o en el menú de tu navegador.</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="install-pwa-step-icon">
                                        <HugeiconsIcon icon={MonitorDownIcon} size={18} />

                                    </span>
                                    <div>
                                        <strong>Tocá "Instalar"</strong>
                                        <p>Confirmá cuando el navegador te lo pregunte.</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="install-pwa-step-icon">
                                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                                    </span>
                                    <div>
                                        <strong>Ya está</strong>
                                        <p>Vas a poder abrir la entrada desde tu escritorio cuando quieras.</p>
                                    </div>
                                </li>
                            </ol>
                        )}
                    </section>
                </div>
            )}
        </>
    );
}