import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { QRCodeSVG } from "qrcode.react";


import "./EntradaDemo.css";
import { Calendar03Icon, CheckmarkCircle01Icon, Clock01Icon, Clock02Icon, LinkCircleIcon, PinLocation03Icon, TieIcon, Time01Icon } from "@hugeicons/core-free-icons";

export default function EntradaDemo() {
    return (
        <main className="entry-page">
            <div className="entry-background" />

            <section className="entry-container">

                {/* CARD PRINCIPAL */}
                <article className="entry-card">

                    <div className="entry-card-top">
                        <span className="entry-kicker">
                            ENTRADA DIGITAL
                        </span>

                        <div className="entry-event">
                            <p className="entry-event-type">
                               Evento
                            </p>

                            <h1>
                                Juan
                            </h1>

                            <p className="entry-event-subtitle">
                                Celebramos juntos
                            </p>
                        </div>
                    </div>

                    {/* INVITADO */}
                    <div className="entry-guest">
                        <span className="entry-label">
                            INVITADO
                        </span>

                        <h2>
                            Sofi
                        </h2>

                        <p>
                            Esta entrada es personal e intransferible.
                        </p>
                    </div>

                    {/* DATOS */}
                    <div className="entry-details">

                        <div className="entry-detail">
                            <div className="entry-detail-icon">
                                <HugeiconsIcon
                                    icon={Calendar03Icon}
                                    size={21}
                                />
                            </div>

                            <div>
                                <span>FECHA</span>
                                <strong>15 de noviembre de 2026</strong>
                            </div>
                        </div>

                        <div className="entry-detail">
                            <div className="entry-detail-icon">
                                <HugeiconsIcon
                                    icon={Clock01Icon}
                                    size={21}
                                />
                            </div>

                            <div>
                                <span>HORARIO</span>
                                <strong>21:00 — 03:00 hs</strong>
                            </div>
                        </div>

                    </div>

                    {/* LUGAR */}
                    <div className="entry-location">

                        <div className="entry-location-icon">
                            <HugeiconsIcon
                                icon={PinLocation03Icon}
                                size={23}
                            />
                        </div>

                        <div className="entry-location-content">
                            <span>¿DÓNDE ES?</span>

                            <h3>
                                Salón La Estancia
                            </h3>

                            <p>
                                Av. del Libertador 2450
                                <br />
                                Buenos Aires, Argentina
                            </p>

                            <a
                                href="https://maps.google.com"
                                target="_blank"
                                rel="noreferrer"
                                className="entry-map-link"
                            >
                                Cómo llegar

                                <HugeiconsIcon
                                    icon={LinkCircleIcon}
                                    size={13}
                                />
                            </a>
                        </div>

                    </div>

                    {/* DRESS CODE */}
                    <div className="entry-dress">

                        <div className="entry-dress-icon">
                            <HugeiconsIcon
                                icon={TieIcon}
                                size={22}
                            />
                        </div>

                        <div>
                            <span>DRESS CODE</span>

                            <h3>
                                Elegante
                            </h3>

                            <p>
                                Vestimenta formal.
                                Evitar blanco y tonos similares al vestido de la quinceañera.
                            </p>
                        </div>

                    </div>

                    {/* SEPARADOR */}
                    <div className="entry-divider">
                        <span />
                    </div>

                    {/* QR / ACCESO */}
                    <div className="entry-access">

                        <div className="entry-access-header">
                            <div>
                                <span>ACCESO</span>
                                <h3>
                                    Presentá esta entrada
                                </h3>
                            </div>

                          
                        </div>

                        <div className="entry-ticket-code">
                            <span>CÓDIGO DE ENTRADA</span>
                            <strong>EVT-2026-001245</strong>
                        </div>

                        <div className="entry-qr">
                            <div className="entry-qr-frame">
                                <QRCodeSVG
                                    value="/invitacion/entrada/demo"
                                    size={180}
                                    bgColor="var(--surface)"
                                    fgColor="var(--purple)"
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>

                            <p>
                                Mostrá este código al ingresar al evento.
                            </p>
                        </div>

                    </div>

                </article>

                {/* FOOTER */}
                <footer className="entry-footer">

                    <p>
                        Esta entrada fue generada con
                        <strong> evently</strong>
                    </p>

                    <Link to="/">
                        Crear mi invitación
                    </Link>

                </footer>

            </section>
        </main>
    );
}
