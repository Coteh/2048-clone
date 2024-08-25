/// <reference types="cypress" />

import { GameState, GamePersistentState } from "../../../src/game";
import { Preferences } from "../../../src/preferences";

describe("viewport", () => {
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

    [
        {
            name: "small mobile device",
            width: 320,
            height: 480,
        },
        {
            name: "medium mobile device",
            width: 375,
            height: 667,
        },
        {
            name: "large mobile device",
            width: 375,
            height: 812,
        },
        {
            name: "huge mobile device",
            width: 428,
            height: 926,
        },
        {
            name: "tablet (portrait)",
            width: 768,
            height: 1024,
        },
        {
            name: "tablet (landscape)",
            width: 1024,
            height: 768,
        },
    ].forEach((def) => {
        it(`should be playable on a ${def.name}`, () => {
            cy.viewport(def.width, def.height);

            cy.reload();

            cy.get(".game").should("be.visible").shouldBeInViewport();
            cy.contains("2048 Clone").should("be.visible").shouldBeInViewport();
            cy.get(".help-link").should("be.visible").shouldBeInViewport();

            cy.get("body").type("{rightArrow}");
            cy.get("body").type("{leftArrow}");

            cy.screenshot(`viewport/${def.name}`, {
                capture: "viewport",
                overwrite: true,
            });
        });
    });
});
