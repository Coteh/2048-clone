/// <reference types="cypress" />

// TODO: Implement these tests
describe.skip("how to play", () => {
    beforeEach(() => {
        cy.clearBrowserCache();
        cy.visit("/", {
            onBeforeLoad: () => {
                window.localStorage.clear();
            },
        });
    });

    it("should appear when player first starts the game", () => {
        // cy.contains("How to play").should("be.visible");

        throw new Error(
            "TODO: Check for how to play graphic appearing on the screen at startup, and should disappear after a few seconds"
        );
    });

    it("should not appear again after the first time game is loaded", () => {
        // cy.reload();
        // cy.waitForGameReady();
        // cy.contains("How to play").should("not.exist");

        throw new Error("TODO: Check to see if how to play graphic is removed after page refresh");
    });

    it("can be brought up at any time by clicking on the help icon", () => {
        // cy.reload();
        // cy.waitForGameReady();
        // cy.contains("How to play").should("not.exist");
        // cy.get(".help-link").click();
        // cy.contains("How to play").should("be.visible");

        throw new Error(
            "TODO: Check to see if how to play graphic reappears upon clicking the help icon, and should disappear after a few seconds"
        );
    });
});
