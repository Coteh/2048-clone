/// <reference types="cypress" />

import { GamePersistentState, GameState } from "../../../src/game";

const MOBILE_DEVICE_USER_AGENT =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";
const DESKTOP_USER_AGENT =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:107.0) Gecko/20100101 Firefox/107.0";

describe("misc", () => {
    beforeEach(() => {
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
    });

    describe("landscape overlay", function () {
        it("should show the overlay when screen is rotated in landscape mode", function () {
            // Set the screen orientation to portrait
            cy.viewport("iphone-6", "portrait");

            // set the user agent for the current test
            cy.visit("/", {
                onBeforeLoad: (win) => {
                    Object.defineProperty(win.navigator, "userAgent", {
                        value: MOBILE_DEVICE_USER_AGENT,
                    });
                },
            });

            // Set the screen orientation to landscape
            cy.viewport("iphone-6", "landscape");

            // Check that the overlay is visible
            cy.get("#landscape-overlay").should("be.visible").and("have.css", "display", "block");

            // Set the screen orientation back to portrait
            cy.viewport("iphone-6", "portrait");

            // Check that the overlay is hidden
            cy.get("#landscape-overlay")
                .should("not.be.visible")
                .and("have.css", "display", "none");
        });

        it("displays the rotate device overlay when in landscape mode and loading the page", function () {
            cy.viewport(1024, 768); // set the viewport to 1024x768
            cy.visit("/", {
                onBeforeLoad: (win) => {
                    Object.defineProperty(win.navigator, "userAgent", {
                        value: MOBILE_DEVICE_USER_AGENT,
                    });
                },
            }); // visit the page
            cy.get("#landscape-overlay") // get the rotate device overlay element
                .should("be.visible"); // assert that the overlay is visible
            cy.viewport(768, 1024); // set the viewport to 768x1024
            cy.visit("/", {
                onBeforeLoad: (win) => {
                    Object.defineProperty(win.navigator, "userAgent", {
                        value: MOBILE_DEVICE_USER_AGENT,
                    });
                },
            }); // visit the page again
            cy.get("#landscape-overlay") // get the rotate device overlay element
                .should("not.be.visible"); // assert that the overlay is not visible
        });

        it("should not display the rotate device overlay when in desktop mode", function () {
            cy.viewport(768, 1024); // set the viewport to 768x1024

            // Check that the overlay is hidden
            cy.get("#landscape-overlay")
                .should("not.be.visible")
                .and("have.css", "display", "none");

            cy.viewport(1024, 768); // set the viewport to 1024x768

            // Check that the overlay is hidden
            cy.get("#landscape-overlay")
                .should("not.be.visible")
                .and("have.css", "display", "none");

            cy.viewport(768, 1024); // set the viewport to 768x1024

            // Check that the overlay is hidden
            cy.get("#landscape-overlay")
                .should("not.be.visible")
                .and("have.css", "display", "none");
        });

        it("should not show any game element", () => {
            cy.viewport(1024, 768); // set the viewport to 1024x768
            cy.visit("/", {
                onBeforeLoad: (win) => {
                    Object.defineProperty(win.navigator, "userAgent", {
                        value: MOBILE_DEVICE_USER_AGENT,
                    });
                    const gameState: GameState = {
                        board: [
                            [2, 16, 2, 32],
                            [4, 512, 8, 128],
                            [16, 4, 16, 32],
                            [4, 32, 1024, 2],
                        ],
                        ended: true,
                        won: false,
                        score: 10000,
                        didUndo: false,
                        achievedHighscore: true,
                    };
                    const persistentState: GamePersistentState = {
                        highscore: 9000,
                        unlockables: {},
                        hasPlayedBefore: true,
                    };
                    window.localStorage.setItem("game-state", JSON.stringify(gameState));
                    window.localStorage.setItem(
                        "persistent-state",
                        JSON.stringify(persistentState)
                    );
                },
            }); // visit the page
            cy.get("#landscape-overlay") // get the rotate device overlay element
                .should("be.visible"); // assert that the overlay is visible

            cy.waitUntilDialogAppears();

            cy.get(".dialog").should("not.be.visible");

            cy.contains("You lose!").should("not.be.visible");
        });

        // it("should show the snowflakes when activated while snow theme enabled", () => {
        //     // Set the screen orientation to landscape
        //     cy.viewport("iphone-6", "landscape");

        //     cy.visit("/", {
        //         onBeforeLoad: (win) => {
        //             Object.defineProperty(win.navigator, "userAgent", {
        //                 value: MOBILE_DEVICE_USER_AGENT,
        //             });
        //             window.localStorage.setItem(
        //                 "preferences",
        //                 JSON.stringify({
        //                     theme: "snow",
        //                 })
        //             );
        //         },
        //     });

        //     cy.get("#landscape-overlay") // get the rotate device overlay element
        //         .should("be.visible"); // assert that the overlay is visible

        //     // Cypress checks if element is interactive when doing visibility check
        //     // This is a workaround to have Cypress see that it's visible.
        //     cy.get("#embedim--snow").invoke("css", "pointer-events", "auto");
        //     cy.get("#embedim--snow").should("be.visible");

        //     // Set the screen orientation back to portrait
        //     cy.viewport("iphone-6", "portrait");

        //     cy.get("#landscape-overlay") // get the rotate device overlay element
        //         .should("not.be.visible"); // assert that the overlay is not visible

        //     cy.get("#embedim--snow").should("be.visible");
        // });

        // it("should not show snowflakes if snow theme is not enabled", () => {
        //     // Set the screen orientation to landscape
        //     cy.viewport("iphone-6", "landscape");

        //     cy.visit("/", {
        //         onBeforeLoad: (win) => {
        //             Object.defineProperty(win.navigator, "userAgent", {
        //                 value: MOBILE_DEVICE_USER_AGENT,
        //             });
        //         },
        //     });

        //     cy.get("#landscape-overlay") // get the rotate device overlay element
        //         .should("be.visible"); // assert that the overlay is visible

        //     // Cypress checks if element is interactive when doing visibility check
        //     // This is a workaround to have Cypress see that it's visible.
        //     cy.get("#embedim--snow").invoke("css", "pointer-events", "auto");
        //     cy.get("#embedim--snow").should("not.be.visible");

        //     // Set the screen orientation back to portrait
        //     cy.viewport("iphone-6", "portrait");

        //     cy.get("#landscape-overlay") // get the rotate device overlay element
        //         .should("not.be.visible"); // assert that the overlay is not visible

        //     cy.get("#embedim--snow").should("not.be.visible");
        // });
    });

    describe("noscript", () => {
        // It's unreasonably difficult in Cypress atm to disable JS for one test, shouldn't have to manipulate the parent iframe just to do it.
        // Putting the open issue URL here in case I want to revisit it: https://github.com/cypress-io/cypress/issues/1611
        // Instead, I'll test for the inverse for now since this isn't critical.
        it("should not display a message telling player to enable JS if it's enabled", () => {
            cy.contains("Please enable JavaScript to play this game.").should("not.be.visible");
        });
    });
});
