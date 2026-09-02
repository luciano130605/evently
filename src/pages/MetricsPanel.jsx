import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getSiteMetrics } from "../lib/invitations";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkBadge02Icon, CheckmarkCircle04Icon, DashboardCircleIcon, ChartAnalysisIcon, BadgePlusIcon } from "@hugeicons/core-free-icons";
import ThemeToggle from "../components/ThemeToggle";

const WEEKDAY_ORDER = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function reorderWeekdays(weekdaySeries = []) {
    const map = new Map(weekdaySeries.map((item) => [item.label, item.count]));
    return WEEKDAY_ORDER.map((label) => ({ label, count: map.get(label) || 0 }));
}

function formatRelativeTime(iso) {
    if (!iso) return "";
    const diffMs = Date.now() - new Date(iso).getTime();
    if (Number.isNaN(diffMs)) return "";

    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "recién";
    if (minutes < 60) return `hace ${minutes} min`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours} h`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `hace ${days} d`;

    const months = Math.floor(days / 30);
    return `hace ${months} mes${months > 1 ? "es" : ""}`;
}

function formatHours(hours) {
    if (hours === null || hours === undefined) return "Sin datos aún";
    if (hours < 24) return `${hours.toFixed(1)} h`;
    return `${(hours / 24).toFixed(1)} d`;
}

export default function MetricsPanel({ theme, onToggleTheme }) {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);

        getSiteMetrics()
            .then((data) => {
                if (active) setMetrics(data);
            })
            .catch((err) => {
                console.error("Error cargando métricas:", err);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    if (loading || !metrics) {
        return (
            <main className="admin-page">
                <header className="admin-header">
                    <Link to="/">Inicio</Link>
                    <span className="brand">evently</span>
                    <div className="admin-header-actions">
                        <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
                    </div>
                </header>
                <div className="metrics-loading">Cargando métricas…</div>
            </main>
        );
    }

    const activeTemplates = Object.entries(metrics.templateBreakdown || {}).map(([template, value]) => ({
        template,
        value
    }));

    const activeEventTypes = Object.entries(metrics.eventTypeBreakdown || {}).map(([eventType, value]) => ({
        eventType,
        value
    }));

    const bottlenecks = Object.entries(metrics.missingFieldsBreakdown || {})
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]);

    const topBottleneck = bottlenecks[0];

    const maxDailyCount = Math.max(1, ...metrics.dailySeries.map((day) => day.count));
    const maxDailyRsvpCount = Math.max(1, ...metrics.dailyRsvpSeries.map((day) => day.count));
    const weekdaySeries = reorderWeekdays(metrics.weekdaySeries);
    const maxWeekdayCount = Math.max(1, ...weekdaySeries.map((day) => day.count));
    const busiestDay = [...weekdaySeries].sort((a, b) => b.count - a.count)[0];

    const abandonedPercent = metrics.totalInvitations
        ? Math.round((metrics.invitationsWithoutRsvps / metrics.totalInvitations) * 100)
        : 0;

    const incompletePercent = metrics.totalInvitations
        ? Math.round((metrics.incompleteInvitations / metrics.totalInvitations) * 100)
        : 0;

    return (
        <main className="admin-page">
            <header className="admin-header">
                <Link to="/">Inicio</Link>
                <span className="brand">evently</span>
                <div className="admin-header-actions">
                    <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
                </div>
            </header>

            <section className="admin-head metrics-head">
                <div>
                    <span className="section-kicker">MÉTRICAS GLOBALES</span>
                    <h1>Resumen de la plataforma</h1>
                    <p>Datos en vivo desde la base de datos.</p>
                </div>
            </section>

            <section className="admin-stats metrics">
                <div className="admin-stat metric-stat">
                    <HugeiconsIcon icon={DashboardCircleIcon} size={24} />
                    <div className="metric-stat-content">
                        <span>Total de invitaciones</span>
                        <strong>{metrics.totalInvitations}</strong>
                    </div>
                </div>

                <div className="admin-stat metric-stat">
                    <HugeiconsIcon icon={CheckmarkCircle04Icon} size={24} />
                    <div className="metric-stat-content">
                        <span>Confirmaciones totales</span>
                        <strong>{metrics.totalRsvps}</strong>
                    </div>
                </div>

                <div className="admin-stat metric-stat">
                    <HugeiconsIcon icon={ChartAnalysisIcon} size={24} />
                    <div className="metric-stat-content">
                        <span>Promedio de invitados por evento</span>
                        <strong>{metrics.avgRsvpsPerInvitation.toFixed(1)}</strong>
                    </div>
                </div>

                <div className="admin-stat metric-stat">
                    <HugeiconsIcon icon={CheckmarkBadge02Icon} size={24} />
                    <div className="metric-stat-content">
                        <span>Invitaciones completas</span>
                        <strong>{100 - incompletePercent}%</strong>
                    </div>
                </div>
            </section>

            <section className="metrics-section">
                <div className="admin-section-title">
                    <strong>Actividad de los últimos 14 días</strong>
                    <p>{metrics.weeklyGrowth.current} invitaciones esta semana</p>
                </div>

                <div className="metrics-subtitle">Invitaciones creadas</div>
                <div className="metrics-bar-chart">
                    {metrics.dailySeries.map((day) => (
                        <div key={day.date} className="bar-col">
                            <span className="bar-value">{day.count || ""}</span>
                            <div
                                className="bar"
                                style={{ height: `${Math.max(4, (day.count / maxDailyCount) * 100)}%` }}
                            />
                            <span className="bar-label">
                                {new Date(day.date).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="metrics-subtitle" style={{ marginTop: 24 }}>Confirmaciones recibidas</div>
                <div className="metrics-bar-chart">
                    {metrics.dailyRsvpSeries.map((day) => (
                        <div key={day.date} className="bar-col">
                            <span className="bar-value">{day.count || ""}</span>
                            <div
                                className="bar bar-mint"
                                style={{ height: `${Math.max(4, (day.count / maxDailyRsvpCount) * 100)}%` }}
                            />
                            <span className="bar-label">
                                {new Date(day.date).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="metrics-section">
                <div className="admin-section-title">
                    <strong>Cuellos de botella</strong>
                    <p>Dónde se traban o abandonan los usuarios.</p>
                </div>

                <div className="metrics-callout-grid">
                    <div className="metrics-callout">
                        <span className="label">Invitaciones incompletas</span>
                        <strong>{metrics.incompleteInvitations} ({incompletePercent}%)</strong>
                        {topBottleneck && (
                            <small className="detail">Lo que más falta: {topBottleneck[0]} ({topBottleneck[1]})</small>
                        )}
                    </div>

                    <div className="metrics-callout">
                        <span className="label">Invitaciones sin confirmaciones</span>
                        <strong>{metrics.invitationsWithoutRsvps} ({abandonedPercent}%)</strong>
                        <small className="detail">Creadas pero sin ningún RSVP todavía</small>
                    </div>

                    <div className="metrics-callout">
                        <span className="label">Tiempo hasta la 1ª confirmación</span>
                        <strong>{formatHours(metrics.avgHoursToFirstRsvp)}</strong>
                        <small className="detail">Promedio desde que se crea la invitación</small>
                    </div>

                    <div className="metrics-callout">
                        <span className="label">Día más activo</span>
                        <strong>{busiestDay.label}</strong>
                        <small className="detail">{busiestDay.count} invitaciones creadas ese día</small>
                    </div>
                </div>

                {bottlenecks.length > 0 && (
                    <div className="metrics-bottleneck-list">
                        {bottlenecks.map(([label, count]) => (
                            <div key={label} className="metrics-bottleneck-row">
                                <span className="bottleneck-label">{label}</span>
                                <div className="metrics-bottleneck-track">
                                    <div
                                        className="metrics-bottleneck-fill"
                                        style={{ width: `${Math.min(100, (count / metrics.totalInvitations) * 100)}%` }}
                                    />
                                </div>
                                <span className="metrics-bottleneck-count">{count}</span>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="metrics-section">
                <div className="admin-section-title">
                    <strong>Actividad por día de la semana</strong>
                </div>

                <div className="metrics-weekday-chart">
                    {weekdaySeries.map((day) => (
                        <div key={day.label} className="bar-col">
                            <span className="bar-value">{day.count || ""}</span>
                            <div
                                className="bar"
                                style={{ height: `${Math.max(6, (day.count / maxWeekdayCount) * 100)}px` }}
                            />
                            <span className="bar-label">{day.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="admin-rsvps">
                <div className="admin-section-title">
                    <strong>Distribución por plantillas</strong>
                </div>

                <div className="metrics-grid">
                    {activeTemplates.length === 0 ? (
                        <div className="admin-empty-state">Todavía no hay invitaciones creadas.</div>
                    ) : (
                        activeTemplates.map(({ template, value }) => (
                            <div key={template} className="metrics-card">
                                <span className="section-kicker">{template}</span>
                                <strong>{value}</strong>
                                <small>invitaciones</small>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <section className="admin-rsvps">
                <div className="admin-section-title">
                    <strong>Distribución por tipo de evento</strong>
                </div>

                <div className="metrics-grid">
                    {activeEventTypes.length === 0 ? (
                        <div className="admin-empty-state">Todavía no hay invitaciones creadas.</div>
                    ) : (
                        activeEventTypes.map(({ eventType, value }) => (
                            <div key={eventType} className="metrics-card">
                                <span className="section-kicker">{eventType}</span>
                                <strong>{value}</strong>
                                <small>invitaciones</small>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <section className="admin-rsvps">
                <div className="admin-section-title">
                    <strong>Actividad reciente</strong>
                </div>

                <div className="metrics-activity-list">
                    {metrics.recentActivity.length === 0 ? (
                        <div className="admin-empty-state">Sin actividad todavía.</div>
                    ) : (
                        metrics.recentActivity.map((item, index) => (
                            <div key={`${item.slug}-${item.at}-${index}`} className="metrics-activity-row">
                                <div className="activity-left">
                                    <div className={`metrics-activity-icon ${item.type === "rsvp" ? "rsvp" : ""}`}>
                                        <HugeiconsIcon icon={item.type === "rsvp" ? CheckmarkBadge02Icon : BadgePlusIcon} size={18} />
                                    </div>
                                    <div>
                                        <strong>{item.label}</strong>
                                        <div className="activity-meta">
                                            {item.type === "rsvp" ? "Nueva confirmación" : "Invitación creada"} · {item.slug}
                                        </div>
                                    </div>
                                </div>
                                <time>{formatRelativeTime(item.at)}</time>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </main>
    );
}