/// <reference types="cypress" />

import { GamePersistentState, GameState } from "../../../src/game";
import { Preferences } from "../../../src/preferences";

describe("misc", () => {
    beforeEach(() => {
        cy.clearBrowserCache();
        cy.visit("/", {
            onBeforeLoad: () => {
                const gameState: GameState = {
                    board: [
                        [0, 0, 2, 4],
                        [0, 2, 8, 16],
                        [0, 8, 16, 32],
                        [8, 16, 32, 128],
                    ],
                    ended: false,
                    won: false,
                    score: 1072,
                    didUndo: false,
                    achievedHighscore: false,
                };
                const persistentState: GamePersistentState = {
                    highscore: 8300,
                    unlockables: {},
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

    specify("gameplay screenshot", () => {
        cy.viewport("iphone-6");

        cy.screenshot("readme/screenshot", {
            capture: "viewport",
            overwrite: true,
        });
    });
});
