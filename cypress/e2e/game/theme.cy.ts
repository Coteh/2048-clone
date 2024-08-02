/// <reference types="cypress" />

import { GamePersistentState, GameState } from "../../../src/game";
import { Preferences } from "../../../src/preferences";

// TODO: Implement these tests
describe.skip("theme", () => {
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
                    unlockables: {},
                    hasPlayedBefore: true,
                };
                const preferences: Preferences = {
                    theme: "dark",
                };
                window.localStorage.setItem("game-state", JSON.stringify(gameState));
                window.localStorage.setItem("persistent-state", JSON.stringify(persistentState));
                window.localStorage.setItem("preferences", JSON.stringify(preferences));
            },
        });
    });

    it("should be able to select from any of the available themes", () => {
        cy.get(".settings-link").click();

        cy.get("body").should("have.class", "");

        cy.get(".setting.theme-switch").click();

        cy.get("body").should("have.class", "light");

        cy.get(".setting.theme-switch").click();

        cy.get("body").should("have.class", "dark");

        cy.get(".setting.theme-switch").click();

        cy.get("body").should("have.class", "classic");

        cy.get(".setting.theme-switch").click();

        cy.get("body").should("have.class", "");
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

        cy.get("body").should("have.class", "");
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

    // it("should set the snow theme on page reload if it's enabled in local storage", () => {
    //     cy.get("body").should("not.have.class", "snow");

    //     window.localStorage.setItem(
    //         "preferences",
    //         JSON.stringify({
    //             theme: "snow",
    //         })
    //     );

    //     cy.reload();

    //     cy.get("body").should("have.class", "snow");
    // });

    it("should default to standard theme if no entry exists in local storage for theme", () => {
        cy.get("body").should("have.class", "");

        window.localStorage.removeItem("preferences");

        cy.reload();

        cy.get("body").should("have.class", "");
    });

    it("should default to standard theme if theme is set to invalid value in local storage", () => {
        cy.get("body").should("have.class", "");

        window.localStorage.setItem(
            "preferences",
            JSON.stringify({
                theme: "invalid",
            })
        );

        cy.reload();

        cy.get("body").should("have.class", "");
    });
});
