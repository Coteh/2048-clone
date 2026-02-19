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
                    unlockables: { classic: true },
                    hasPlayedBefore: true,
                };
                const preferences: Preferences = {
                    theme: "standard",
                };
                window.localStorage.setItem("game-state", JSON.stringify(gameState));
                window.localStorage.setItem("persistent-state", JSON.stringify(persistentState));
                window.localStorage.setItem("preferences", JSON.stringify(preferences));
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
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "#FFF");

        cy.get(".setting.theme-switch").click();

        cy.get("body").should("have.class", "dark");
        cy.get("body").should("have.class", "tileset-dark");
        cy.get("body").should("have.attr", "style").and("include", "background-color: rgb(28, 28, 28)");
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "#1c1c1c");

        cy.get(".setting.theme-switch").click();

        cy.get("body").should("have.class", "snow");
        cy.get("body").should("have.class", "tileset-snow");
        cy.get("body").should("have.attr", "style").and("include", "background-color: rgb(2, 0, 36)");
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "#020024");

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
        cy.get("body").should("have.attr", "style").and("include", "background-color: bisque");
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "bisque");
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
                window.localStorage.setItem("persistent-state", JSON.stringify(persistentState));
                window.localStorage.setItem("preferences", JSON.stringify(preferences));
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
            "preferences",
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
            "preferences",
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
            "preferences",
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
            "preferences",
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
            "preferences",
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

        window.localStorage.removeItem("preferences");

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
            "preferences",
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

    it("should apply and restore dimmed theme-color when settings dialog is opened and closed", () => {
        // Verify normal theme color before opening dialog
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "bisque");
        cy.get("body").should("have.attr", "style").and("include", "background-color: bisque");
        
        // Open settings (which is itself a dialog with overlay)
        cy.get(".settings-link").click();
        
        // When settings dialog opens, the theme color should be dimmed
        // Standard theme is bisque (rgb(255, 228, 196))
        // Overlay is rgba(0, 0, 0, 0.5)
        // Blended: rgb(128, 114, 98)
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(128, 114, 98)");
        cy.get("body").should("have.attr", "style").and("include", "background-color: rgb(128, 114, 98)");
        
        // Close the settings dialog
        cy.get(".settings .close").click();
        
        // Theme color should be restored to bisque
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "bisque");
        cy.get("body").should("have.attr", "style").and("include", "background-color: bisque");
    });

    it("should apply dimmed theme-color for all themes", () => {
        // Test standard theme (default)
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "bisque");
        cy.get(".settings-link").click();
        // Standard theme is bisque (rgb(255, 228, 196))
        // Overlay is rgba(0, 0, 0, 0.5)
        // Blended: rgb(128, 114, 98)
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(128, 114, 98)");
        cy.get(".settings .close").click();
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "bisque");
        
        // Test light theme
        cy.get(".settings-link").click();
        cy.get(".setting.theme-switch").click();
        // Light theme is #FFF (rgb(255, 255, 255))
        // Overlay is rgba(0, 0, 0, 0.5)
        // Blended: rgb(128, 128, 128)
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(128, 128, 128)");
        cy.get(".settings .close").click();
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "#FFF");
        
        // Test dark theme
        cy.get(".settings-link").click();
        cy.get(".setting.theme-switch").click();
        // Dark theme is #1c1c1c (rgb(28, 28, 28))
        // Overlay is rgba(0, 0, 0, 0.5)
        // Blended: rgb(14, 14, 14)
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(14, 14, 14)");
        cy.get(".settings .close").click();
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "#1c1c1c");
        
        // Test snow theme
        cy.get(".settings-link").click();
        cy.get(".setting.theme-switch").click();
        // Snow theme is #020024 (rgb(2, 0, 36))
        // Overlay is rgba(0, 0, 0, 0.5)
        // Blended: rgb(1, 0, 18)
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(1, 0, 18)");
        cy.get(".settings .close").click();
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "#020024");
        
        // Test classic theme (requires unlocking)
        // Unlock classic theme by winning
        cy.window().then((win) => {
            const gameState = (win as any).gameState;
            gameState.board = [
                [2048, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            gameState.won = true;
        });
        cy.get("button.win-continue").click();
        
        // Now switch to classic theme
        cy.get(".settings-link").click();
        cy.get(".setting.theme-switch").click();
        // Classic theme is rgb(169, 169, 169)
        // Overlay is rgba(0, 0, 0, 0.5)
        // Blended: rgb(85, 85, 85)
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(85, 85, 85)");
        cy.get(".settings .close").click();
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(169, 169, 169)");
        
        // Test classic theme with initial-commit tileset (requires unlocking)
        // Unlock initial commit tileset by achieving score of 2048
        cy.window().then((win) => {
            const persistentState = (win as any).persistentState;
            persistentState.unlockables.initialCommit = true;
        });
        
        cy.get(".settings-link").click();
        cy.get(".setting.tileset-switch").click();
        // Still same classic theme color with different tileset
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(85, 85, 85)");
        cy.get(".settings .close").click();
        cy.get('meta[name="theme-color"]').should("have.attr", "content", "rgb(169, 169, 169)");
    });
});
