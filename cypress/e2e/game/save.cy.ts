/// <reference types="cypress" />

import { GamePersistentState, GameState } from "../../../src/game";
import { Preferences } from "../../../src/preferences";

describe("retrieving saved progress", () => {
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
                };
                const persistentState: GamePersistentState = {
                    highscore: 1234,
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

    it("should load saved state", () => {
        // First check to see if game state loads up
        cy.verifyBoardMatches([
            [2, 0, 0, 0],
            [4, 0, 0, 0],
            [8, 0, 0, 0],
            [16, 0, 0, 0],
        ]);

        // Then check if persistent state loads up
        cy.contains("Best 1234").should("be.visible");

        // Finally check if preferences are loaded
        cy.get("body").should("have.class", "dark");
        cy.get("body").should("have.class", "tileset-dark");

        // Now load up a game state where the player lost, a lose popup should appear as well.
        cy.contains("You lose!").should("not.exist");

        cy.get(".debug-link#debug").click();
        cy.contains("New Losing Game").click();
        cy.get("body").type("{rightArrow}");

        cy.contains("You lose!").should("be.visible");

        cy.reload();

        cy.contains("You lose!").should("be.visible");
    });
});
