/// <reference types="cypress" />

import { GamePersistentState, GameState } from "../../../src/game";
import { Preferences } from "../../../src/preferences";

const legacyGameState: GameState = {
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
    moveCount: 0,
};

const legacyPersistentState: GamePersistentState = {
    highscore: 1234,
    unlockables: {},
    hasPlayedBefore: true,
};

const legacyPreferences: Preferences = {
    theme: "dark",
};

describe("v1.3.1 localStorage migration", () => {
    describe("successful migration", () => {
        beforeEach(() => {
            cy.clearBrowserCache();
            cy.visit("/", {
                onBeforeLoad: () => {
                    // Set legacy (unprefixed) keys only
                    window.localStorage.setItem("game-state", JSON.stringify(legacyGameState));
                    window.localStorage.setItem(
                        "persistent-state",
                        JSON.stringify(legacyPersistentState),
                    );
                    window.localStorage.setItem("preferences", JSON.stringify(legacyPreferences));
                },
            });
        });

        it("should migrate legacy keys to new prefixed keys", () => {
            cy.waitUntilDialogAppears();

            // Verify the migrated data is used by the game
            cy.verifyBoardMatches([
                [2, 0, 0, 0],
                [4, 0, 0, 0],
                [8, 0, 0, 0],
                [16, 0, 0, 0],
            ]);

            cy.contains("Best 1234").should("be.visible");

            cy.get("body").should("have.class", "dark");
            cy.get("body").should("have.class", "tileset-dark");
        });

        it("should show migration notification dialog", () => {
            cy.waitUntilDialogAppears();

            cy.get(".dialog").should("be.visible");
            cy.contains("Your save data has been migrated").should("be.visible");
        });

        it("should store migrated values under new prefixed keys in localStorage", () => {
            cy.waitUntilDialogAppears();

            cy.window().then((win) => {
                expect(win.localStorage.getItem("2048-game-state")).to.equal(
                    JSON.stringify(legacyGameState),
                );
                expect(win.localStorage.getItem("2048-persistent-state")).to.equal(
                    JSON.stringify(legacyPersistentState),
                );
                expect(win.localStorage.getItem("2048-preferences")).to.equal(
                    JSON.stringify({
                        ...legacyPreferences,
                        debugHudEnabled: "enabled",
                        debugHudVisible: "enabled",
                    }),
                );
            });
        });
    });

    describe("migration does not run again once completed", () => {
        it("should not show migration dialog on subsequent visits", () => {
            cy.clearBrowserCache();

            // First visit with legacy keys - triggers migration
            cy.visit("/", {
                onBeforeLoad: () => {
                    window.localStorage.setItem("game-state", JSON.stringify(legacyGameState));
                    window.localStorage.setItem(
                        "persistent-state",
                        JSON.stringify(legacyPersistentState),
                    );
                    window.localStorage.setItem("preferences", JSON.stringify(legacyPreferences));
                },
            });

            cy.waitUntilDialogAppears();
            cy.get(".dialog").should("be.visible");
            cy.contains("Your save data has been migrated").should("be.visible");

            // Close the migration dialog
            cy.get(".dialog .ok").click();
            cy.get(".dialog").should("not.exist");

            // Reload - new prefixed keys now exist, so migration should not run again
            cy.reload();

            // Verify no migration dialog appears
            cy.get(".dialog").should("not.exist");

            // Verify the game still loads correctly from the migrated data
            cy.verifyBoardMatches([
                [2, 0, 0, 0],
                [4, 0, 0, 0],
                [8, 0, 0, 0],
                [16, 0, 0, 0],
            ]);

            cy.contains("Best 1234").should("be.visible");
        });

        it("should not migrate if new prefixed keys already exist", () => {
            cy.clearBrowserCache();

            cy.visit("/", {
                onBeforeLoad: () => {
                    // Set both legacy and new keys - new keys should take precedence
                    const differentGameState: GameState = {
                        board: [
                            [0, 0, 0, 0],
                            [0, 2, 0, 0],
                            [0, 0, 4, 0],
                            [0, 0, 0, 0],
                        ],
                        ended: false,
                        won: false,
                        score: 4,
                        didUndo: false,
                        achievedHighscore: false,
                        moveCount: 0,
                    };
                    const differentPersistentState: GamePersistentState = {
                        highscore: 5678,
                        unlockables: {},
                        hasPlayedBefore: true,
                    };

                    // Legacy keys
                    window.localStorage.setItem("game-state", JSON.stringify(legacyGameState));
                    window.localStorage.setItem(
                        "persistent-state",
                        JSON.stringify(legacyPersistentState),
                    );

                    // New prefixed keys already populated with different data
                    window.localStorage.setItem(
                        "2048-game-state",
                        JSON.stringify(differentGameState),
                    );
                    window.localStorage.setItem(
                        "2048-persistent-state",
                        JSON.stringify(differentPersistentState),
                    );
                },
            });

            // No migration dialog should appear
            cy.get(".dialog").should("not.exist");

            // Verify the game uses the new prefixed keys (not legacy)
            cy.verifyBoardMatches([
                [0, 0, 0, 0],
                [0, 2, 0, 0],
                [0, 0, 4, 0],
                [0, 0, 0, 0],
            ]);

            cy.contains("Best 5678").should("be.visible");
        });
    });

    describe("migration dialog interactions", () => {
        beforeEach(() => {
            cy.clearBrowserCache();
            cy.visit("/", {
                onBeforeLoad: () => {
                    window.localStorage.setItem("game-state", JSON.stringify(legacyGameState));
                    window.localStorage.setItem(
                        "persistent-state",
                        JSON.stringify(legacyPersistentState),
                    );
                    window.localStorage.setItem("preferences", JSON.stringify(legacyPreferences));
                },
            });
            cy.waitUntilDialogAppears();
        });

        it("can be closed using the OK button", () => {
            cy.get(".dialog").should("be.visible");
            cy.get(".overlay-back").should("be.visible");

            cy.get(".dialog .ok").click();

            cy.get(".dialog").should("not.exist");
            cy.get(".overlay-back").should("not.be.visible");
        });

        it("can be closed by clicking the X button", () => {
            cy.get(".dialog").should("be.visible");
            cy.get(".overlay-back").should("be.visible");

            cy.get(".dialog > .close").click();

            cy.get(".dialog").should("not.exist");
            cy.get(".overlay-back").should("not.be.visible");
        });

        it("can be closed by clicking outside the dialog", () => {
            cy.get(".dialog").should("be.visible");
            cy.get(".overlay-back").should("be.visible");

            cy.get("body").click("left");

            cy.get(".dialog").should("not.exist");
            cy.get(".overlay-back").should("not.be.visible");
        });

        it("can be closed by pressing escape key", () => {
            cy.get(".dialog").should("be.visible");
            cy.get(".overlay-back").should("be.visible");

            cy.get("body").type("{esc}");

            cy.get(".dialog").should("not.exist");
            cy.get(".overlay-back").should("not.be.visible");
        });
    });
});
