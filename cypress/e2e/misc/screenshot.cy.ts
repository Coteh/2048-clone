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
                    moveCount: 0,
                };
                const persistentState: GamePersistentState = {
                    highscore: 8300,
                    unlockables: {},
                    hasPlayedBefore: true,
                };
                const preferences: Preferences = {
                    theme: "standard",
                    animations: "enabled",
                };
                window.localStorage.setItem("game-state", JSON.stringify(gameState));
                window.localStorage.setItem("persistent-state", JSON.stringify(persistentState));
                window.localStorage.setItem("preferences", JSON.stringify(preferences));
            },
        });
    });

    specify("gameplay screenshot", () => {
        cy.viewport("iphone-6");

        // Hide debug elements from the screenshot
        cy.get("body").type("d");
        cy.get("#debug-overlay").should("be.visible").click({
            force: true,
        });

        // TODO: Create a video screenshot for the readme.
        // What needs to be fixed:
        // - screenshot.sh needs to reposition the ffmpeg crop to where the game is located on the page
        // - Animations look very choppy on the video taken by Cypress

        // After this delay, the video screenshot should start.
        cy.wait(1000);

        // Static screenshot taken for now
        cy.screenshot("readme/screenshot", {
            capture: "viewport",
            overwrite: true,
        });

        cy.get("body").type("{leftArrow}");

        cy.wait(500);

        cy.get("body").type("{downArrow}");

        cy.wait(500);

        cy.get("body").type("{leftArrow}");

        cy.wait(500);

        cy.get("body").type("{downArrow}");
    });
});
