/// <reference types="cypress" />

describe("gameplay", () => {
    beforeEach(() => {
        cy.clearBrowserCache();
        cy.visit("/", {
            onBeforeLoad: () => {
                window.localStorage.setItem("played_before", true);
            },
        });
        cy.waitForGameReady();
    });

    test("player can swipe to move the blocks", () => {
        throw new Error("Test not implemented");
    });

    test("player can click new game to restart the game", () => {
        throw new Error("Test not implemented");
    });
});
