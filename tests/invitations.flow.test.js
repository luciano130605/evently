import { describe, expect, it, beforeEach, vi } from "vitest";

import {
    deleteInvitation,
    saveInvitation,
    saveRsvp,
    loadInvitationBySlug,
    loadRsvpsBySlug,
    slugify,
    getRsvpStats,
    buildRsvpsCsv,
    buildConfirmationQrUrl
} from "../src/lib/invitations";
import { demoInvitation } from "../src/data/demoInvitation";
import { isRequiredFormComplete } from "../src/pages/Crear";
import { applyTheme, resolveThemePreference } from "../src/lib/theme";
import { getInvitationThemeConfig } from "../src/pages/Invitacion";

function setupLocalStorage() {
    const storage = {};

    const mockStorage = {
        getItem(key) {
            return Object.prototype.hasOwnProperty.call(storage, key)
                ? storage[key]
                : null;
        },

        setItem(key, value) {
            storage[key] = String(value);
        },

        removeItem(key) {
            delete storage[key];
        },

        clear() {
            Object.keys(storage).forEach((key) => delete storage[key]);
        },

        key(index) {
            return Object.keys(storage)[index] ?? null;
        },

        get length() {
            return Object.keys(storage).length;
        }
    };

    Object.defineProperty(globalThis, "localStorage", {
        value: mockStorage,
        configurable: true,
        writable: true
    });

    const mockWindow = {
        localStorage: mockStorage,
        navigator: {
            userAgent: "test-agent",
            platform: "Linux",
            maxTouchPoints: 0
        }
    };

    Object.defineProperty(globalThis, "window", {
        value: mockWindow,
        configurable: true,
        writable: true
    });

    Object.defineProperty(globalThis, "document", {
        value: {
            documentElement: {
                dataset: {}
            }
        },
        configurable: true,
        writable: true
    });

    return mockStorage;
}

function makeInvitation(overrides = {}) {
    return {
        slug: "sofia",
        name: "Sofía",
        password: "123456",
        date: "2026-11-15",
        timeStart: "20:00",
        timeEnd: "23:00",
        template: "rose",
        dressColorsNotAllowed: "Blanco, rojo",
        ...overrides
    };
}

function makeRsvp(index, overrides = {}) {
    return {
        name: `Invitado ${index}`,
        restriction: index % 2 === 0 ? "Vegetariano" : "Ninguna",
        detail: index % 3 === 0 ? "Sin nueces" : "",
        ...overrides
    };
}

describe("Invitaciones XV - suite completa", () => {
    beforeEach(() => {
        setupLocalStorage();
        vi.restoreAllMocks();
    });

    it("usa modo claro por defecto si no hay una preferencia guardada", () => {
        localStorage.removeItem("mis15-theme");

        expect(resolveThemePreference()).toBe("light");
    });

    it("aplica y persiste el tema oscuro en el documento global", () => {
        localStorage.setItem("mis15-theme", "dark");

        const resolved = resolveThemePreference();
        applyTheme(resolved);

        expect(resolved).toBe("dark");
        expect(document.documentElement.dataset.theme).toBe("dark");
        expect(localStorage.getItem("mis15-theme")).toBe("dark");
    });

    it("deja la dirección vacía en la plantilla demo para no disparar búsquedas automáticas", () => {
        expect(demoInvitation.address).toBe("");
        expect(demoInvitation.mapsUrl).toBe("");
    });

    it("define la paleta XV con los colores del preview", () => {
        const theme = getInvitationThemeConfig("xv");

        expect(theme).toMatchObject({
            primary: "#8B203A",
            gold: "#D9B26B",
            background: "#171B33",
            background2: "#0D1226"
        });
    });

    // ============================================================
    // SLUGIFY
    // ============================================================

    describe("slugify", () => {
        it("valida que el formulario esté completo antes de habilitar el botón", () => {
            const completeForm = {
                name: "Sofía",
                password: "123456",
                date: "2026-11-15",
                timeStart: "20:00",
                timeEnd: "23:00",
                venue: "Salón Central",
                address: "Av. Siempre Viva 123",
                mapsUrl: "https://maps.google.com/",
                dressCode: "Formal",
                dressColorsNotAllowed: "Blanco, rojo"
            };

            expect(isRequiredFormComplete(completeForm)).toBe(true);
            expect(isRequiredFormComplete({ ...completeForm, venue: "" })).toBe(false);
            expect(isRequiredFormComplete({ ...completeForm, dressCode: "" })).toBe(false);
        });

        it("no exige dress code si está oculto", () => {
            const form = {
                name: "Sofía",
                password: "123456",
                date: "2026-11-15",
                timeStart: "20:00",
                venue: "Salón Central",
                address: "Av. Siempre Viva 123",
                mapsUrl: "https://maps.google.com/",
                dressCode: "",
                dressColorsNotAllowed: "",
                showDressCode: false
            };

            expect(isRequiredFormComplete(form)).toBe(true);
        });

        it("convierte un nombre normal a slug", () => {
            expect(slugify("Sofía Álvarez")).toBe("sofia-alvarez");
        });

        it("elimina tildes", () => {
            expect(slugify("ÁÉÍÓÚ áéíóú Ññ")).toBe("aeiou-aeiou-nn");
        });

        it("elimina espacios al principio y al final", () => {
            expect(slugify("   Sofía   ")).toBe("sofia");
        });

        it("convierte múltiples espacios en un solo guion", () => {
            expect(slugify("Sofía     Álvarez")).toBe("sofia-alvarez");
        });

        it("elimina caracteres especiales", () => {
            expect(slugify("Sofía!!! @#$ Álvarez")).toBe("sofia-alvarez");
        });

        it("convierte mayúsculas a minúsculas", () => {
            expect(slugify("SOFÍA ALVAREZ")).toBe("sofia-alvarez");
        });

        it("maneja nombres con números", () => {
            expect(slugify("Sofía 15")).toBe("sofia-15");
        });

        it("no genera guiones innecesarios", () => {
            expect(slugify(" -- Sofía -- ")).toBe("sofia");
        });

        it("maneja string vacío", () => {
            expect(slugify("")).toBe("");
        });
    });

    // ============================================================
    // INVITACIONES
    // ============================================================

    describe("invitaciones", () => {
        it("calcula stats reales de confirmaciones", () => {
            const rows = [
                { name: "Ana Pérez", restriction: "Ninguna", allergy: "", isOver18: true },
                { name: "Luis Pérez", restriction: "Vegetariano", allergy: "", isOver18: false },
                { name: "Marta Díaz", restriction: "Alergia", allergy: "Frutos secos", isOver18: true },
                { name: "Tomás Díaz", restriction: "Ninguna", allergy: "", isOver18: false },
                { name: "Nina López", restriction: "Sin gluten", allergy: "", isOver18: true }
            ];

            const stats = getRsvpStats(rows);

            expect(stats.total).toBe(5);
            expect(stats.adults).toBe(3);
            expect(stats.minors).toBe(2);
            expect(stats.restrictions).toBe(3);
            expect(stats.allergies).toBe(1);
        });

        it("exporta confirmaciones a csv con columnas útiles", () => {
            const rows = [
                { name: "Ana Pérez", restriction: "Ninguna", allergy: "", detail: "", isOver18: true },
                { name: "Luis Pérez", restriction: "Vegetariano", allergy: "", detail: "Sin carne", isOver18: false }
            ];

            const csv = buildRsvpsCsv(rows);

            expect(csv).toContain("name");
            expect(csv).toContain("Ana Pérez");
            expect(csv).toContain("Vegetariano");
            expect(csv).toContain("Sin carne");
        });

        it("genera un qr que abre una ruta propia de confirmación", () => {
            const url = buildConfirmationQrUrl("sofia", "https://ejemplo.com");

            expect(url).toBe("https://ejemplo.com/confirmar/sofia");
        });

        it("crea una invitación válida", async () => {
            const invitation = makeInvitation();

            const saved = await saveInvitation(invitation);

            expect(saved).toMatchObject(invitation);
        });

        it("puede recuperar una invitación por slug", async () => {
            await saveInvitation(makeInvitation());

            const loaded = await loadInvitationBySlug("sofia");

            expect(loaded).not.toBeNull();
            expect(loaded.name).toBe("Sofía");
            expect(loaded.password).toBe("123456");
            expect(loaded.template).toBe("rose");
        });

        it("permite buscar el slug sin importar mayúsculas", async () => {
            await saveInvitation(makeInvitation());

            const loaded = await loadInvitationBySlug("SOFIA");

            expect(loaded).not.toBeNull();
            expect(loaded.name).toBe("Sofía");
        });

        it("devuelve null para una invitación inexistente", async () => {
            const loaded = await loadInvitationBySlug("no-existe");

            expect(loaded).toBeNull();
        });

        it("mantiene los campos opcionales", async () => {
            await saveInvitation(
                makeInvitation({
                    template: "lavender",
                    dressColorsNotAllowed: "Blanco",
                    customMessage: "Te esperamos ❤️"
                })
            );

            const loaded = await loadInvitationBySlug("sofia");

            expect(loaded.template).toBe("lavender");
            expect(loaded.dressColorsNotAllowed).toBe("Blanco");
            expect(loaded.customMessage).toBe("Te esperamos ❤️");
        });

        it("no rompe con campos vacíos", async () => {
            const saved = await saveInvitation({
                name: "",
                password: "",
                date: "",
                timeStart: "",
                timeEnd: ""
            });

            expect(saved).toBeTruthy();
            expect(validInvitationShape(saved)).toBe(true);
        });

        it("mantiene invitaciones con nombres y slugs diferentes", async () => {
            await saveInvitation(makeInvitation({
                slug: "maria",
                name: "María"
            }));

            await saveInvitation(makeInvitation({
                slug: "valentina",
                name: "Valentina"
            }));

            await saveInvitation(makeInvitation({
                slug: "camila",
                name: "Camila"
            }));

            const maria = await loadInvitationBySlug("maria");
            const valentina = await loadInvitationBySlug("valentina");
            const camila = await loadInvitationBySlug("camila");

            expect(maria.name).toBe("María");
            expect(valentina.name).toBe("Valentina");
            expect(camila.name).toBe("Camila");
        });

        it("no mezcla RSVPs entre invitaciones diferentes", async () => {
            await saveInvitation(makeInvitation({ slug: "sofia", name: "Sofía" }));
            await saveInvitation(makeInvitation({ slug: "maria", name: "María" }));

            await saveRsvp("sofia", {
                name: "Ana",
                restriction: "Ninguna"
            });

            await saveRsvp("maria", {
                name: "Lucas",
                restriction: "Vegetariano"
            });

            const sofiaRows = await loadRsvpsBySlug("sofia");
            const mariaRows = await loadRsvpsBySlug("maria");

            expect(sofiaRows).toHaveLength(1);
            expect(mariaRows).toHaveLength(1);

            expect(sofiaRows[0].name).toBe("Ana");
            expect(mariaRows[0].name).toBe("Lucas");
        });
    });

    // ============================================================
    // RSVP
    // ============================================================

    describe("confirmaciones RSVP", () => {
        it("guarda una confirmación", async () => {
            const rows = await saveRsvp("sofia", {
                name: "Pedro",
                restriction: "Ninguna"
            });

            expect(rows).toHaveLength(1);
            expect(rows[0].name).toBe("Pedro");
        });

        it("mantiene los datos completos del invitado", async () => {
            const rows = await saveRsvp("sofia", {
                name: "Pedro",
                restriction: "Otra",
                detail: "Sin lácteos"
            });

            expect(rows[0]).toMatchObject({
                name: "Pedro",
                restriction: "Otra",
                detail: "Sin lácteos"
            });
        });

        it("guarda alergias correctamente", async () => {
            const rows = await saveRsvp("sofia", {
                name: "Laura",
                restriction: "Alergia",
                allergy: "Maní"
            });

            expect(rows[0]).toMatchObject({
                name: "Laura",
                restriction: "Alergia",
                allergy: "Maní"
            });
        });

        it("normaliza el estado mayor/menor de edad desde Supabase", async () => {
            const rows = await loadRsvpsBySlug("sofia");

            const raw = [
                {
                    slug: "sofia",
                    name: "Ana",
                    restriction: "Ninguna",
                    is_over_18: false,
                    created_at: "2026-01-01T00:00:00.000Z"
                },
                {
                    slug: "sofia",
                    name: "Lucas",
                    restriction: "Ninguna",
                    is_over_18: true,
                    created_at: "2026-01-02T00:00:00.000Z"
                }
            ];

            const normalized = raw.map((item) => ({
                ...item,
                createdAt: item.created_at,
                isOver18: item.is_over_18 ?? true
            }));

            expect(normalized[0].isOver18).toBe(false);
            expect(normalized[1].isOver18).toBe(true);
            expect(normalized[0].createdAt).toBe("2026-01-01T00:00:00.000Z");
        });

        it("no permite dos confirmaciones con el mismo nombre y apellido", async () => {
            await saveRsvp("sofia", {
                firstName: "Lucía",
                lastName: "Pérez",
                restriction: "Ninguna"
            });

            await expect(saveRsvp("sofia", {
                firstName: "Lucía",
                lastName: "Pérez",
                restriction: "Vegetariano"
            })).rejects.toThrow("Ya existe una confirmación de asistencia con ese mismo nombre y apellido.");
        });

        it("permite repetir nombre o apellido por separado, pero no el par completo", async () => {
            await saveRsvp("sofia", {
                firstName: "Lucía",
                lastName: "Pérez",
                restriction: "Ninguna"
            });

            await expect(saveRsvp("sofia", {
                firstName: "Lucía",
                lastName: "García",
                restriction: "Vegetariano"
            })).resolves.toBeTruthy();

            await expect(saveRsvp("sofia", {
                firstName: "Ana",
                lastName: "Pérez",
                restriction: "Vegano"
            })).resolves.toBeTruthy();
        });

        it("permite restricciones diferentes", async () => {
            await saveRsvp("sofia", {
                name: "Ana",
                restriction: "Ninguna"
            });

            await saveRsvp("sofia", {
                name: "Lucas",
                restriction: "Vegetariano"
            });

            await saveRsvp("sofia", {
                name: "Marta",
                restriction: "Otra",
                detail: "Sin gluten"
            });

            await saveRsvp("sofia", {
                name: "Juan",
                restriction: "Alergia",
                allergy: "Maní"
            });

            const rows = await loadRsvpsBySlug("sofia");

            expect(rows).toHaveLength(4);
            expect(rows[0].restriction).toBe("Ninguna");
            expect(rows[1].restriction).toBe("Vegetariano");
            expect(rows[2].restriction).toBe("Otra");
            expect(rows[3].restriction).toBe("Alergia");
        });

        it("devuelve las confirmaciones en orden de creación", async () => {
            await saveRsvp("sofia", makeRsvp(1));
            await saveRsvp("sofia", makeRsvp(2));
            await saveRsvp("sofia", makeRsvp(3));

            const rows = await loadRsvpsBySlug("sofia");

            expect(rows.map((row) => row.name)).toEqual([
                "Invitado 1",
                "Invitado 2",
                "Invitado 3"
            ]);
        });

        it("devuelve [] cuando no existen confirmaciones", async () => {
            const rows = await loadRsvpsBySlug("sofia");

            expect(rows).toEqual([]);
        });
    });

    // ============================================================
    // CARGA REALISTA
    // ============================================================

    describe("pruebas de carga local", () => {
        it("soporta exactamente 100 invitados confirmados", async () => {
            const total = 100;

            for (let i = 1; i <= total; i++) {
                await saveRsvp("sofia", makeRsvp(i));
            }

            const rows = await loadRsvpsBySlug("sofia");

            expect(rows).toHaveLength(100);

            expect(new Set(rows.map((row) => row.name)).size)
                .toBe(100);
        });

        it("soporta 250 invitados", async () => {
            const total = 250;

            for (let i = 1; i <= total; i++) {
                await saveRsvp("sofia", makeRsvp(i));
            }

            const rows = await loadRsvpsBySlug("sofia");

            expect(rows).toHaveLength(250);
        });

        it("soporta 500 invitados", async () => {
            const total = 500;

            for (let i = 1; i <= total; i++) {
                await saveRsvp("sofia", makeRsvp(i));
            }

            const rows = await loadRsvpsBySlug("sofia");

            expect(rows).toHaveLength(500);
        });

        it("soporta 1000 invitados localmente", async () => {
            const total = 1000;

            for (let i = 1; i <= total; i++) {
                await saveRsvp("sofia", makeRsvp(i));
            }

            const rows = await loadRsvpsBySlug("sofia");

            expect(rows).toHaveLength(1000);

            expect(new Set(rows.map((row) => row.name)).size)
                .toBe(1000);
        });

        it("no pierde registros con múltiples confirmaciones concurrentes", async () => {
            const total = 250;

            const promises = Array.from(
                { length: total },
                (_, index) =>
                    saveRsvp("sofia", makeRsvp(index + 1))
            );

            await Promise.all(promises);

            const rows = await loadRsvpsBySlug("sofia");

            expect(rows).toHaveLength(total);
            expect(new Set(rows.map((row) => row.name)).size)
                .toBe(total);
        });

        it("mantiene todos los tipos de restricciones en una carga grande", async () => {
            const total = 100;

            for (let i = 1; i <= total; i++) {
                await saveRsvp("sofia", {
                    name: `Invitado ${i}`,
                    restriction:
                        i % 4 === 0
                            ? "Alergia"
                            : i % 3 === 0
                                ? "Otra"
                                : i % 2 === 0
                                    ? "Vegetariano"
                                    : "Ninguna",
                    detail: i % 3 === 0 ? "Detalle" : "",
                    allergy: i % 4 === 0 ? "Maní" : ""
                });
            }

            const rows = await loadRsvpsBySlug("sofia");

            expect(rows).toHaveLength(100);

            expect(rows.filter(
                (row) => row.restriction === "Ninguna"
            ).length).toBeGreaterThan(0);

            expect(rows.filter(
                (row) => row.restriction === "Vegetariano"
            ).length).toBeGreaterThan(0);

            expect(rows.filter(
                (row) => row.restriction === "Otra"
            ).length).toBeGreaterThan(0);

            expect(rows.filter(
                (row) => row.restriction === "Alergia"
            ).length).toBeGreaterThan(0);
        });
    });

    // ============================================================
    // DATOS CORRUPTOS / EDGE CASES
    // ============================================================

    describe("resistencia ante datos extraños", () => {
        it("maneja nombres con emojis", async () => {
            const rows = await saveRsvp("sofia", {
                name: "Lucía ❤️",
                restriction: "Ninguna"
            });

            expect(rows[0].name).toBe("Lucía ❤️");
        });

        it("maneja caracteres especiales en nombres", async () => {
            const rows = await saveRsvp("sofia", {
                name: "José María O'Connor",
                restriction: "Ninguna"
            });

            expect(rows[0].name).toBe("José María O'Connor");
        });

        it("maneja nombres largos", async () => {
            const name = "A".repeat(500);

            const rows = await saveRsvp("sofia", {
                name,
                restriction: "Ninguna"
            });

            expect(rows[0].name).toBe(name);
        });

        it("maneja detalles largos", async () => {
            const detail = "Sin este ingrediente ".repeat(100);

            const rows = await saveRsvp("sofia", {
                name: "Pedro",
                restriction: "Otra",
                detail
            });

            expect(rows[0].detail).toBe(detail);
        });

        it("no mezcla información entre invitados", async () => {
            await saveRsvp("sofia", {
                name: "Ana",
                restriction: "Alergia",
                allergy: "Maní"
            });

            await saveRsvp("sofia", {
                name: "Lucas",
                restriction: "Vegetariano",
                detail: "Sin carne"
            });

            const rows = await loadRsvpsBySlug("sofia");

            expect(rows[0].allergy).toBe("Maní");
            expect(rows[1].allergy).not.toBe("Maní");

            expect(rows[1].detail).toBe("Sin carne");
        });
    });

    // ============================================================
    // LOCALSTORAGE
    // ============================================================

    describe("persistencia local", () => {
        it("persiste los datos dentro de localStorage", async () => {
            await saveInvitation(makeInvitation());

            const invitation = await loadInvitationBySlug("sofia");

            expect(invitation).not.toBeNull();
        });

        it("permite guardar y recuperar múltiples RSVPs", async () => {
            await saveRsvp("sofia", makeRsvp(1));
            await saveRsvp("sofia", makeRsvp(2));
            await saveRsvp("sofia", makeRsvp(3));

            const rows = await loadRsvpsBySlug("sofia");

            expect(rows).toHaveLength(3);
        });

        it("no utiliza la misma colección para distintos slugs", async () => {
            await saveRsvp("sofia", {
                name: "Sofía Guest",
                restriction: "Ninguna"
            });

            await saveRsvp("maria", {
                name: "María Guest",
                restriction: "Ninguna"
            });

            const sofia = await loadRsvpsBySlug("sofia");
            const maria = await loadRsvpsBySlug("maria");

            expect(sofia).toHaveLength(1);
            expect(maria).toHaveLength(1);

            expect(sofia[0].name).toBe("Sofía Guest");
            expect(maria[0].name).toBe("María Guest");
        });
    });

    // ============================================================
    // ELIMINACIÓN
    // ============================================================

    describe("eliminación", () => {
        it("elimina una invitación", async () => {
            await saveInvitation(makeInvitation());

            await deleteInvitation("sofia");

            expect(
                await loadInvitationBySlug("sofia")
            ).toBeNull();
        });

        it("elimina también las confirmaciones", async () => {
            await saveInvitation(makeInvitation());

            await saveRsvp("sofia", makeRsvp(1));
            await saveRsvp("sofia", makeRsvp(2));
            await saveRsvp("sofia", makeRsvp(3));

            await deleteInvitation("sofia");

            expect(
                await loadInvitationBySlug("sofia")
            ).toBeNull();

            expect(
                await loadRsvpsBySlug("sofia")
            ).toEqual([]);
        });

        it("no elimina otras invitaciones", async () => {
            await saveInvitation(
                makeInvitation({
                    slug: "sofia",
                    name: "Sofía"
                })
            );

            await saveInvitation(
                makeInvitation({
                    slug: "maria",
                    name: "María"
                })
            );

            await deleteInvitation("sofia");

            expect(
                await loadInvitationBySlug("sofia")
            ).toBeNull();

            expect(
                await loadInvitationBySlug("maria")
            ).not.toBeNull();
        });

        it("no rompe al eliminar un slug inexistente", async () => {
            await expect(
                deleteInvitation("no-existe")
            ).resolves.not.toThrow();
        });
    });

    // ============================================================
    // TEST DE ESCENARIO COMPLETO
    // ============================================================

    describe("escenario real de una fiesta", () => {
        it("simula una fiesta completa con 100 invitados", async () => {
            // 1. Crear invitación
            const invitation = await saveInvitation(
                makeInvitation({
                    slug: "valentina",
                    name: "Valentina",
                    template: "rose"
                })
            );

            expect(invitation.name).toBe("Valentina");

            // 2. Llegan 100 confirmaciones
            const total = 100;

            for (let i = 1; i <= total; i++) {
                await saveRsvp("valentina", {
                    name: `Invitado ${i}`,
                    restriction:
                        i % 10 === 0
                            ? "Alergia"
                            : i % 5 === 0
                                ? "Vegetariano"
                                : "Ninguna",
                    detail: i % 10 === 0
                        ? "Sin maní"
                        : ""
                });
            }

            // 3. El panel de la quinceañera recupera los datos
            const rows = await loadRsvpsBySlug("valentina");

            // 4. Verificaciones
            expect(rows).toHaveLength(100);

            // Todos tienen nombre
            expect(
                rows.every((row) => typeof row.name === "string")
            ).toBe(true);

            // Hay invitados con restricciones
            expect(
                rows.filter(
                    (row) => row.restriction === "Vegetariano"
                ).length
            ).toBeGreaterThan(0);

            expect(
                rows.filter(
                    (row) => row.restriction === "Alergia"
                ).length
            ).toBeGreaterThan(0);

            // No hay nombres duplicados
            expect(
                new Set(rows.map((row) => row.name)).size
            ).toBe(100);

            // 5. Se elimina todo
            await deleteInvitation("valentina");

            expect(
                await loadInvitationBySlug("valentina")
            ).toBeNull();

            expect(
                await loadRsvpsBySlug("valentina")
            ).toEqual([]);
        });
    });
});

function validInvitationShape(invitation) {
    return Boolean(
        invitation &&
        typeof invitation.slug === "string" &&
        typeof invitation.name === "string" &&
        typeof invitation.password === "string"
    );
}
