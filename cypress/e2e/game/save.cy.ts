/// <reference types="cypress" />

import { GamePersistentState, GameState } from "../../../src/game";
import { Preferences } from "../../../src/preferences";

// TODO: Implement these tests
describe.skip("retrieving saved progress", () => {
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

    it("should load saved state", () => {
        // TODO: Implement these test cases
        
        // First check to see if game state loads up

        // Then check if persistent state loads up

        // Finally check if preferences are loaded

        // Now load up a game state where the player got 2048 and is still going

        // Now load up a game state where the player lost, a lose popup should appear as well.

        throw new Error("TODO: Check if all local states load up upon game start");
    });
});
