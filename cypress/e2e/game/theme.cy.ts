/// <reference types="cypress" />

import { GamePersistentState, GameState } from "../../../src/game";
import { Preferences } from "../../../src/preferences";

describe("theme", () => {
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
                    unlockables: { 
                        classic: true,
                        initialCommit: true,
                    },
                    hasPlayedBefore: true,
                };
                const preferences: Preferences = {
                    theme: "standard",
                };
                window.localStorage.setItem("2048-game-state", JSON.stringify(gameState));
                window.localStorage.setItem("2048-persistent-state", JSON.stringify(persistentState));
                window.localStorage.setItem("2048-preferences", JSON.stringify(preferences));
            },
        });
    });

    it("should be able to select from any of the available themes", () => {
        cy.get(".settings-link").click();

        cy.get("body").should(($el) => {
            const classList = $el[0].classList;
            expect(classList.contains("tileset-standard")).to.be.true;
        });

        cy.get(".setting.theme-switch").click();

        cy.get("body").should("have.class", "light");
        cy.get("body").should("have.class", "tileset-light");
        cy.get("body").should("have.attr", "style").and("include", "background-color: rgb(255, 255, 255)");
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(255, 255, 255)");

        cy.get(".setting.theme-switch").click();

        cy.get("body").should("have.class", "dark");
        cy.get("body").should("have.class", "tileset-dark");
        cy.get("body").should("have.attr", "style").and("include", "background-color: rgb(28, 28, 28)");
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(28, 28, 28)");

        cy.get(".setting.theme-switch").click();

        cy.get("body").should("have.class", "snow");
        cy.get("body").should("have.class", "tileset-snow");
        cy.get("body").should("have.attr", "style").and("include", "background-color: rgb(2, 0, 36)");
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(2, 0, 36)");

        cy.get(".setting.theme-switch").click();

        cy.get("body").should("have.class", "classic");
        cy.get("body").should("have.class", "tileset-modern");
        cy.get("body").should("have.attr", "style").and("include", "background-color: rgb(128, 128, 128)");
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(128, 128, 128)");

        cy.get(".setting.theme-switch").click();

        cy.get("body").should(($el) => {
            const classList = $el[0].classList;
            expect(classList.contains("tileset-standard")).to.be.true;
        });
        cy.get("body").should("have.attr", "style").and("include", "background-color: rgb(255, 228, 196)");
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(255, 228, 196)");
    });

    it("should not be able to select 2048Clone theme if it's locked", () => {
        cy.visit("/", {
            onBeforeLoad: () => {
                const persistentState: GamePersistentState = {
                    highscore: 0,
                    unlockables: {},
                    hasPlayedBefore: true,
                };
                const preferences: Preferences = {
                    theme: "standard",
                };
                window.localStorage.setItem("2048-persistent-state", JSON.stringify(persistentState));
                window.localStorage.setItem("2048-preferences", JSON.stringify(preferences));
            },
        });

        cy.get(".settings-link").click();

        cy.get("body").should(($el) => {
            const classList = $el[0].classList;
            expect(classList.contains("tileset-standard")).to.be.true;
        });

        cy.get(".setting.theme-switch").click();

        cy.get("body").should("have.class", "light");
        cy.get("body").should("have.class", "tileset-light");

        cy.get(".setting.theme-switch").click();

        cy.get("body").should("have.class", "dark");
        cy.get("body").should("have.class", "tileset-dark");

        cy.get(".setting.theme-switch").click();

        cy.get("body").should("have.class", "snow");
        cy.get("body").should("have.class", "tileset-snow");

        cy.get(".setting.theme-switch").click();

        cy.get("body").should(($el) => {
            const classList = $el[0].classList;
            expect(classList.contains("tileset-standard")).to.be.true;
        });
    });

    it("should set the standard theme on page reload if it's enabled in local storage", () => {
        cy.get("body").should("not.have.class", "");

        window.localStorage.setItem(
            "2048-preferences",
            JSON.stringify({
                theme: "standard",
            })
        );

        cy.reload();

        cy.get("body").should(($el) => {
            const classList = $el[0].classList;
            expect(classList.contains("tileset-standard")).to.be.true;
        });
    });

    it("should set the light theme on page reload if it's enabled in local storage", () => {
        cy.get("body").should("not.have.class", "light");

        window.localStorage.setItem(
            "2048-preferences",
            JSON.stringify({
                theme: "light",
            })
        );

        cy.reload();

        cy.get("body").should("have.class", "light");
    });

    it("should set the dark theme on page reload if it's enabled in local storage", () => {
        cy.get("body").should("not.have.class", "dark");

        window.localStorage.setItem(
            "2048-preferences",
            JSON.stringify({
                theme: "dark",
            })
        );

        cy.reload();

        cy.get("body").should("have.class", "dark");
    });

    it("should set the snow theme on page reload if it's enabled in local storage", () => {
        cy.get("body").should("not.have.class", "snow");

        window.localStorage.setItem(
            "2048-preferences",
            JSON.stringify({
                theme: "snow",
            })
        );

        cy.reload();

        cy.get("body").should("have.class", "snow");
    });

    it("should set the 2048Clone theme on page reload if it's enabled in local storage", () => {
        cy.get("body").should("not.have.class", "classic");

        window.localStorage.setItem(
            "2048-preferences",
            JSON.stringify({
                theme: "classic",
            })
        );

        cy.reload();

        cy.get("body").should("have.class", "classic");
    });

    it("should default to standard theme if no entry exists in local storage for theme", () => {
        cy.get("body").should(($el) => {
            const classList = $el[0].classList;
            expect(classList.contains("tileset-standard")).to.be.true;
        });

        window.localStorage.removeItem("2048-preferences");

        cy.reload();

        cy.get("body").should(($el) => {
            const classList = $el[0].classList;
            expect(classList.contains("tileset-standard")).to.be.true;
        });
    });

    it("should default to standard theme if theme is set to invalid value in local storage", () => {
        cy.get("body").should(($el) => {
            const classList = $el[0].classList;
            expect(classList.contains("tileset-standard")).to.be.true;
        });

        window.localStorage.setItem(
            "2048-preferences",
            JSON.stringify({
                theme: "invalid",
            })
        );

        cy.reload();

        cy.get("body").should(($el) => {
            const classList = $el[0].classList;
            expect(classList.contains("tileset-standard")).to.be.true;
        });
    });

    it("should apply and restore dimmed theme-color when dialog is opened and closed", () => {
        // Verify normal theme color before opening dialog
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(255, 228, 196)");
        cy.get("body").should("have.attr", "style").and("include", "background-color: rgb(255, 228, 196)");
        
        // Open help (which is a dialog with overlay)
        cy.get(".help-link").click();
        
        // When help dialog opens, the theme color should be dimmed
        // Standard theme is bisque (rgb(255, 228, 196))
        // Overlay is rgba(0, 0, 0, 0.5)
        // Blended: rgb(128, 114, 98)
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(128, 114, 98)");
        cy.get("body").should("have.attr", "style").and("include", "background-color: rgb(128, 114, 98)");
        
        // Close the help dialog
        cy.get(".dialog .close").click();
        
        // Theme color should be restored to bisque
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(255, 228, 196)");
        cy.get("body").should("have.attr", "style").and("include", "background-color: rgb(255, 228, 196)");
    });

    it("should restore dimmed theme-color when dialog is closed by clicking the overlay", () => {
        // Verify normal theme color before opening dialog
        // Standard theme is bisque (rgb(255, 228, 196))
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(255, 228, 196)");
        cy.get("body").should("have.attr", "style").and("include", "background-color: rgb(255, 228, 196)");

        // Open help dialog
        cy.get(".help-link").click();

        // Theme color should be dimmed
        // Standard theme is bisque (rgb(255, 228, 196))
        // Overlay is rgba(0, 0, 0, 0.5)
        // Blended: rgb(128, 114, 98)
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(128, 114, 98)");
        cy.get("body").should("have.attr", "style").and("include", "background-color: rgb(128, 114, 98)");

        // Close dialog by clicking the overlay
        cy.get(".overlay-back").click("topLeft");

        // Theme color should be restored to bisque
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(255, 228, 196)");
        cy.get("body").should("have.attr", "style").and("include", "background-color: rgb(255, 228, 196)");
    });

    it("should apply dimmed theme-color for all themes", () => {
        cy.get(".settings-link").click();

        // Test standard theme (default)
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(255, 228, 196)");
        // Standard theme is bisque (rgb(255, 228, 196))
        // Overlay is rgba(0, 0, 0, 0.5)
        // Blended: rgb(128, 114, 98)
        cy.get(".help-link").click();
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(128, 114, 98)");
        cy.get(".dialog .close").click();
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(255, 228, 196)");
        
        // Test light theme
        cy.get(".setting.theme-switch").click();
        // Light theme is #FFF (rgb(255, 255, 255))
        // Overlay is rgba(0, 0, 0, 0.5)
        // Blended: rgb(128, 128, 128)
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(255, 255, 255)");
        cy.get(".help-link").click();
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(128, 128, 128)");
        cy.get(".dialog .close").click();
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(255, 255, 255)");
        
        // Test dark theme
        cy.get(".setting.theme-switch").click();
        // Dark theme is #1c1c1c (rgb(28, 28, 28))
        // Overlay is rgba(0, 0, 0, 0.5)
        // Blended: rgb(14, 14, 14)
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(28, 28, 28)");
        cy.get(".help-link").click();
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(14, 14, 14)");
        cy.get(".dialog .close").click();
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(28, 28, 28)");
        
        // Test snow theme
        cy.get(".setting.theme-switch").click();
        // Snow theme is #020024 (rgb(2, 0, 36))
        // Overlay is rgba(0, 0, 0, 0.5)
        // Blended: rgb(1, 0, 18)
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(2, 0, 36)");
        cy.get(".help-link").click();
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(1, 0, 18)");
        cy.get(".dialog .close").click();
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(2, 0, 36)");
        
        // Test classic theme (pre-unlocked in beforeEach)
        cy.get(".setting.theme-switch").click();
        // Classic theme is rgb(128, 128, 128)
        // Overlay is rgba(0, 0, 0, 0.5)
        // Blended: rgb(64, 64, 64)
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(128, 128, 128)");
        cy.get(".help-link").click();
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(64, 64, 64)");
        cy.get(".dialog .close").click();
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(128, 128, 128)");
        
        // Test classic theme with initial-commit tileset (pre-unlocked in beforeEach)
        cy.get(".setting.tileset-switch").click();
        cy.get(".setting.tileset-switch").click();
        cy.get(".setting.tileset-switch").click();
        // Initial Commit tileset has different background: #6495ed (rgb(100, 149, 237))
        // Overlay is rgba(0, 0, 0, 0.5)
        // Blended: rgb(50, 75, 119)
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(100, 149, 237)");
        cy.get(".help-link").click();
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(50, 75, 119)");
        cy.get(".dialog .close").click();
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(100, 149, 237)");
    });
});
