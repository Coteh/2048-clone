/// <reference types="cypress" />

import { version } from "../../../package.json";

import { GamePersistentState, GameState } from "../../../src/game";
import { Preferences } from "../../../src/preferences";

// TODO: Implement these tests
describe.skip("settings", () => {
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

    it("should appear in place of the game pane when selected from top nav", () => {
        cy.get(".keyboard").should("be.visible");
        cy.contains("Settings").should("not.be.visible");

        cy.get(".settings-link").click();

        cy.get(".keyboard").should("not.be.visible");
        cy.contains("Settings").should("be.visible");
    });

    it("should disappear and show game pane again when settings button is clicked when in settings pane", () => {
        cy.get(".settings-link").click();

        cy.get(".keyboard").should("not.be.visible");
        cy.contains("Settings").should("be.visible");

        cy.get(".settings-link").click();

        cy.get(".keyboard").should("be.visible");
        cy.contains("Settings").should("not.be.visible");
    });

    it("should disappear and show game pane again when close button is clicked in settings pane", () => {
        cy.get(".settings-link").click();

        cy.get(".keyboard").should("not.be.visible");
        cy.contains("Settings").should("be.visible");

        cy.get(".close").click();

        cy.get(".keyboard").should("be.visible");
        cy.contains("Settings").should("not.be.visible");
    });

    it("should enable a setting when clicked", () => {
        cy.get(".settings-link").click();

        cy.contains("Settings").should("be.visible");

        cy.get(".settings-item.high-contrast").should("contain.text", "OFF");
        cy.window().then((win) => {
            expect(win.localStorage.getItem("preferences")).to.be.null;
        });

        cy.get(".settings-item.high-contrast").click();

        cy.get(".settings-item.high-contrast").should("contain.text", "ON");
        cy.window().then((win) => {
            expect(win.localStorage.getItem("preferences")).to.be.eql(
                JSON.stringify({
                    ["high-contrast"]: "enabled",
                })
            );
        });
    });

    it("should reenable a setting if it's set to enabled in local storage and page is reloaded", () => {
        window.localStorage.setItem(
            "preferences",
            JSON.stringify({
                ["high-contrast"]: "enabled",
            })
        );

        cy.reload();

        cy.get(".settings-link").click();

        cy.contains("Settings").should("be.visible");

        cy.get(".settings-item.high-contrast").should("contain.text", "ON");
    });

    it("should show version number at the bottom of the settings pane", () => {
        cy.get(".settings-link").click();

        cy.contains("Settings").should("be.visible");
        cy.contains(`v${version}`).should("be.visible");
    });

    it("should show copyright at the bottom of the settings pane", () => {
        cy.get(".settings-link").click();

        cy.contains("Settings").should("be.visible");
        cy.contains(/© .* James Cote/i).should("be.visible");
    });

    // it("should show credits for snow effect at the bottom of the settings pane if snow theme is enabled", () => {
    //     cy.get(".settings-link").click();

    //     cy.contains("Settings").should("be.visible");
    //     cy.contains("embed.im").should("not.be.visible");

    //     cy.get(".setting.theme-switch").click();
    //     cy.get(".setting.theme-switch").click();

    //     cy.get("body").should("have.class", "snow");
    //     cy.contains("embed.im").should("be.visible");

    //     cy.get(".setting.theme-switch").click();

    //     cy.get("body").should("not.have.class", "snow");
    //     cy.contains("embed.im").should("not.be.visible");
    // });

    it("should handle preferences value in local storage being in invalid state", () => {
        window.localStorage.setItem("preferences", "invalid");

        cy.reload();

        cy.window().then((win) => {
            expect(win.localStorage.getItem("preferences")).to.be.eql("{}");
        });
    });
});
