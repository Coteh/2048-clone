/// <reference types="cypress" />

import { GamePersistentState, GameState } from "../../../src/game";
import { Preferences } from "../../../src/preferences";

// TODO: Implement these tests
describe.skip("misc", () => {
    beforeEach(() => {
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

    it("gameplay screenshot", () => {
        cy.viewport("iphone-x");

        cy.clearBrowserCache();
        cy.reload();

        cy.wait(1000);

        // TODO: Do some gameplay here

        // cy.get("body").type("{rightArrow}");
        // cy.get("body").type("{downArrow}");
        // cy.get("body").type("{leftArrow}");
        // cy.get("body").type("{upArrow}");

        throw new Error("TODO: Setup gameplay screenshot test here");
    });
});
