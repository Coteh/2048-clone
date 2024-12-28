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
                        [0, 0, 2, 4],
                        [0, 2, 8, 16],
                        [0, 8, 16, 32],
                        [8, 16, 32, 128],
                    ],
                    ended: false,
                    won: false,
                    score: 1072,
                    didUndo: false,
                    achievedHighscore: false,
                    moveCount: 0,
                };
                const persistentState: GamePersistentState = {
                    highscore: 8300,
                    unlockables: {},
                    hasPlayedBefore: true,
                };
                window.localStorage.setItem("game-state", JSON.stringify(gameState));
                window.localStorage.setItem("persistent-state", JSON.stringify(persistentState));
            },
        });
    });

    ["standard", "classic"].forEach((theme) => {
        ["standard", "compact"].forEach((blockStyle) => {
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
                it(`${theme} theme with ${blockStyle} block style should be playable on a ${def.name}`, () => {
                    cy.viewport(def.width, def.height);

                    const preferences: Preferences = {
                        theme: theme,
                        block: blockStyle,
                    };
                    window.localStorage.setItem("preferences", JSON.stringify(preferences));

                    cy.reload();

                    // Set version number and commit hash to placeholders so that screenshots are consistent
                    cy.document().then((doc) => {
                        const versionNumber = doc.querySelector(".version-number") as HTMLElement;
                        versionNumber.innerText = "vX.X.X";
                        const commitHash = doc.querySelector(".commit-hash") as HTMLElement;
                        commitHash.innerText = "aaaaaaa";
                    });

                    cy.get(".game").should("be.visible").shouldBeInViewport();
                    if (theme === "standard") {
                        cy.contains("2048 Clone").should("be.visible").shouldBeInViewport();
                    } else {
                        cy.get(".classic-logo").should("be.visible").shouldBeInViewport();
                    }
                    cy.get(".help-link").should("be.visible").shouldBeInViewport();

                    cy.screenshot(
                        `viewport/theme/${theme}/block-style/${blockStyle}/${def.name} - Gameplay`,
                        {
                            capture: "viewport",
                            overwrite: true,
                        }
                    );

                    cy.get(".settings-link").click();

                    cy.contains("Settings").should("be.visible").shouldBeInViewport();

                    cy.get(".settings-item.animations").click();

                    // NTS: Screen is offset slightly vertically when in settings screen on small dimensions. This does not happen when running it outside of Cypress. Put this in for now to recenter it, but perhaps this can be looked at later.
                    cy.window().then((win) => win.scrollTo(0, 0));

                    cy.screenshot(
                        `viewport/theme/${theme}/block-style/${blockStyle}/${def.name} - Settings`,
                        {
                            capture: "viewport",
                            overwrite: true,
                        }
                    );
                });
            });
        });
    });
});
