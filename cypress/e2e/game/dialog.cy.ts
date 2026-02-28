/// <reference types="cypress" />

import { GamePersistentState, GameState } from "../../../src/game";

describe("dialogs", () => {
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
                window.localStorage.setItem("2048-game-state", JSON.stringify(gameState));
                window.localStorage.setItem(
                    "2048-persistent-state",
                    JSON.stringify(persistentState),
                );
            },
        });
    });

    describe("general dialog behaviour", () => {
        it("should be visible", () => {
            // The Debug dialog is an example of a closable dialog that can be triggered in normal usage (during debug mode)
            cy.get(".debug-link#debug").click();

            cy.get(".dialog").should("be.visible");
            cy.get(".overlay-back").should("be.visible");
        });

        it("prevents player from making any more inputs with physical keyboard", () => {
            // Verify starting game board at this point
            cy.verifyBoardMatches([
                [0, 0, 0, 0],
                [0, 2, 0, 0],
                [0, 0, 4, 0],
                [0, 0, 0, 0],
            ]);

            // The Debug dialog is an example of a closable dialog that can be triggered in normal usage (during debug mode)
            cy.get(".debug-link#debug").click();

            cy.get("body").type("{leftArrow}");

            // Verify the game board did not change
            cy.verifyBoardMatches([
                [0, 0, 0, 0],
                [0, 2, 0, 0],
                [0, 0, 4, 0],
                [0, 0, 0, 0],
            ]);

            cy.get(".overlay-back").click("topLeft");

            cy.get("body").type("{leftArrow}");

            // Verify the game board did change
            cy.verifyBoardMatches([
                [undefined, undefined, undefined, undefined],
                [2, undefined, undefined, undefined],
                [4, undefined, undefined, undefined],
                [undefined, undefined, undefined, undefined],
            ]);
        });
    });

    describe("closable dialogs", () => {
        beforeEach(() => {
            // The Debug dialog is an example of a closable dialog that can be triggered in normal usage (during debug mode)
            cy.get(".debug-link#debug").click();
        });

        it("can be closed by clicking on the X button", () => {
            cy.get(".dialog").should("be.visible");
            cy.get(".overlay-back").should("be.visible");

            cy.get(".dialog > .close").click();

            cy.get(".dialog").should("not.exist");
            cy.get(".overlay-back").should("not.be.visible");
        });

        it("can be closed by clicking elsewhere besides the dialog", () => {
            cy.get(".dialog").should("be.visible");
            cy.get(".overlay-back").should("be.visible");

            cy.get("body").click("left");

            cy.get(".dialog").should("not.exist");
            cy.get(".overlay-back").should("not.be.visible");
        });

        it("can not be closed by pressing enter key", () => {
            cy.get(".dialog").should("be.visible");
            cy.get(".overlay-back").should("be.visible");

            // Remove focus from the close button first, as pressing enter while it's focused will trigger the close button
            cy.get(".dialog > button.close").blur();
            cy.get("body").type("{enter}");

            cy.get(".dialog").should("be.visible");
            cy.get(".overlay-back").should("be.visible");
        });

        it("can be closed by pressing escape key", () => {
            cy.get(".dialog").should("be.visible");
            cy.get(".overlay-back").should("be.visible");

            cy.get("body").type("{esc}");

            cy.get(".dialog").should("not.exist");
            cy.get(".overlay-back").should("not.be.visible");
        });

        it("functions without an OK button", () => {
            // The Debug dialog does not have an OK button
            cy.get(".dialog").should("be.visible");
            cy.get(".dialog .ok").should("not.exist");

            // Dialog can still be closed via X button
            cy.get(".dialog > .close").click();

            cy.get(".dialog").should("not.exist");
            cy.get(".overlay-back").should("not.be.visible");
        });
    });

    describe("closable dialogs with OK button", () => {
        beforeEach(() => {
            cy.get(".debug-link#debug").click();
            cy.contains("OK Dialog").click();
            cy.waitUntilDialogAppears();
        });

        it("can be closed by clicking the OK button", () => {
            cy.get(".dialog").should("be.visible");
            cy.get(".overlay-back").should("be.visible");

            cy.get(".dialog .ok").should("be.visible").click();

            cy.get(".dialog").should("not.exist");
            cy.get(".overlay-back").should("not.be.visible");
        });

        it("can still be closed by clicking the X button", () => {
            cy.get(".dialog").should("be.visible");
            cy.get(".overlay-back").should("be.visible");

            cy.get(".dialog > .close").click();

            cy.get(".dialog").should("not.exist");
            cy.get(".overlay-back").should("not.be.visible");
        });

        it("can still be closed by clicking outside the dialog", () => {
            cy.get(".dialog").should("be.visible");
            cy.get(".overlay-back").should("be.visible");

            cy.get("body").click("left");

            cy.get(".dialog").should("not.exist");
            cy.get(".overlay-back").should("not.be.visible");
        });

        it("can still be closed by pressing escape key", () => {
            cy.get(".dialog").should("be.visible");
            cy.get(".overlay-back").should("be.visible");

            cy.get("body").type("{esc}");

            cy.get(".dialog").should("not.exist");
            cy.get(".overlay-back").should("not.be.visible");
        });
    });

    describe("prompt dialogs", () => {
        beforeEach(() => {
            cy.clearBrowserCache();
            cy.reload();
            cy.get(".debug-link#debug").click();
            cy.contains("Prompt Dialog").click();
        });

        it("allows user to either confirm or cancel, blocking game input until choice is made", () => {
            cy.get(".dialog").should("be.visible");
            cy.get(".overlay-back").should("be.visible");

            cy.get(".dialog > .close").should("not.be.visible").click({
                force: true,
            });
            cy.get("body").click("left");
            cy.get("body").type("{enter}");
            cy.get("body").type("{esc}");

            cy.get(".dialog").should("be.visible");

            cy.contains("Cancel").click();

            cy.get(".dialog").should("not.exist");
            cy.get(".overlay-back").should("not.be.visible");

            cy.get(".debug-link#debug").click();
            cy.contains("Prompt Dialog").click();

            cy.contains("Yes").click();

            cy.get(".dialog").should("be.visible");
            cy.get(".overlay-back").should("be.visible");

            cy.contains("Confirmed").should("be.visible");

            cy.get(".dialog > .close").should("be.visible").click();

            cy.get(".dialog").should("not.exist");
            cy.get(".overlay-back").should("not.be.visible");
        });
    });

    describe("non-closable dialogs", () => {
        beforeEach(() => {
            cy.clearBrowserCache();
            cy.reload();
            cy.get(".debug-link#debug").click();
            cy.contains("Non-Closable Dialog").click();
        });

        it("hides X button and cannot be clicked", () => {
            cy.get(".dialog").should("be.visible");

            cy.get(".dialog > .close").should("not.be.visible").click({
                force: true,
            });

            cy.get(".dialog").should("be.visible");
        });

        it("can not be closed by clicking elsewhere besides the dialog", () => {
            cy.get(".dialog").should("be.visible");

            cy.get("body").click("left");

            cy.get(".dialog").should("be.visible");
        });

        it("can not be closed using escape key or enter key", () => {
            cy.get(".dialog").should("be.visible");

            // Need realType rather than type because Cypress does not consider dialog element a typeable element
            cy.get("body").realType("{enter}");
            cy.get("body").realType("{esc}");

            cy.get(".dialog").should("be.visible");
        });
    });
});
