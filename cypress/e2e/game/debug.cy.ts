/// <reference types="cypress" />

import { GamePersistentState } from "../../../src/game";
import { Preferences } from "../../../src/preferences";

describe("debug HUD", () => {
    beforeEach(() => {
        cy.visit("/", {
            onBeforeLoad: () => {
                const persistentState: GamePersistentState = {
                    highscore: 0,
                    unlockables: {},
                    hasPlayedBefore: true,
                };
                window.localStorage.setItem("persistent-state", JSON.stringify(persistentState));
                const preferences: Preferences = {
                    debugHudEnabled: "disabled",
                    debugHudVisible: "disabled",
                };
                window.localStorage.setItem("preferences", JSON.stringify(preferences));
            },
        });
    });

    it("should toggle the debug HUD by clicking the changelog heading repeatedly", () => {
        // Check that the debug HUD is not enabled
        cy.get("#debug-overlay").should("not.be.visible");
        cy.get(".link-icon#debug-hud").should("not.be.visible");

        // Open the settings pane
        cy.get(".settings-link").click();

        // NOTE: Test sometimes flakes out if changelog is not loaded before clicking the version number
        // TODO: Ensure the changelog is loaded before clicking the version number, both in the app itself and in this test case
        cy.wait(500);

        // Open changlog
        cy.get("#changelog-link").click({ force: true });

        // Tap the changelog heading 5 times quickly with a small delay between each click
        cy.get("#changelog-text h1").click().click().click().click().click();

        // Check that the notification is displayed with the expected text
        cy.get(".notification-message").should("contain.text", "Debug HUD enabled");

        // Close the changelog dialog
        cy.get(".dialog .close").click();

        // Close the settings pane
        cy.get(".settings-link").click();

        // Check that the debug HUD is enabled
        cy.get("#debug-overlay").should("be.visible");
        cy.get(".link-icon#debug-hud").should("be.visible");

        // Click the toggle button to disable the debug HUD
        cy.get(".link-icon#debug-hud").click({
            force: true,
        });

        // Verify that the debug HUD is not visible
        cy.get("#debug-overlay").should("not.be.visible");

        // Verify that the debug HUD button has changed
        cy.get(".link-icon#debug-hud svg").should("have.class", "feather-eye");

        // Click the toggle button to enable the debug HUD
        cy.get(".link-icon#debug-hud").click({
            force: true,
        });

        // Verify that the debug HUD is visible
        cy.get("#debug-overlay").should("be.visible");

        // Verify that the debug HUD button has changed
        cy.get(".link-icon#debug-hud svg").should("have.class", "feather-eye-off");

        // Open the settings pane again
        cy.get(".settings-link").click();

        // Open changlog again
        cy.get("#changelog-link").click({ force: true });

        // Tap the changelog heading 5 times quickly with a small delay between each click
        cy.get("#changelog-text h1").click().click().click().click().click();

        // Check that the notification is displayed with the expected text
        cy.get(".notification-message").should("contain.text", "Debug HUD disabled");

        // Close the changelog dialog
        cy.get(".dialog .close").click();

        // Close the settings pane
        cy.get(".settings-link").click();

        // Check that the debug HUD is not enabled
        cy.get("#debug-overlay").should("not.be.visible");
        cy.get(".link-icon#debug-hud").should("not.be.visible");
    });

    it("should enable the debug HUD on load if the preference is set", () => {
        cy.visit("/", {
            onBeforeLoad: () => {
                window.localStorage.setItem(
                    "preferences",
                    JSON.stringify({
                        debugHudEnabled: "enabled",
                    }),
                );
            },
        });

        // Check that the debug HUD is enabled
        cy.get("#debug-overlay").should("not.be.visible");
        cy.get(".link-icon#debug-hud").should("be.visible");
    });

    it("should enable and make the debug HUD visible on load if the preferences are set", () => {
        cy.visit("/", {
            onBeforeLoad: () => {
                window.localStorage.setItem(
                    "preferences",
                    JSON.stringify({
                        debugHudEnabled: "enabled",
                        debugHudVisible: "enabled",
                    }),
                );
            },
        });

        // Check that the debug HUD is visible
        cy.get("#debug-overlay").should("be.visible");
        cy.get(".link-icon#debug-hud").should("be.visible");
    });

    it("should toggle the visibility of the debug HUD via the debug HUD button", () => {
        cy.visit("/", {
            onBeforeLoad: () => {
                window.localStorage.setItem(
                    "preferences",
                    JSON.stringify({
                        debugHudEnabled: "enabled",
                    }),
                );
            },
        });

        // Check that the debug HUD is not visible initially
        cy.get("#debug-overlay").should("not.be.visible");

        // Check that the debug HUD button shows the eye icon initially
        cy.get(".link-icon#debug-hud svg").should("have.class", "feather-eye");

        // Click the debug HUD button to make the debug HUD visible
        cy.get(".link-icon#debug-hud").click({
            force: true,
        });
        cy.get("#debug-overlay").should("be.visible");

        // Check that the debug HUD button shows the eye-off icon
        cy.get(".link-icon#debug-hud svg").should("have.class", "feather-eye-off");

        // Click the debug HUD button again to hide the debug HUD
        cy.get(".link-icon#debug-hud").click({
            force: true,
        });
        cy.get("#debug-overlay").should("not.be.visible");

        // Check that the debug HUD button shows the eye icon again
        cy.get(".link-icon#debug-hud svg").should("have.class", "feather-eye");
    });

    it("should toggle the debug HUD using the keyboard shortcut", () => {
        cy.visit("/", {
            onBeforeLoad: () => {
                window.localStorage.setItem(
                    "preferences",
                    JSON.stringify({
                        debugHudEnabled: "enabled",
                    }),
                );
            },
        });

        // Check that the debug HUD is not visible initially
        cy.get("#debug-overlay").should("not.be.visible");

        // Check that the debug HUD button shows the eye icon initially
        cy.get(".link-icon#debug-hud svg").should("have.class", "feather-eye");

        // Press the keyboard shortcut to make the debug HUD visible
        cy.get("body").type("d");
        cy.get("#debug-overlay").should("be.visible");

        // Check that the debug HUD button shows the eye-off icon
        cy.get(".link-icon#debug-hud svg").should("have.class", "feather-eye-off");

        // Press the keyboard shortcut again to hide the debug HUD
        cy.get("body").type("d");
        cy.get("#debug-overlay").should("not.be.visible");

        // Check that the debug HUD button shows the eye icon again
        cy.get(".link-icon#debug-hud svg").should("have.class", "feather-eye");
    });

    it("should not toggle the debug HUD using the keyboard shortcut if the debug HUD is disabled", () => {
        cy.visit("/", {
            onBeforeLoad: () => {
                window.localStorage.setItem(
                    "preferences",
                    JSON.stringify({
                        debugHudEnabled: "disabled",
                        debugHudVisible: "disabled",
                    }),
                );
            },
        });

        // Check that the debug HUD is not visible initially
        cy.get("#debug-overlay").should("not.be.visible");

        // Check that the debug HUD button is not visible
        cy.get(".link-icon#debug-hud").should("not.be.visible");

        // Press the keyboard shortcut to make the debug HUD visible
        cy.get("body").type("d");
        cy.get("#debug-overlay").should("not.be.visible");
    });
});
