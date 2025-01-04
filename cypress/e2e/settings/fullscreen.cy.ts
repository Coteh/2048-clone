/// <reference types="cypress" />

import { GameState, GamePersistentState } from "../../../src/game";
import { Preferences } from "../../../src/preferences";

describe("fullscreen", () => {
    before(() => {
        cy.log(`
            NOTE: Fullscreen testing in Cypress is unreliable at the moment. 
            These tests verify that the function calls are made. 
            Verify the actual fullscreen functionality manually for now.
        `);
    });

    beforeEach(() => {
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
        cy.document().then((doc) => {
            cy.stub(doc.documentElement, "requestFullscreen").as("requestFullscreen");
            cy.stub(doc, "exitFullscreen").as("exitFullscreen");
        });
    });

    // TODO: Fix issue where using 'f' key toggles Cypress sidebar instead of toggling fullscreen mode
    it.skip("should toggle fullscreen mode on and off using 'f' key", () => {
        // NOTE: Triggering the keydown event programmatically will not satisfy user-initiated request for fullscreen
        // cy.get("body").trigger("keydown", {
        //     eventConstructor: "KeyboardEvent",
        //     key: "f",
        // });
        cy.get("@requestFullscreen").should("not.have.been.called");
        cy.get("body").focus().realType("f");
        cy.get("@requestFullscreen").should("have.been.called");
        cy.window().then((win) => {
            cy.stub(win.document, "fullscreenElement").value(win.document.documentElement);
        });
        cy.get("@exitFullscreen").should("not.have.been.called");
        cy.get("body").focus().realType("f");
        cy.get("@exitFullscreen").should("have.been.called");
    });

    it("should toggle fullscreen mode on and off using settings option", () => {
        cy.get(".settings-link").click();
        cy.get("@requestFullscreen").should("not.have.been.called");
        cy.contains("Fullscreen").realClick();
        cy.get("@requestFullscreen").should("have.been.called");
        cy.window().then((win) => {
            cy.stub(win.document, "fullscreenElement").value(win.document.documentElement);
        });
        cy.get("@exitFullscreen").should("not.have.been.called");
        cy.contains("Fullscreen").realClick();
        cy.get("@exitFullscreen").should("have.been.called");
    });

    it("should not show fullscreen prompt if fullscreen preference is disabled", () => {
        cy.contains("Fullscreen mode is enabled. Do you want to turn it on?").should("not.exist");
    });

    describe("fullscreen prompt if fullscreen preference is enabled", () => {
        beforeEach(() => {
            cy.visit("/", {
                onBeforeLoad: (win) => {
                    const preferences: Preferences = {
                        theme: "dark",
                        fullscreen: "enabled",
                    };
                    win.localStorage.setItem("preferences", JSON.stringify(preferences));
                },
            });

            cy.document().then((doc) => {
                cy.stub(doc.documentElement, "requestFullscreen").as("requestFullscreen");
                cy.stub(doc, "exitFullscreen").as("exitFullscreen");
            });

            cy.contains("Fullscreen mode is enabled. Do you want to turn it on?").should(
                "be.visible"
            );
        });

        it("should enable fullscreen if user confirms the prompt", () => {
            cy.get("@exitFullscreen").should("not.have.been.called");
            cy.get("@requestFullscreen").should("not.have.been.called");
            cy.contains("Yes").realClick();
            cy.get("@exitFullscreen").should("not.have.been.called");
            cy.get("@requestFullscreen").should("have.been.called");
        });

        it("should not enable fullscreen if user cancels the prompt", () => {
            cy.window().then((win) => {
                cy.stub(win.document, "fullscreenElement").value(win.document.documentElement);
            });
            cy.get("@requestFullscreen").should("not.have.been.called");
            cy.get("@exitFullscreen").should("not.have.been.called");
            cy.contains("Cancel").click();
            cy.get("@requestFullscreen").should("not.have.been.called");
            cy.get("@exitFullscreen").should("have.been.called");
        });
    });

    it("should show fullscreen option on desktop", () => {
        cy.viewport(1024, 768);
        cy.get(".settings-link").click();
        cy.get(".setting.fullscreen").should("be.visible");
    });

    it("should hide fullscreen option on phones", () => {
        cy.visit("/", {
            onBeforeLoad: (win) => {
                Object.defineProperty(win.navigator, "userAgent", {
                    value: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
                });
            },
        });
        cy.viewport("iphone-6");
        cy.get(".settings-link").click();
        cy.get(".setting.fullscreen").should("not.be.visible");
    });
});
