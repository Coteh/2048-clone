/// <reference types="cypress" />

import { GamePersistentState } from "../../../src/game";

// TODO: Implement these tests
describe.skip("dialogs", () => {
    beforeEach(() => {
        cy.clearBrowserCache();
        cy.visit("/", {
            onBeforeLoad: () => {
                const persistentState: GamePersistentState = {
                    highscore: 0,
                    unlockables: {},
                    hasPlayedBefore: true,
                };
                window.localStorage.setItem("persistent-state", JSON.stringify(persistentState));
            },
        });

        // The Debug dialog is an example of a closable dialog that can be triggered in normal usage (during debug mode)
        cy.get("button#debug").click();
    });

    describe("general dialog behaviour", () => {
        it("should be visible", () => {
            cy.get(".dialog").should("be.visible");
            cy.get(".overlay-back").should("be.visible");
        });

        it("prevents player from making any more inputs with physical keyboard", () => {
            // TODO: Verify the game board at this point

            cy.get("body").type("{rightArrow}");
            cy.get("body").type("{downArrow}");
            cy.get("body").type("{leftArrow}");
            cy.get("body").type("{upArrow}");

            // TODO: Verify the game board did not change

            throw new Error("TODO: Verify the game board did not change after doing some inputs");
        });

        // NTS: If dialog does not appear on the screen for some reason, which should never happen anyway under normal operation, then player can make physical key inputs.
        // At this time, I'm not going to handle this case since behaviour would already be undefined at that point; thus, handling this particular case may be a bit too much.
    });

    describe("closable dialogs", () => {
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

        it("allows inputs to be made again after closing", () => {
            // TODO: Verify the game board at this point

            cy.get("body").type("{rightArrow}");
            cy.get("body").type("{downArrow}");
            cy.get("body").type("{leftArrow}");
            cy.get("body").type("{upArrow}");

            // TODO: Verify the game board did not change

            cy.get(".dialog > .close").click();

            // TODO: Verify the game board at this point

            cy.get("body").type("{rightArrow}");
            cy.get("body").type("{downArrow}");
            cy.get("body").type("{leftArrow}");
            cy.get("body").type("{upArrow}");

            // TODO: Verify the game board did change

            throw new Error("TODO: Verify the game board did change after closing");
        });

        it("can be closed by pressing enter key", () => {
            cy.get(".dialog").should("be.visible");
            cy.get(".overlay-back").should("be.visible");

            cy.get("body").type("{enter}");

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

    describe("non-closable dialogs", () => {
        beforeEach(() => {
            // The error dialog is an example of a non-closable dialog that can be triggered in normal usage
            cy.intercept("GET", "/words.txt", {
                statusCode: 404,
                body: "Not found",
            });
            cy.clearBrowserCache();
            cy.reload();
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
    });
});
