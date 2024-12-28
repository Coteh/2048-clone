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
                    moveCount: 0,
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

        cy.verifyBoardMatches([
            [0, 0, 0, 0],
            [0, 2, 0, 0],
            [0, 0, 4, 0],
            [0, 0, 0, 0],
        ]);

        cy.get("#swipeArea").realSwipe("toRight");

        cy.verifyBoardMatches([
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, 2],
            [undefined, undefined, undefined, 4],
            [undefined, undefined, undefined, undefined],
        ]);
    });

    // TODO: In theory, this should work. But it doesn't for some reason.
    it.skip("should allow player to swipe left to move the blocks", () => {
        cy.viewport("iphone-xr");

        cy.verifyBoardMatches([
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

        cy.verifyBoardMatches([
            [undefined, undefined, undefined, undefined],
            [2, undefined, undefined, undefined],
            [4, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
        ]);
    });

    // TODO: In theory, this should work. But it doesn't for some reason.
    it.skip("should allow player to swipe down to move the blocks", () => {
        cy.viewport("iphone-xr");

        cy.verifyBoardMatches([
            [0, 0, 0, 0],
            [0, 2, 0, 0],
            [0, 0, 4, 0],
            [0, 0, 0, 0],
        ]);

        cy.get("#swipeArea").realSwipe("toBottom");

        cy.verifyBoardMatches([
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
            [undefined, 2, 4, undefined],
        ]);
    });

    // TODO: In theory, this should work. But it doesn't for some reason.
    it.skip("should allow player to swipe up to move the blocks", () => {
        cy.viewport("iphone-xr");

        cy.verifyBoardMatches([
            [0, 0, 0, 0],
            [0, 2, 0, 0],
            [0, 0, 4, 0],
            [0, 0, 0, 0],
        ]);

        cy.get("#swipeArea").realSwipe("toTop");

        cy.verifyBoardMatches([
            [undefined, 2, 4, undefined],
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
        ]);
    });

    it("should allow player to move blocks using right arrow key", () => {
        cy.verifyBoardMatches([
            [0, 0, 0, 0],
            [0, 2, 0, 0],
            [0, 0, 4, 0],
            [0, 0, 0, 0],
        ]);

        cy.get("body").type("{rightArrow}");

        cy.verifyBoardMatches([
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, 2],
            [undefined, undefined, undefined, 4],
            [undefined, undefined, undefined, undefined],
        ]);
    });

    it("should allow player to move blocks using left arrow key", () => {
        cy.verifyBoardMatches([
            [0, 0, 0, 0],
            [0, 2, 0, 0],
            [0, 0, 4, 0],
            [0, 0, 0, 0],
        ]);

        cy.get("body").type("{leftArrow}");

        cy.verifyBoardMatches([
            [undefined, undefined, undefined, undefined],
            [2, undefined, undefined, undefined],
            [4, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
        ]);
    });

    it("should allow player to move blocks using down arrow key", () => {
        cy.verifyBoardMatches([
            [0, 0, 0, 0],
            [0, 2, 0, 0],
            [0, 0, 4, 0],
            [0, 0, 0, 0],
        ]);

        cy.get("body").type("{downArrow}");

        cy.verifyBoardMatches([
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
            [undefined, 2, 4, undefined],
        ]);
    });

    it("should allow player to move blocks using up arrow key", () => {
        cy.verifyBoardMatches([
            [0, 0, 0, 0],
            [0, 2, 0, 0],
            [0, 0, 4, 0],
            [0, 0, 0, 0],
        ]);

        cy.get("body").type("{upArrow}");

        cy.verifyBoardMatches([
            [undefined, 2, 4, undefined],
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
        ]);
    });

    it("should allow player to click new game to restart the game", () => {
        cy.visit("/", {
            onBeforeLoad: () => {
                const gameState: GameState = {
                    board: [
                        [2, 4, 8, 16],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0],
                    ],
                    ended: false,
                    won: false,
                    score: 100,
                    didUndo: false,
                    achievedHighscore: true,
                    moveCount: 0,
                };
                const persistentState: GamePersistentState = {
                    highscore: 100,
                    unlockables: {},
                    hasPlayedBefore: true,
                };
                window.localStorage.setItem("game-state", JSON.stringify(gameState));
                window.localStorage.setItem("persistent-state", JSON.stringify(persistentState));
            },
        });

        cy.verifyBoardMatches([
            [2, 4, 8, 16],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ]);

        cy.contains("Score 100").should("be.visible");
        cy.contains("Best 100").should("be.visible");

        cy.contains("New Game").click();

        cy.contains("Yes").click();

        cy.verifyBoardDoesNotMatch([
            [2, 4, 8, 16],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ]);

        cy.contains("Score 0").should("be.visible");
        cy.contains("Best 100").should("be.visible");
    });

    it("should update move count after a normal move", () => {
        cy.verifyBoardMatches([
            [0, 0, 0, 0],
            [0, 2, 0, 0],
            [0, 0, 4, 0],
            [0, 0, 0, 0],
        ]);

        cy.get("body").type("{rightArrow}");

        cy.verifyBoardMatches([
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, 2],
            [undefined, undefined, undefined, 4],
            [undefined, undefined, undefined, undefined],
        ]);

        cy.get("#moveCount").should("have.text", "1");
    });

    it("should update move count after multiple moves", () => {
        cy.verifyBoardMatches([
            [0, 0, 0, 0],
            [0, 2, 0, 0],
            [0, 0, 4, 0],
            [0, 0, 0, 0],
        ]);

        cy.get("body").type("{rightArrow}");
        cy.get("body").type("{downArrow}");

        cy.get("#moveCount").should("have.text", "2");
    });

    it("should update move count after an undo", () => {
        cy.visit("/", {
            onBeforeLoad: () => {
                const gameState: GameState = {
                    board: [
                        [0, 0, 0, 0],
                        [0, 2, 2, 0],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0],
                    ],
                    ended: false,
                    won: false,
                    score: 0,
                    didUndo: false,
                    achievedHighscore: true,
                    moveCount: 0,
                };
                const persistentState: GamePersistentState = {
                    highscore: 0,
                    unlockables: {},
                    hasPlayedBefore: true,
                };
                window.localStorage.setItem("game-state", JSON.stringify(gameState));
                window.localStorage.setItem("persistent-state", JSON.stringify(persistentState));
            },
        });

        cy.verifyBoardMatches([
            [0, 0, 0, 0],
            [0, 2, 2, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ]);

        cy.get("body").type("{rightArrow}");
        cy.get("body").type("{downArrow}");

        cy.get("#moveCount").should("have.text", "2");

        cy.get("#undo").click({
            force: true,
        });

        cy.verifyBoardMatches([
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, 4],
            [undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined],
        ]);

        cy.get("#moveCount").should("have.text", "1");
    });

    it("should reset move count after starting a new game", () => {
        cy.verifyBoardMatches([
            [0, 0, 0, 0],
            [0, 2, 0, 0],
            [0, 0, 4, 0],
            [0, 0, 0, 0],
        ]);

        cy.get("body").type("{rightArrow}");
        cy.get("body").type("{downArrow}");

        cy.get("#moveCount").should("have.text", "2");

        cy.contains("New Game").click();
        cy.contains("Yes").click();

        cy.get("#moveCount").should("have.text", "0");
    });
});
