import { describe, expect, it, beforeEach, vi } from "vitest";

import { deleteInvitation, saveInvitation, saveRsvp, loadInvitationBySlug, loadRsvpsBySlug, slugify } from "../src/lib/invitations";

function setupLocalStorage() {
    const storage = {};

    const mockStorage = {
        getItem(key) {
            return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null;
        },
        setItem(key, value) {
            storage[key] = String(value);
        },
        removeItem(key) {
            delete storage[key];
        },
        clear() {
            Object.keys(storage).forEach((key) => delete storage[key]);
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

    return mockStorage;
}

describe("flujo completo de invitaciones XV", () => {
    beforeEach(() => {
        setupLocalStorage();
        vi.restoreAllMocks();
    });

    it("genera slug limpio a partir del nombre de la quinceañera", () => {
        expect(slugify("Sofía Álvarez!")) .toBe("sofia-alvarez");
        expect(slugify("   Sofía   ")).toBe("sofia");
    });

    it("crea una invitación válida y la puede recuperar por slug", async () => {
        const invitation = {
            slug: "sofia",
            name: "Sofía",
            password: "123456",
            date: "2026-11-15",
            timeStart: "20:00",
            timeEnd: "23:00",
            template: "rose",
            dressColorsNotAllowed: "Blanco, rojo"
        };

        const saved = await saveInvitation(invitation);
        const loaded = await loadInvitationBySlug("sofia");

        expect(saved.slug).toBe("sofia");
        expect(loaded.name).toBe("Sofía");
        expect(loaded.password).toBe("123456");
        expect(loaded.template).toBe("rose");
        expect(loaded.dressColorsNotAllowed).toBe("Blanco, rojo");
    });

    it("guarda varias confirmaciones y las devuelve ordenadas por fecha de creación", async () => {
        const slug = "sofia";

        await saveRsvp(slug, { name: "Ana", restriction: "Vegetariano", detail: "" });
        await saveRsvp(slug, { name: "Lucas", restriction: "Ninguna", detail: "" });
        await saveRsvp(slug, { name: "Marta", restriction: "Otra", detail: "Sin gluten" });

        const rows = await loadRsvpsBySlug(slug);

        expect(rows).toHaveLength(3);
        expect(rows.map((row) => row.name)).toEqual(["Ana", "Lucas", "Marta"]);
    });

    it("mantiene los datos del invitado y la restricción alimentaria en la confirmación", async () => {
        const slug = "sofia";

        const rows = await saveRsvp(slug, {
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

    it("guarda el detalle de una alergia", async () => {
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

    it("no rompe si se intenta guardar una invitación sin nombre o con campos vacíos", async () => {
        const invalid = await saveInvitation({ name: "", password: "", date: "", timeStart: "", timeEnd: "" });

        expect(invalid.name).toBeTruthy();
        expect(validInvitationShape(invalid)).toBe(true);
    });

    it("simula un alto volumen de usuarios confirmando al mismo tiempo y no pierde registros", async () => {
        const slug = "maria";
        const totalUsers = 250;

        const promises = Array.from({ length: totalUsers }).map((_, index) =>
            saveRsvp(slug, {
                name: `Usuario ${index + 1}`,
                restriction: index % 2 === 0 ? "Ninguna" : "Vegetariano",
                detail: index % 3 === 0 ? "Sin nueces" : ""
            })
        );

        await Promise.all(promises);

        const rows = await loadRsvpsBySlug(slug);

        expect(rows).toHaveLength(totalUsers);
        expect(new Set(rows.map((row) => row.name)).size).toBe(totalUsers);
    });

    it("guarda varios slugs distintos sin pisar invitaciones ya creadas", async () => {
        await saveInvitation({ slug: "maria", name: "María", password: "abc", date: "2026-12-10", timeStart: "20:00", timeEnd: "23:00" });
        await saveInvitation({ slug: "sofia", name: "Sofía", password: "def", date: "2026-11-15", timeStart: "21:00", timeEnd: "00:00" });

        const maria = await loadInvitationBySlug("maria");
        const sofia = await loadInvitationBySlug("sofia");

        expect(maria.name).toBe("María");
        expect(sofia.name).toBe("Sofía");
    });

    it("elimina la invitación y sus confirmaciones", async () => {
        await saveInvitation({ slug: "sofia", name: "Sofía", password: "123456" });
        await saveRsvp("sofia", { name: "Ana", restriction: "Ninguna" });

        await deleteInvitation("SOFIA");

        expect(await loadInvitationBySlug("sofia")).toBeNull();
        expect(await loadRsvpsBySlug("sofia")).toEqual([]);
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
