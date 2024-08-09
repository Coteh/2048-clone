/// <reference types="cypress" />

import { GamePersistentState, GameState } from "../../../src/game";
import { Preferences } from "../../../src/preferences";

// TODO: Implement tests
describe.skip("tileset", () => {
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

    it("should be able to select from any of the available tilesets for a given theme", () => {
        cy.get(".settings-link").click();

        cy.get("body").should(($el) => {
            const classList = $el[0].classList;
            expect(classList.length).to.equal(1);
            expect(classList.contains("tileset-standard")).to.be.true;
        });

        cy.get(".setting.theme-switch").click();

        cy.get("body").should("have.class", "light");
        cy.get("body").should("have.class", "tileset-light");

        cy.get(".setting.theme-switch").click();

        cy.get("body").should("have.class", "dark");
        cy.get("body").should("have.class", "tileset-dark");

        cy.get(".setting.theme-switch").click();

        cy.get("body").should("have.class", "classic");
        cy.get("body").should("have.class", "tileset-modern");

        cy.get(".setting.theme-switch").click();

        cy.get("body").should(($el) => {
            const classList = $el[0].classList;
            expect(classList.length).to.equal(1);
            expect(classList.contains("tileset-standard")).to.be.true;
        });

        throw new Error("TODO: Implement test");
    });

    it("should set the tileset on page reload if it's enabled in local storage for the selected theme", () => {
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
            expect(classList.length).to.equal(1);
            expect(classList.contains("tileset-standard")).to.be.true;
        });

        throw new Error("TODO: Implement test");
    });

    it("should default to the first tileset for a theme if there's no selected tileset in local storage", () => {
        throw new Error("TODO: Implement test");
    });

    it("should default to the first tileset for a theme if tileset is set to invalid value in local storage", () => {
        throw new Error("TODO: Implement test");
    });

    it("should hide the tileset option if a theme has just one tileset", () => {
        throw new Error("TODO: Implement test");
    });
});
