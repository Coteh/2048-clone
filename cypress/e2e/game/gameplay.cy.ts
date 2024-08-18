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
                    achievedHighscore: false,
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

    // TODO: In theory, this should work. But it doesn't for some reason.
    it.skip("should allow player to swipe right to move the blocks", () => {
        cy.viewport("iphone-xr");

        cy.verifyBoard([
            [0, 0, 0, 0],
            [0, 2, 0, 0],
            [0, 0, 4, 0],
            [0, 0, 0, 0],
        ]);

        cy.get("#swipeArea").realSwipe("toRight");

        cy.verifyBoard([
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, 2],
            [undefined, undefined, undefined, 4],
            [undefined, undefined, undefined, undefined],
        ]);
    });

    // TODO: In theory, this should work. But it doesn't for some reason.
    it.skip("should allow player to swipe left to move the blocks", () => {
        cy.viewport("iphone-xr");

        cy.verifyBoard([
            [0, 0, 0, 0],
            [0, 2, 0, 0],
            [0, 0, 4, 0],
            [0, 0, 0, 0],
        ]);

        cy.get("#swipeArea").realSwipe("toLeft");

        // Alternative way of doing it (doesn't work either)
        // cy.get("#swipeArea")
        //     .trigger("touchstart", { touches: [{ pageX: 300, pageY: 200 }] })
        //     .trigger("touchmove", { touches: [{ pageX: 100, pageY: 200 }] })
        //     .trigger("touchend", { force: true });

        cy.verifyBoard([
            [undefined, undefined, undefined, undefined],
            [2, undefined, undefined, undefined],
            [4, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
        ]);
    });

    // TODO: In theory, this should work. But it doesn't for some reason.
    it.skip("should allow player to swipe down to move the blocks", () => {
        cy.viewport("iphone-xr");

        cy.verifyBoard([
            [0, 0, 0, 0],
            [0, 2, 0, 0],
            [0, 0, 4, 0],
            [0, 0, 0, 0],
        ]);

        cy.get("#swipeArea").realSwipe("toBottom");

        cy.verifyBoard([
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
            [undefined, 2, 4, undefined],
        ]);
    });

    // TODO: In theory, this should work. But it doesn't for some reason.
    it.skip("should allow player to swipe up to move the blocks", () => {
        cy.viewport("iphone-xr");

        cy.verifyBoard([
            [0, 0, 0, 0],
            [0, 2, 0, 0],
            [0, 0, 4, 0],
            [0, 0, 0, 0],
        ]);

        cy.get("#swipeArea").realSwipe("toTop");

        cy.verifyBoard([
            [undefined, 2, 4, undefined],
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
        ]);
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
