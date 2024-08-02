/// <reference types="cypress" />

import { GameState, GamePersistentState } from "../../../src/game";
import { Preferences } from "../../../src/preferences";

describe("gameplay", () => {
    beforeEach(() => {
        cy.clearBrowserCache();
        cy.visit("/", {
            onBeforeLoad: () => {
                const gameState: GameState = {
                    board: [
                        [0, 0, 0, 0],
                        [0, 2, 0, 0],
                        [0, 0, 4, 0],
                        [0, 0, 0, 0],
                    ],
                    ended: false,
                    won: false,
                    score: 0,
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

    // TODO: Implement this test
    it.skip("should allow player to swipe to move the blocks", () => {
        throw new Error("Test not implemented");
    });

    it("should allow player to move blocks using right arrow key", () => {
        cy.verifyBoard([
            [0, 0, 0, 0],
            [0, 2, 0, 0],
            [0, 0, 4, 0],
            [0, 0, 0, 0],
        ]);

        cy.get("body").type("{rightArrow}");

        cy.verifyBoard([
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, 2],
            [undefined, undefined, undefined, 4],
            [undefined, undefined, undefined, undefined],
        ]);
    });

    it("should allow player to move blocks using left arrow key", () => {
        cy.verifyBoard([
            [0, 0, 0, 0],
            [0, 2, 0, 0],
            [0, 0, 4, 0],
            [0, 0, 0, 0],
        ]);

        cy.get("body").type("{leftArrow}");

        cy.verifyBoard([
            [undefined, undefined, undefined, undefined],
            [2, undefined, undefined, undefined],
            [4, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
        ]);
    });

    it("should allow player to move blocks using down arrow key", () => {
        cy.verifyBoard([
            [0, 0, 0, 0],
            [0, 2, 0, 0],
            [0, 0, 4, 0],
            [0, 0, 0, 0],
        ]);

        cy.get("body").type("{downArrow}");

        cy.verifyBoard([
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
            [undefined, 2, 4, undefined],
        ]);
    });

    it("should allow player to move blocks using up arrow key", () => {
        cy.verifyBoard([
            [0, 0, 0, 0],
            [0, 2, 0, 0],
            [0, 0, 4, 0],
            [0, 0, 0, 0],
        ]);

        cy.get("body").type("{upArrow}");

        cy.verifyBoard([
            [undefined, 2, 4, undefined],
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
        ]);
    });

    // TODO: Implement this test
    it.skip("should allow player to click new game to restart the game", () => {
        throw new Error("Test not implemented");
    });
});
