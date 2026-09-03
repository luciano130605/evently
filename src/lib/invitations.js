import { demoInvitation, xvDemoInvitation } from "../data/demoInvitation";
import { hasSupabaseConfig, supabase } from "./supabase";

const INVITATIONS_KEY = "mis15_invitations";
const RSVPS_KEY_PREFIX = "rsvps_";

const REQUIRED_FIELDS = [
    { key: "name", label: "Nombre del festejado/a" },
    { key: "date", label: "Fecha del evento" },
    { key: "venue", label: "Lugar" },
    { key: "address", label: "Dirección" },
    { key: "template", label: "Plantilla" },
    { key: "password", label: "Contraseña" }
];

function countSince(dates, days) {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return dates.filter((iso) => {
        const time = new Date(iso).getTime();
        return !Number.isNaN(time) && time >= cutoff;
    }).length;
}

function buildDailySeries(dates, days = 14) {
    const map = new Map();

    for (let i = days - 1; i >= 0; i -= 1) {
        const day = new Date();
        day.setHours(0, 0, 0, 0);
        day.setDate(day.getDate() - i);
        map.set(day.toISOString().slice(0, 10), 0);
    }

    dates.forEach((iso) => {
        if (!iso) return;
        const time = new Date(iso);
        if (Number.isNaN(time.getTime())) return;
        const key = new Date(time.getFullYear(), time.getMonth(), time.getDate()).toISOString().slice(0, 10);
        if (map.has(key)) {
            map.set(key, map.get(key) + 1);
        }
    });

    return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
}

function buildWeekdaySeries(dates) {
    const labels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const counts = new Array(7).fill(0);

    dates.forEach((iso) => {
        if (!iso) return;
        const time = new Date(iso);
        if (Number.isNaN(time.getTime())) return;
        counts[time.getDay()] += 1;
    });

    return labels.map((label, index) => ({ label, count: counts[index] }));
}

export async function getSiteMetrics() {
    let invitationList = [];
    let rsvpRows = [];

    if (hasSupabaseConfig && supabase) {
        const [{ data: invitationsData, error: invitationsError }, { data: rsvpsData, error: rsvpsError }] = await Promise.all([
            supabase
                .from("invitations")
                .select("slug, name, date, venue, address, template, event_type, password, created_at, updated_at"),
            supabase
                .from("rsvps")
                .select("slug, name, restriction, allergy, is_over_18, created_at")
        ]);

        if (invitationsError) {
            console.error("Error loading invitations for metrics:", invitationsError);
        } else if (invitationsData) {
            invitationList = invitationsData;
        }

        if (rsvpsError) {
            console.error("Error loading RSVPs for metrics:", rsvpsError);
        } else if (rsvpsData) {
            rsvpRows = rsvpsData.map((item) => ({
                ...item,
                isOver18: item.is_over_18 ?? true,
                createdAt: item.created_at
            }));
        }
    }

    if (!invitationList.length) {
        const localInvitations = readLocalInvitations();
        invitationList = Object.values(localInvitations || {}).map((inv) => ({
            slug: inv.slug,
            name: inv.name,
            date: inv.date,
            venue: inv.venue,
            address: inv.address,
            template: inv.template,
            event_type: inv.eventType,
            password: inv.password,
            created_at: inv.createdAt,
            updated_at: inv.updatedAt
        }));

        rsvpRows = invitationList.flatMap((invitation) => {
            const slug = slugify(String(invitation?.slug || ""));
            if (!slug) return [];

            return readLocalRsvps(slug).map((row) => ({
                slug,
                name: row.name,
                restriction: row.restriction,
                allergy: row.allergy,
                isOver18: row.isOver18 !== false,
                createdAt: row.createdAt || row.created_at
            }));
        });
    }

    const totalInvitations = invitationList.length;

    const templateBreakdown = invitationList.reduce((acc, inv) => {
        const template = String(inv?.template || "default").trim() || "default";
        acc[template] = (acc[template] || 0) + 1;
        return acc;
    }, {});

    const eventTypeBreakdown = invitationList.reduce((acc, inv) => {
        const type = String(inv?.event_type || "Evento").trim() || "Evento";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const missingFieldsBreakdown = REQUIRED_FIELDS.reduce((acc, field) => {
        acc[field.label] = 0;
        return acc;
    }, {});

    let incompleteInvitations = 0;
    invitationList.forEach((inv) => {
        let hasMissing = false;
        REQUIRED_FIELDS.forEach((field) => {
            if (!String(inv?.[field.key] || "").trim()) {
                missingFieldsBreakdown[field.label] += 1;
                hasMissing = true;
            }
        });
        if (hasMissing) incompleteInvitations += 1;
    });

    const siteStats = getRsvpStats(rsvpRows);

    const rsvpsBySlug = rsvpRows.reduce((acc, row) => {
        const slug = slugify(String(row.slug || ""));
        if (!slug) return acc;
        if (!acc[slug]) acc[slug] = [];
        acc[slug].push(row);
        return acc;
    }, {});

    const invitationsWithoutRsvps = invitationList.filter((inv) => {
        const slug = slugify(String(inv?.slug || ""));
        return !rsvpsBySlug[slug] || rsvpsBySlug[slug].length === 0;
    }).length;

    const firstRsvpDelays = invitationList
        .map((inv) => {
            const slug = slugify(String(inv?.slug || ""));
            const rows = rsvpsBySlug[slug] || [];
            if (!rows.length || !inv?.created_at) return null;

            const times = rows
                .map((row) => new Date(row.createdAt || row.created_at).getTime())
                .filter((time) => !Number.isNaN(time));
            if (!times.length) return null;

            const firstRsvpTime = Math.min(...times);
            const invitationTime = new Date(inv.created_at).getTime();
            if (Number.isNaN(invitationTime) || firstRsvpTime < invitationTime) return null;

            return (firstRsvpTime - invitationTime) / (1000 * 60 * 60);
        })
        .filter((value) => value !== null);

    const avgHoursToFirstRsvp = firstRsvpDelays.length
        ? firstRsvpDelays.reduce((sum, value) => sum + value, 0) / firstRsvpDelays.length
        : null;

    const avgRsvpsPerInvitation = totalInvitations ? siteStats.total / totalInvitations : 0;

    const invitationDates = invitationList.map((inv) => inv?.created_at).filter(Boolean);
    const rsvpDates = rsvpRows.map((row) => row.createdAt || row.created_at).filter(Boolean);

    const dailySeries = buildDailySeries(invitationDates, 14);
    const dailyRsvpSeries = buildDailySeries(rsvpDates, 14);
    const weekdaySeries = buildWeekdaySeries(invitationDates);

    const last7 = countSince(invitationDates, 7);
    const last14 = countSince(invitationDates, 14);
    const weeklyGrowth = {
        current: last7,
        previous: Math.max(0, last14 - last7)
    };

    const recentActivity = [
        ...invitationList.map((inv) => ({
            type: "invitation",
            label: inv?.name || inv?.slug || "Invitación",
            slug: inv?.slug,
            at: inv?.created_at
        })),
        ...rsvpRows.map((row) => ({
            type: "rsvp",
            label: row?.name || "Confirmación",
            slug: row?.slug,
            at: row.createdAt || row.created_at
        }))
    ]
        .filter((item) => item.at)
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .slice(0, 8);

    return {
        totalInvitations,
        totalRsvps: siteStats.total,
        totalAdults: siteStats.adults,
        totalMinors: siteStats.minors,
        totalRestrictions: siteStats.restrictions,
        totalAllergies: siteStats.allergies,
        incompleteInvitations,
        missingFieldsBreakdown,
        templateBreakdown,
        eventTypeBreakdown,
        avgRsvpsPerInvitation,
        invitationsWithoutRsvps,
        avgHoursToFirstRsvp,
        dailySeries,
        dailyRsvpSeries,
        weekdaySeries,
        weeklyGrowth,
        recentActivity
    };
}

export function slugify(value = "") {
    return String(value)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export function normalizeText(value = "") {
    return String(value || "")
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

export function normalizePersonName(value = "") {
    return normalizeText(String(value || "").replace(/\s+/g, " ").trim());
}

export function splitNameParts(value = "") {
    const text = String(value || "").trim();

    if (!text) {
        return { firstName: "", lastName: "" };
    }

    const pieces = text.split(/\s+/).filter(Boolean);

    if (pieces.length === 1) {
        return { firstName: pieces[0], lastName: "" };
    }

    return {
        firstName: pieces[0],
        lastName: pieces.slice(1).join(" ")
    };
}

export function normalizeInvitation(input = {}) {
    const source = {
        ...demoInvitation,
        ...input
    };

    const parsedName = splitNameParts(String(source.name || ""));
    const firstName = String(source.firstName || source.first_name || "").trim() || parsedName.firstName;
    const lastName = String(source.lastName || source.last_name || "").trim() || parsedName.lastName;
    const slug = slugify(String(source.slug || "") || [firstName, lastName].filter(Boolean).join(" ") || source.name);
    const timeStart = source.timeStart || source.time || "21:00";
    const timeEnd = source.timeEnd || "23:00";
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || String(source.name || "").trim() || demoInvitation.name;

    return {
        ...demoInvitation,
        ...source,
        slug,
        name: fullName,
        firstName,
        lastName,
        maxGuests: source.maxGuests !== undefined && source.maxGuests !== ""
            ? Number(source.maxGuests)
            : null,
        password: String(source.password || ""),
        subtitle: source.subtitle || "Celebramos juntos",
        eventType: source.eventType || source.event || "Evento",
        date: source.date || demoInvitation.date,
        time: timeStart,
        timeStart,
        timeEnd,
        venue: source.venue || "",
        address: source.address || "",
        mapsUrl: source.mapsUrl || "",
        dressCode: source.dressCode || "",
        dressDescription: source.dressDescription || "",
        dressColorsNotAllowed: source.dressColorsNotAllowed || "",
        isOver18: source.isOver18 !== undefined ? Boolean(source.isOver18) : Boolean(demoInvitation.isOver18),
        requireAgeConfirmation: source.requireAgeConfirmation !== undefined ? Boolean(source.requireAgeConfirmation) : Boolean(demoInvitation.requireAgeConfirmation),
        showDressCode: source.showDressCode !== undefined ? Boolean(source.showDressCode) : Boolean(demoInvitation.showDressCode),
        showPhotoAlbum: source.showPhotoAlbum !== undefined ? Boolean(source.showPhotoAlbum) : Boolean(demoInvitation.showPhotoAlbum),
        showGiftSection: source.showGiftSection !== undefined ? Boolean(source.showGiftSection) : Boolean(demoInvitation.showGiftSection),
        sendQr: source.sendQr !== undefined ? Boolean(source.sendQr) : Boolean(demoInvitation.sendQr),
        googlePhotosUrl: source.googlePhotosUrl || source.googlePhotos || demoInvitation.googlePhotosUrl,
        alias: source.alias || "",
        cbu: source.cbu || "",
        giftText: source.giftText || demoInvitation.giftText,
        heroImage: source.heroImage || demoInvitation.heroImage,
        template: source.template || demoInvitation.template,
        createdAt: source.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

function readLocalInvitations() {
    if (typeof window === "undefined") {
        return {};
    }

    try {
        const value = window.localStorage.getItem(INVITATIONS_KEY);
        return value ? JSON.parse(value) : {};
    } catch {
        return {};
    }
}

function writeLocalInvitations(invitations) {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(INVITATIONS_KEY, JSON.stringify(invitations));
}

function readLocalRsvps(slug) {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const value = window.localStorage.getItem(`${RSVPS_KEY_PREFIX}${slug}`);
        return value ? JSON.parse(value) : [];
    } catch {
        return [];
    }
}

function writeLocalRsvps(slug, rows) {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(`${RSVPS_KEY_PREFIX}${slug}`, JSON.stringify(rows));
}

function invitationFromDatabase(row) {
    if (!row) {
        return null;
    }

    return normalizeInvitation({
        ...row,
        timeStart: row.time_start || row.timeStart,
        timeEnd: row.time_end || row.timeEnd,
        dressCode: row.dress_code || row.dressCode,
        dressDescription: row.dress_description || row.dressDescription,
        dressColorsNotAllowed: row.dress_colors_not_allowed || row.dressColorsNotAllowed,
        isOver18: row.is_over_18 ?? row.isOver18 ?? true,
        requireAgeConfirmation: row.require_age_confirmation ?? row.requireAgeConfirmation ?? false,
        showDressCode: row.show_dress_code ?? row.showDressCode ?? true,
        showPhotoAlbum: row.show_photo_album ?? row.showPhotoAlbum ?? true,
        showGiftSection: row.show_gift_section ?? row.showGiftSection ?? true,
        sendQr: row.send_qr ?? row.sendQr ?? false,
        eventType: row.event_type || row.eventType || "Evento",
        googlePhotosUrl: row.google_photos_url || row.googlePhotosUrl || "",
        mapsUrl: row.maps_url || row.mapsUrl,
        giftText: row.gift_text || row.giftText,
        heroImage: row.hero_image || row.heroImage,
        maxGuests: row.max_guests ?? row.maxGuests ?? null,
        createdAt: row.created_at || row.createdAt,
        updatedAt: row.updated_at || row.updatedAt
    });
}

function invitationToDatabase(invitation) {
    return {
        slug: invitation.slug,
        name: invitation.name,
        password: invitation.password,
        subtitle: invitation.subtitle,
        date: invitation.date,
        time_start: invitation.timeStart,
        time_end: invitation.timeEnd,
        venue: invitation.venue,
        address: invitation.address,
        maps_url: invitation.mapsUrl,
        dress_code: invitation.dressCode,
        max_guests: invitation.maxGuests,
        dress_description: invitation.dressDescription,
        dress_colors_not_allowed: invitation.dressColorsNotAllowed,
        is_over_18: invitation.isOver18,
        require_age_confirmation: invitation.requireAgeConfirmation,
        show_dress_code: invitation.showDressCode,
        show_photo_album: invitation.showPhotoAlbum,
        show_gift_section: invitation.showGiftSection,
        send_qr: invitation.sendQr,
        event_type: invitation.eventType,
        google_photos_url: invitation.googlePhotosUrl,
        alias: invitation.alias,
        cbu: invitation.cbu,
        gift_text: invitation.giftText,
        hero_image: invitation.heroImage,
        template: invitation.template,
        created_at: invitation.createdAt,
        updated_at: invitation.updatedAt
    };
}

export async function loadInvitationBySlug(slug) {
    const safeSlug = slugify(String(slug || ""));

    if (!safeSlug || safeSlug === "invitacion") {
        return null;
    }

    if (safeSlug === "demo") {
        return demoInvitation;
    }

    if (["demo-xv", "demo-15", "demo-quince", "xv-demo"].includes(safeSlug)) {
        return xvDemoInvitation;
    }

    if (hasSupabaseConfig && supabase) {
        const { data, error } = await supabase
            .from("invitations")
            .select("*")
            .eq("slug", safeSlug)
            .maybeSingle();

        if (error && error.code !== "PGRST116") {
            console.error("Error loading invitation from Supabase:", error);
        }

        if (data) {
            return invitationFromDatabase(data);
        }
    }

    const invitations = readLocalInvitations();
    return invitations[safeSlug] ? normalizeInvitation(invitations[safeSlug]) : null;
}

export async function hasDuplicateInvitationName(firstName = "", lastName = "", excludeSlug = "") {
    const normalizedFirst = normalizeText(firstName);
    const normalizedLast = normalizeText(lastName);

    if (!normalizedFirst || !normalizedLast) {
        return false;
    }

    const records = [];

    if (hasSupabaseConfig && supabase) {
        const { data, error } = await supabase
            .from("invitations")
            .select("slug, name")
            .neq("slug", slugify(String(excludeSlug || "")));

        if (!error && data) {
            records.push(...data);
        }
    }

    const localInvitations = readLocalInvitations();
    records.push(...Object.values(localInvitations));

    return records.some((item) => {
        const currentSlug = slugify(String(item.slug || ""));

        if (currentSlug === slugify(String(excludeSlug || ""))) {
            return false;
        }

        const currentName = String(item.name || "");
        const parts = splitNameParts(currentName);

        return normalizeText(parts.firstName) === normalizedFirst && normalizeText(parts.lastName) === normalizedLast;
    });
}

export async function saveInvitation(invitation) {
    const normalized = normalizeInvitation(invitation);
    normalized.slug = slugify(normalized.slug);

    const duplicate = await hasDuplicateInvitationName(
        normalized.firstName,
        normalized.lastName,
        normalized.slug
    );

    if (duplicate) {
        throw new Error("Ya existe una invitación con ese mismo nombre y apellido.");
    }

    if (hasSupabaseConfig && supabase) {
        const { data, error } = await supabase
            .from("invitations")
            .upsert(
                invitationToDatabase(normalized),
                { onConflict: "slug" }
            )
            .select()
            .single();

        if (error) {
            console.error("Error saving invitation to Supabase:", error);
            throw new Error("No se pudo guardar la invitación en Supabase. Verificá las tablas y permisos.");
        } else if (data) {
            const record = invitationFromDatabase(data);
            const localInvitations = readLocalInvitations();
            localInvitations[record.slug] = record;
            writeLocalInvitations(localInvitations);
            return record;
        }
    }

    const localInvitations = readLocalInvitations();
    localInvitations[normalized.slug] = normalized;
    writeLocalInvitations(localInvitations);

    return normalized;
}

export async function deleteInvitation(slug) {
    const safeSlug = slugify(String(slug || ""));

    if (!safeSlug || safeSlug === "invitacion") {
        throw new Error("La invitación no es válida.");
    }

    if (hasSupabaseConfig && supabase) {
        const { error } = await supabase
            .from("invitations")
            .delete()
            .eq("slug", safeSlug);

        if (error) {
            console.error("Error deleting invitation from Supabase:", error);
            throw new Error("No se pudo eliminar la invitación de Supabase. Verificá las tablas y permisos.");
        }
    }

    const invitations = readLocalInvitations();
    delete invitations[safeSlug];
    writeLocalInvitations(invitations);

    if (typeof window !== "undefined") {
        window.localStorage.removeItem(`${RSVPS_KEY_PREFIX}${safeSlug}`);
    }
}

export async function loadRsvpsBySlug(slug) {
    const safeSlug = slugify(String(slug || ""));

    if (!safeSlug || safeSlug === "invitacion") {
        return [];
    }

    if (hasSupabaseConfig && supabase) {
        const { data, error } = await supabase
            .from("rsvps")
            .select("*")
            .eq("slug", safeSlug)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error loading RSVPs from Supabase:", error);
        } else if (data) {
            return data.map((item) => ({
                ...item,
                isOver18: item.is_over_18 ?? item.isOver18 ?? true,
                createdAt: item.created_at || item.createdAt || new Date().toISOString(),
                checkedIn: Boolean(item.checked_in ?? item.checkedIn),
                checkedInAt: item.checked_in_at || item.checkedInAt || null,
                ticketToken: item.ticket_token || item.ticketToken || null,
                contactEmail: item.contact_email || item.contactEmail || null,
                contactPhone: item.contact_phone || item.contactPhone || null
            }));
        }
    }

    return readLocalRsvps(safeSlug);
}

export async function hasDuplicateRsvpName(slug, payload = {}) {
    const safeSlug = slugify(String(slug || ""));
    const firstName = String(payload.firstName ?? payload.first_name ?? "").trim();
    const lastName = String(payload.lastName ?? payload.last_name ?? "").trim();
    const fullName = String(payload.name ?? "").trim();
    const normalizedFirst = normalizePersonName(firstName || splitNameParts(fullName).firstName);
    const normalizedLast = normalizePersonName(lastName || splitNameParts(fullName).lastName);

    if (!safeSlug || !normalizedFirst || !normalizedLast) {
        return false;
    }

    const records = [];

    if (hasSupabaseConfig && supabase) {
        const { data, error } = await supabase
            .from("rsvps")
            .select("name")
            .eq("slug", safeSlug);

        if (!error && data) {
            records.push(...data);
        }
    }

    records.push(...readLocalRsvps(safeSlug));

    return records.some((item) => {
        const currentName = String(item.name || "").trim();
        const currentParts = splitNameParts(currentName);
        const currentFirst = normalizePersonName(currentParts.firstName || currentName);
        const currentLast = normalizePersonName(currentParts.lastName || "");

        return currentFirst === normalizedFirst && currentLast === normalizedLast;
    });
}

// Genera un identificador único, random y no adivinable para el QR de cada invitado.
export function generateTicketToken() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID().replace(/-/g, "");
    }

    return Array.from({ length: 24 }, () =>
        "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]
    ).join("");
}

export async function saveRsvp(slug, payload, { sendQr = false } = {}) {
    const safeSlug = slugify(String(slug || ""));
    const firstName = String(payload.firstName ?? payload.first_name ?? "").trim();
    const lastName = String(payload.lastName ?? payload.last_name ?? "").trim();
    const nameFromLegacy = String(payload.name || "").trim();
    const fullName = [
        firstName || splitNameParts(nameFromLegacy).firstName,
        lastName || splitNameParts(nameFromLegacy).lastName
    ].filter(Boolean).join(" ").trim() || nameFromLegacy;

    const nowIso = new Date().toISOString();

    const row = {
        firstName,
        lastName,
        name: fullName,
        restriction: payload.restriction || "Ninguna",
        allergy: String(payload.allergy || "").trim(),
        detail: payload.detail || "",
        isOver18: payload.isOver18 !== undefined ? Boolean(payload.isOver18) : true,
        createdAt: nowIso,
        created_at: nowIso,
        checkedIn: false,
        checkedInAt: null
    };

    if (sendQr) {
        row.ticketToken = generateTicketToken();
        row.contactEmail = payload.contactEmail ? String(payload.contactEmail).trim() : null;
        row.contactPhone = payload.contactPhone ? String(payload.contactPhone).trim() : null;
    }

    if (!safeSlug || !row.name) {
        throw new Error("Faltan datos para confirmar la asistencia.");
    }

    const invitation = await loadInvitationBySlug(safeSlug);

    if (invitation?.maxGuests) {
        const currentRsvps = await loadRsvpsBySlug(safeSlug);

        if (currentRsvps.length >= Number(invitation.maxGuests)) {
            throw new Error("Se alcanzó el cupo máximo de invitados para este evento.");
        }
    }

    const duplicate = await hasDuplicateRsvpName(safeSlug, {
        firstName: row.firstName,
        lastName: row.lastName,
        name: row.name
    });

    if (duplicate) {
        throw new Error("Ya existe una confirmación de asistencia con ese mismo nombre y apellido.");
    }

    if (hasSupabaseConfig && supabase) {
        const { error } = await supabase.from("rsvps").insert([
            {
                slug: safeSlug,
                name: row.name,
                restriction: row.restriction,
                allergy: row.allergy,
                detail: row.detail,
                is_over_18: row.isOver18,
                created_at: row.created_at,
                checked_in: row.checkedIn,
                checked_in_at: row.checkedInAt,
                ticket_token: row.ticketToken || null,
                contact_email: row.contactEmail || null,
                contact_phone: row.contactPhone || null
            }
        ]);

        if (error) {
            console.error("Error saving RSVP to Supabase:", error);
        }
    }

    const localRsvps = readLocalRsvps(safeSlug);
    localRsvps.push(row);
    writeLocalRsvps(safeSlug, localRsvps);

    return row;
}

// Busca el RSVP de un invitado por su token de entrada (para la página de la entrada y la validación).
export async function findRsvpByToken(slug, ticketToken) {
    const safeSlug = slugify(String(slug || ""));

    if (!safeSlug || !ticketToken) {
        return null;
    }

    if (hasSupabaseConfig && supabase) {
        const { data, error } = await supabase
            .from("rsvps")
            .select("*")
            .eq("slug", safeSlug)
            .eq("ticket_token", ticketToken)
            .maybeSingle();

        if (!error && data) {
            return {
                ...data,
                isOver18: data.is_over_18 ?? data.isOver18 ?? true,
                createdAt: data.created_at,
                checkedIn: Boolean(data.checked_in),
                checkedInAt: data.checked_in_at || null,
                ticketToken: data.ticket_token
            };
        }
    }

    const localRsvps = readLocalRsvps(safeSlug);
    return localRsvps.find((row) => row.ticketToken === ticketToken) || null;
}

// Marca la llegada del invitado cuando el admin escanea (o abre) su QR.
export async function checkInRsvp(slug, ticketToken) {
    const safeSlug = slugify(String(slug || ""));

    if (!safeSlug || !ticketToken) {
        return null;
    }

    const nowIso = new Date().toISOString();

    if (hasSupabaseConfig && supabase) {
        const { data, error } = await supabase
            .from("rsvps")
            .update({ checked_in: true, checked_in_at: nowIso })
            .eq("slug", safeSlug)
            .eq("ticket_token", ticketToken)
            .select()
            .maybeSingle();

        if (!error && data) {
            const localRsvps = readLocalRsvps(safeSlug);
            const updatedLocal = localRsvps.map((row) =>
                row.ticketToken === ticketToken
                    ? { ...row, checkedIn: true, checkedInAt: nowIso }
                    : row
            );
            writeLocalRsvps(safeSlug, updatedLocal);

            return {
                ...data,
                isOver18: data.is_over_18 ?? true,
                checkedIn: true,
                checkedInAt: nowIso,
                ticketToken: data.ticket_token
            };
        }
    }

    const localRsvps = readLocalRsvps(safeSlug);
    let updatedRow = null;

    const updatedLocal = localRsvps.map((row) => {
        if (row.ticketToken === ticketToken) {
            updatedRow = { ...row, checkedIn: true, checkedInAt: nowIso };
            return updatedRow;
        }
        return row;
    });

    writeLocalRsvps(safeSlug, updatedLocal);
    return updatedRow;
}

export function getLocalInvitationFallback(slug) {
    const invitations = readLocalInvitations();
    return invitations[slug] || demoInvitation;
}

export function getRsvpStats(rows = []) {
    const safeRows = Array.isArray(rows) ? rows : [];
    const total = safeRows.length;
    const adults = safeRows.filter((row) => row.isOver18 !== false).length;
    const minors = total - adults;
    const restrictions = safeRows.filter((row) => {
        const restriction = String(row.restriction || "").trim();
        return restriction && restriction.toLowerCase() !== "ninguna";
    }).length;
    const allergies = safeRows.filter((row) => {
        const allergy = String(row.allergy || "").trim();
        return Boolean(allergy);
    }).length;

    return {
        total,
        adults,
        minors,
        restrictions,
        allergies
    };
}


export function buildRsvpsCsv(rows = []) {
    const safeRows = Array.isArray(rows) ? rows : [];
    const headers = [
        "name",
        "firstName",
        "lastName",
        "restriction",
        "allergy",
        "detail",
        "isOver18",
        "createdAt",
        "checkedIn",
        "checkedInAt"
    ];

    const escapeCell = (value) => {
        const text = String(value ?? "");
        if (text.includes(",") || text.includes("\n") || text.includes('"')) {
            return `"${text.replace(/"/g, '""')}"`;
        }
        return text;
    };

    const body = safeRows.map((row) => {
        const firstName = String(row.firstName || row.first_name || splitNameParts(String(row.name || "")).firstName || "").trim();
        const lastName = String(row.lastName || row.last_name || splitNameParts(String(row.name || "")).lastName || "").trim();
        const name = String(row.name || [firstName, lastName].filter(Boolean).join(" ") || "").trim();

        return [
            name,
            firstName,
            lastName,
            row.restriction || "Ninguna",
            row.allergy || "",
            row.detail || "",
            row.isOver18 === false ? "false" : "true",
            row.createdAt || row.created_at || "",
            row.checkedIn ? "true" : "false",
            row.checkedInAt || ""
        ].map(escapeCell).join(",");
    }).join("\n");

    return [headers.join(","), body].filter(Boolean).join("\n");
}

export function buildConfirmationQrUrl(slug = "", baseUrl = "") {
    const safeSlug = slugify(String(slug || ""));
    const cleanBase = String(baseUrl || (typeof window !== "undefined" ? window.location.origin : "") || "").replace(/\/$/, "");

    if (!safeSlug) {
        return "";
    }

    return `${cleanBase}/confirmar/${encodeURIComponent(safeSlug)}`;
}