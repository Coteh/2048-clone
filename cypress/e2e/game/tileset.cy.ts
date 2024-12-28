/// <reference types="cypress" />

import { GamePersistentState, GameState } from "../../../src/game";
import { Preferences } from "../../../src/preferences";

describe("tileset", () => {
    beforeEach(() => {
        cy.clearBrowserCache();
        cy.visit("/", {
            onBeforeLoad: () => {
                const gameState: GameState = {
                    board: [
                        [2, 0, 0, 0],
                        [4, 0, 0, 0],
                        [8, 0, 0, 0],
                        [16, 0, 0, 0],
                    ],
                    ended: false,
                    won: false,
                    score: 28,
                    didUndo: false,
                    achievedHighscore: false,
                    moveCount: 0,
                };
                const persistentState: GamePersistentState = {
                    highscore: 0,
                    unlockables: { classic: true },
                    hasPlayedBefore: true,
                };
                const preferences: Preferences = {
                    theme: "classic",
                };
                window.localStorage.setItem("game-state", JSON.stringify(gameState));
                window.localStorage.setItem("persistent-state", JSON.stringify(persistentState));
                window.localStorage.setItem("preferences", JSON.stringify(preferences));
            },
        });
    });

    it("should be able to select from any of the available tilesets for a given theme", () => {
        cy.get(".settings-link").click();

        cy.get("body").should(($el) => {
            const classList = $el[0].classList;
            expect(classList.contains("classic")).to.be.true;
            expect(classList.contains("tileset-modern")).to.be.true;
        });
        cy.get(".settings-item").contains("Theme").should("be.visible");
        cy.get(".settings-item").contains("Tileset").should("be.visible");

        cy.get(".setting.tileset-switch").click();

        cy.get("body").should("have.class", "classic");
        cy.get("body").should("have.class", "tileset-classic");
        cy.get(".settings-item").contains("Theme").should("be.visible");
        cy.get(".settings-item").contains("Tileset").should("be.visible");

        cy.get(".setting.tileset-switch").click();

        cy.get("body").should("have.class", "classic");
        cy.get("body").should("have.class", "tileset-colorful");
        cy.get(".settings-item").contains("Theme").should("be.visible");
        cy.get(".settings-item").contains("Tileset").should("be.visible");

        cy.get(".setting.tileset-switch").click();

        cy.get("body").should("have.class", "classic");
        cy.get("body").should("have.class", "tileset-modern");
        cy.get(".settings-item").contains("Theme").should("be.visible");
        cy.get(".settings-item").contains("Tileset").should("be.visible");
    });

    it("should set the tileset on page reload if it's enabled in local storage for the selected theme", () => {
        window.localStorage.setItem(
            "preferences",
            JSON.stringify({
                theme: "classic",
                tileset: {
                    classic: "colorful",
                },
            })
        );

        cy.reload();

        cy.get("body").should(($el) => {
            const classList = $el[0].classList;
            expect(classList.contains("classic")).to.be.true;
            expect(classList.contains("tileset-colorful")).to.be.true;
        });
    });

    it("should default to the first tileset for a theme if there's no selected tileset in local storage", () => {
        window.localStorage.setItem(
            "preferences",
            JSON.stringify({
                theme: "classic",
            })
        );

        cy.reload();

        cy.get("body").should(($el) => {
            const classList = $el[0].classList;
            expect(classList.contains("classic")).to.be.true;
            expect(classList.contains("tileset-modern")).to.be.true;
        });
    });

    it("should default to the first tileset for a theme if the tileset in local storage for the selected theme is invalid", () => {
        window.localStorage.setItem(
            "preferences",
            JSON.stringify({
                theme: "light",
                tileset: {
                    light: "invalid",
                },
            })
        );

        cy.reload();

        cy.get("body").should(($el) => {
            const classList = $el[0].classList;
            expect(classList.contains("light")).to.be.true;
            expect(classList.contains("tileset-light")).to.be.true;
        });
    });

    it("should default to the first tileset for a theme if tileset is set to invalid value in local storage", () => {
        window.localStorage.setItem(
            "preferences",
            JSON.stringify({
                theme: "classic",
                tileset: "invalid",
            })
        );

        cy.reload();

        cy.get("body").should(($el) => {
            const classList = $el[0].classList;
            expect(classList.contains("classic")).to.be.true;
            expect(classList.contains("tileset-modern")).to.be.true;
        });
    });

    it("should hide the tileset option if a theme has just one tileset", () => {
        cy.get(".settings-link").click();

        cy.get(".settings-item").contains("Theme").should("be.visible");
        cy.get(".settings-item").contains("Tileset").should("be.visible");

        window.localStorage.setItem(
            "preferences",
            JSON.stringify({
                theme: "standard",
                tileset: {
                    standard: "standard",
                },
            })
        );

        cy.reload();

        cy.get(".settings-link").click();

        cy.get(".settings-item").contains("Theme").should("be.visible");
        cy.get(".settings-item").contains("Tileset").should("not.be.visible");
    });
});
