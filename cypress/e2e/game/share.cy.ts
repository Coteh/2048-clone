/// <reference types="cypress" />

import { GamePersistentState, GameState } from "../../../src/game";
import { Preferences } from "../../../src/preferences";

// NOTE: If viewing this set of tests on Cypress UI, make sure the browser is active and you've allowed clipboard access when prompted
// TODO: Implement these tests
describe.skip("sharing results", () => {
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

    const performAction = (word) => {
        // TODO: Perform action for 2048-clone

        cy.get(".share-button").click();
    };

    it("should copy the results to clipboard when share button is pressed", () => {
        const PREV_COPIED_TEXT =
            "This text should not be in clipboard when the copy button is clicked";

        cy.window().then(async (win) => {
            win.focus();
            await win.navigator.clipboard.writeText(PREV_COPIED_TEXT);
            const copiedText = await win.navigator.clipboard.readText();
            expect(copiedText).to.eq(PREV_COPIED_TEXT);
        });

        performAction("leafy");

        cy.window().then(async (win) => {
            const copiedText = await win.navigator.clipboard.readText();
            expect(copiedText).to.eq(`Wordle Clone 1 2/6
⬛🟨⬛⬛🟨
🟩🟩🟩🟩🟩`);
        });
    });

    // NOTE: This test and the one after it have flaked before
    // https://github.com/Coteh/wordle-clone/actions/runs/3864885869/jobs/6588015395
    // TODO: If it happens again, or if it happens more often, look into a fix.
    it("should show a message when results have been copied", () => {
        performAction("leafy");

        cy.contains("Copied to clipboard").should("be.visible");
    });

    it("should handle copy failure", () => {
        const PREV_COPIED_TEXT = "This text should still be copied after failure to copy";

        cy.window().then(async (win) => {
            win.focus();
            await win.navigator.clipboard.writeText(PREV_COPIED_TEXT);
            const copiedText = await win.navigator.clipboard.readText();
            expect(copiedText).to.eq(PREV_COPIED_TEXT);
            win.navigator.clipboard.writeText = cy.stub().rejects(new Error("Error copying"));
        });

        performAction("leafy");

        cy.contains("Could not copy to clipboard due to error").should("be.visible");

        cy.window().then(async (win) => {
            const copiedText = await win.navigator.clipboard.readText();
            expect(copiedText).to.eq(PREV_COPIED_TEXT);
        });
    });
});
