/// <reference types="cypress" />

import { GamePersistentState, GameState } from "../../../src/game";
import { Preferences } from "../../../src/preferences";

// NOTE: If viewing this set of tests on Cypress UI, make sure the browser is active and you've allowed clipboard access when prompted
describe("sharing results", () => {
    const expectedUrl = "https://coteh.github.io/2048-clone/";

    beforeEach(() => {
        cy.grantClipboardPermission();
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
    });

    const stubShare = () => {
        cy.window().then((win) => {
            // Return false so that it will fallback to clipboard option
            const canShareFunc = (data) => false;
            // Create the property for canShare if it doesn't exist (ie. browser does not support share sheet), otherwise stub directly
            if (!win.navigator.canShare) {
                Object.defineProperty(win.navigator, "canShare", {
                    value: cy.stub().callsFake(canShareFunc),
                    writable: true,
                    configurable: true,
                });
            } else {
                cy.stub(win.navigator, "canShare").callsFake(canShareFunc);
            }
        });
    };

    // NOTE: Actual share sheet is mocked out for these tests
    describe("share sheet method", () => {
        it("sends data to share sheet", (done) => {
            const PREV_COPIED_TEXT = "This data should still be in clipboard when share is clicked";
            let shareStub;

            cy.window().then(async (win) => {
                // Create the property for canShare if it doesn't exist
                if (!win.navigator.canShare) {
                    Object.defineProperty(win.navigator, "canShare", {
                        value: cy.stub().callsFake((data) => true),
                        writable: true,
                        configurable: true,
                    });
                }
                // Define share function as a stub if it's a browser that doesn't support it normally, otherwise stub it directly
                if (!win.navigator.share) {
                    shareStub = cy.stub().resolves();
                    Object.defineProperty(win.navigator, "share", {
                        value: shareStub,
                        writable: true,
                        configurable: true,
                    });
                } else {
                    shareStub = cy.stub(win.navigator, "share").resolves();
                }

                win.focus();
                await win.navigator.clipboard.writeText(PREV_COPIED_TEXT);
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(PREV_COPIED_TEXT);
            });

            cy.get(".debug-link#debug").click();

            cy.contains("New Losing Game").click();

            cy.get("body").type("{rightArrow}");

            cy.get(".share-button")
                .click()
                .then(() => {
                    try {
                        expect(shareStub).to.be.calledOnce;
                        expect(shareStub).to.be.calledWithExactly({
                            text: `I got a score of 10000 in 2048-clone in 0 moves. Play it here: ${expectedUrl}`,
                        });
                        done();
                    } catch (err) {
                        done(err);
                    }
                });

            cy.window().then(async (win) => {
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(PREV_COPIED_TEXT);
            });
        });

        it("sends data to share sheet with 2048 achievement", (done) => {
            const PREV_COPIED_TEXT = "This data should still be in clipboard when share is clicked";
            let shareStub;

            cy.window().then(async (win) => {
                // Create the property for canShare if it doesn't exist
                if (!win.navigator.canShare) {
                    Object.defineProperty(win.navigator, "canShare", {
                        value: cy.stub().callsFake((data) => true),
                        writable: true,
                        configurable: true,
                    });
                }
                // Define share function as a stub if it's a browser that doesn't support it normally, otherwise stub it directly
                if (!win.navigator.share) {
                    shareStub = cy.stub().resolves();
                    Object.defineProperty(win.navigator, "share", {
                        value: shareStub,
                        writable: true,
                        configurable: true,
                    });
                } else {
                    shareStub = cy.stub(win.navigator, "share").resolves();
                }

                win.focus();
                await win.navigator.clipboard.writeText(PREV_COPIED_TEXT);
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(PREV_COPIED_TEXT);
            });

            cy.get(".debug-link#debug").click();

            cy.contains("New Winning Game").click();

            cy.get("body").type("{rightArrow}");

            cy.get(".share-button")
                .click()
                .then(() => {
                    try {
                        expect(shareStub).to.be.calledOnce;
                        expect(shareStub).to.be.calledWithExactly({
                            text: `I got a score of 2048 in 2048-clone, and I achieved 2048 in 1 move. Play it here: ${expectedUrl}`,
                        });
                        done();
                    } catch (err) {
                        done(err);
                    }
                });

            cy.window().then(async (win) => {
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(PREV_COPIED_TEXT);
            });
        });

        it("sends data to share sheet with multiple moves", (done) => {
            const PREV_COPIED_TEXT = "This data should still be in clipboard when share is clicked";
            let shareStub;

            cy.window().then(async (win) => {
                // Create the property for canShare if it doesn't exist
                if (!win.navigator.canShare) {
                    Object.defineProperty(win.navigator, "canShare", {
                        value: cy.stub().callsFake((data) => true),
                        writable: true,
                        configurable: true,
                    });
                }
                // Define share function as a stub if it's a browser that doesn't support it normally, otherwise stub it directly
                if (!win.navigator.share) {
                    shareStub = cy.stub().resolves();
                    Object.defineProperty(win.navigator, "share", {
                        value: shareStub,
                        writable: true,
                        configurable: true,
                    });
                } else {
                    shareStub = cy.stub(win.navigator, "share").resolves();
                }

                win.focus();
                await win.navigator.clipboard.writeText(PREV_COPIED_TEXT);
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(PREV_COPIED_TEXT);
            });

            cy.get(".debug-link#debug").click();

            cy.contains("New Winning Game").click();

            cy.get("body").type("{downArrow}");
            cy.get("body").type("{rightArrow}");

            cy.get(".share-button")
                .click()
                .then(() => {
                    try {
                        expect(shareStub).to.be.calledOnce;
                        expect(shareStub).to.be.calledWithExactly({
                            text: `I got a score of 4096 in 2048-clone, and I achieved 2048 in 2 moves. Play it here: ${expectedUrl}`,
                        });
                        done();
                    } catch (err) {
                        done(err);
                    }
                });

            cy.window().then(async (win) => {
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(PREV_COPIED_TEXT);
            });
        });

        it("sends data to share sheet with move count reflecting undos that may have been made", (done) => {
            const PREV_COPIED_TEXT = "This data should still be in clipboard when share is clicked";
            let shareStub;

            cy.window().then(async (win) => {
                // Create the property for canShare if it doesn't exist
                if (!win.navigator.canShare) {
                    Object.defineProperty(win.navigator, "canShare", {
                        value: cy.stub().callsFake((data) => true),
                        writable: true,
                        configurable: true,
                    });
                }
                // Define share function as a stub if it's a browser that doesn't support it normally, otherwise stub it directly
                if (!win.navigator.share) {
                    shareStub = cy.stub().resolves();
                    Object.defineProperty(win.navigator, "share", {
                        value: shareStub,
                        writable: true,
                        configurable: true,
                    });
                } else {
                    shareStub = cy.stub(win.navigator, "share").resolves();
                }

                win.focus();
                await win.navigator.clipboard.writeText(PREV_COPIED_TEXT);
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(PREV_COPIED_TEXT);
            });

            cy.get(".debug-link#debug").click();

            cy.contains("New Winning Game").click();

            cy.get("body").type("{downArrow}");
            cy.get("#undo").click({
                force: true,
            });
            cy.get("body").type("{downArrow}");
            cy.get("body").type("{rightArrow}");

            cy.get(".share-button")
                .click()
                .then(() => {
                    try {
                        expect(shareStub).to.be.calledOnce;
                        expect(shareStub).to.be.calledWithExactly({
                            text: `I got a score of 4096 in 2048-clone, and I achieved 2048 in 2 moves. Play it here: ${expectedUrl}`,
                        });
                        done();
                    } catch (err) {
                        done(err);
                    }
                });

            cy.window().then(async (win) => {
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(PREV_COPIED_TEXT);
            });
        });

        it("does not copy to clipboard when cancelled", () => {
            const PREV_COPIED_TEXT = "This data should still be in clipboard when share is clicked";

            cy.window().then(async (win) => {
                // Create the property for canShare if it doesn't exist
                if (!win.navigator.canShare) {
                    Object.defineProperty(win.navigator, "canShare", {
                        value: cy.stub().callsFake((data) => true),
                        writable: true,
                        configurable: true,
                    });
                }
                const shareFunc = (data) => {
                    console.log("Shared data:", data);
                    // Return a Promise to simulate cancelling share operation
                    return Promise.reject(new DOMException("Share canceled", "AbortError"));
                };
                // Define share function as a stub if it's a browser that doesn't support it normally, otherwise stub it directly
                if (!win.navigator.share) {
                    Object.defineProperty(win.navigator, "share", {
                        value: cy.stub().callsFake(shareFunc),
                        writable: true,
                        configurable: true,
                    });
                } else {
                    cy.stub(win.navigator, "share").callsFake(shareFunc);
                }

                win.focus();
                await win.navigator.clipboard.writeText(PREV_COPIED_TEXT);
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(PREV_COPIED_TEXT);
            });

            cy.get(".debug-link#debug").click();

            cy.contains("New Losing Game").click();

            cy.get("body").type("{rightArrow}");

            cy.get(".share-button").click();

            cy.window().then(async (win) => {
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(PREV_COPIED_TEXT);
            });

            cy.contains("Copy to Clipboard").should("not.be.visible");
        });

        it("copies to clipboard automatically when share sheet fails due to permission issue", () => {
            const PREV_COPIED_TEXT = "This data should still be in clipboard when share is clicked";

            cy.window().then(async (win) => {
                // Create the property for canShare if it doesn't exist
                if (!win.navigator.canShare) {
                    Object.defineProperty(win.navigator, "canShare", {
                        value: cy.stub().callsFake((data) => true),
                        writable: true,
                        configurable: true,
                    });
                }
                const shareFunc = (data) => {
                    console.log("Shared data:", data);
                    // Return a Promise to simulate permission issue
                    return Promise.reject(
                        new DOMException("User or app denied permission", "NotAllowedError"),
                    );
                };
                // Define share function as a stub if it's a browser that doesn't support it normally, otherwise stub it directly
                if (!win.navigator.share) {
                    Object.defineProperty(win.navigator, "share", {
                        value: cy.stub().callsFake(shareFunc),
                        writable: true,
                        configurable: true,
                    });
                } else {
                    cy.stub(win.navigator, "share").callsFake(shareFunc);
                }

                win.focus();
                await win.navigator.clipboard.writeText(PREV_COPIED_TEXT);
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(PREV_COPIED_TEXT);
            });

            cy.get(".debug-link#debug").click();

            cy.contains("New Losing Game").click();

            cy.get("body").type("{rightArrow}");

            cy.get(".share-button").click();

            cy.window().then(async (win) => {
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(
                    `I got a score of 10000 in 2048-clone in 0 moves. Play it here: ${expectedUrl}`,
                );
            });

            cy.contains("Copy to Clipboard").should("not.be.visible");
        });

        it("does not copy to clipboard automatically and instead displays error message when share sheet fails due to unknown error", () => {
            const PREV_COPIED_TEXT = "This data should still be in clipboard when share is clicked";

            cy.window().then(async (win) => {
                // Create the property for canShare if it doesn't exist
                if (!win.navigator.canShare) {
                    Object.defineProperty(win.navigator, "canShare", {
                        value: cy.stub().callsFake((data) => true),
                        writable: true,
                        configurable: true,
                    });
                }
                const shareFunc = (data) => {
                    console.log("Shared data:", data);
                    // Return a Promise to simulate unknown error
                    return Promise.reject(new DOMException("Unknown error", "UnknownError"));
                };
                // Define share function as a stub if it's a browser that doesn't support it normally, otherwise stub it directly
                if (!win.navigator.share) {
                    Object.defineProperty(win.navigator, "share", {
                        value: cy.stub().callsFake(shareFunc),
                        writable: true,
                        configurable: true,
                    });
                } else {
                    cy.stub(win.navigator, "share").callsFake(shareFunc);
                }

                win.focus();
                await win.navigator.clipboard.writeText(PREV_COPIED_TEXT);
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(PREV_COPIED_TEXT);
            });

            cy.get(".debug-link#debug").click();

            cy.contains("New Losing Game").click();

            cy.get("body").type("{rightArrow}");

            cy.get(".share-button").click();

            cy.contains("Could not share due to error").should("be.visible");

            cy.window().then(async (win) => {
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(PREV_COPIED_TEXT);
            });

            cy.contains("Copy to Clipboard").should("be.visible").click();

            cy.window().then(async (win) => {
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(
                    `I got a score of 10000 in 2048-clone in 0 moves. Play it here: ${expectedUrl}`,
                );
            });
        });

        it("copies to clipboard automatically if browser cannot validate data to be shared", () => {
            const PREV_COPIED_TEXT = "This data should still be in clipboard when share is clicked";

            cy.window().then(async (win) => {
                const canShareFunc = (data) => {
                    console.log("Shared data to be validated:", data);
                    // Return false to indicate that sharing cannot be done due to invalid data
                    return false;
                };
                // Define canShare function as a stub if it's a browser that doesn't support it normally, otherwise stub it directly
                if (!win.navigator.canShare) {
                    Object.defineProperty(win.navigator, "canShare", {
                        value: cy.stub().callsFake(canShareFunc),
                        writable: true,
                        configurable: true,
                    });
                } else {
                    cy.stub(win.navigator, "canShare").callsFake(canShareFunc);
                }

                win.focus();
                await win.navigator.clipboard.writeText(PREV_COPIED_TEXT);
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(PREV_COPIED_TEXT);
            });

            cy.get(".debug-link#debug").click();

            cy.contains("New Losing Game").click();

            cy.get("body").type("{rightArrow}");

            cy.get(".share-button").click();

            cy.window().then(async (win) => {
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(
                    `I got a score of 10000 in 2048-clone in 0 moves. Play it here: ${expectedUrl}`,
                );
            });

            cy.contains("Copy to Clipboard").should("not.be.visible");
        });
    });

    describe("clipboard fallback method", () => {
        beforeEach(() => {
            stubShare();
        });

        it("should copy the results to clipboard when share button is pressed", () => {
            const PREV_COPIED_TEXT =
                "This text should not be in clipboard when the copy button is clicked";

            cy.window().then(async (win) => {
                win.focus();
                await win.navigator.clipboard.writeText(PREV_COPIED_TEXT);
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(PREV_COPIED_TEXT);
            });

            cy.get(".debug-link#debug").click();

            cy.contains("New Losing Game").click();

            cy.get("body").type("{rightArrow}");

            cy.get(".share-button").click();

            cy.contains("Copied to clipboard").should("be.visible");

            cy.window().then(async (win) => {
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(
                    `I got a score of 10000 in 2048-clone in 0 moves. Play it here: ${expectedUrl}`,
                );
            });
        });

        it("should copy the results to clipboard with 2048 achievement when share button is pressed", () => {
            const PREV_COPIED_TEXT =
                "This text should not be in clipboard when the copy button is clicked";

            cy.window().then(async (win) => {
                win.focus();
                await win.navigator.clipboard.writeText(PREV_COPIED_TEXT);
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(PREV_COPIED_TEXT);
            });

            cy.get(".debug-link#debug").click();

            cy.contains("New Winning Game").click();

            cy.get("body").type("{rightArrow}");

            cy.get(".share-button").click();

            cy.contains("Copied to clipboard").should("be.visible");

            cy.window().then(async (win) => {
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(
                    `I got a score of 2048 in 2048-clone, and I achieved 2048 in 1 move. Play it here: ${expectedUrl}`,
                );
            });
        });

        it("should copy the results to clipboard with multiple moves when share button is pressed", () => {
            const PREV_COPIED_TEXT =
                "This text should not be in clipboard when the copy button is clicked";

            cy.window().then(async (win) => {
                win.focus();
                await win.navigator.clipboard.writeText(PREV_COPIED_TEXT);
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(PREV_COPIED_TEXT);
            });

            cy.get(".debug-link#debug").click();

            cy.contains("New Winning Game").click();

            cy.get("body").type("{downArrow}");
            cy.get("body").type("{rightArrow}");

            cy.get(".share-button").click();

            cy.contains("Copied to clipboard").should("be.visible");

            cy.window().then(async (win) => {
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(
                    `I got a score of 4096 in 2048-clone, and I achieved 2048 in 2 moves. Play it here: ${expectedUrl}`,
                );
            });
        });

        it("should copy the results to clipboard when share button is pressed with move count reflecting undos that may have been made", () => {
            const PREV_COPIED_TEXT =
                "This text should not be in clipboard when the copy button is clicked";

            cy.window().then(async (win) => {
                win.focus();
                await win.navigator.clipboard.writeText(PREV_COPIED_TEXT);
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(PREV_COPIED_TEXT);
            });

            cy.get(".debug-link#debug").click();

            cy.contains("New Winning Game").click();

            cy.get("body").type("{downArrow}");
            cy.get("#undo").click({
                force: true,
            });
            cy.get("body").type("{downArrow}");
            cy.get("body").type("{rightArrow}");

            cy.get(".share-button").click();

            cy.contains("Copied to clipboard").should("be.visible");

            cy.window().then(async (win) => {
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(
                    `I got a score of 4096 in 2048-clone, and I achieved 2048 in 2 moves. Play it here: ${expectedUrl}`,
                );
            });
        });

        it("should handle copy failure", () => {
            const PREV_COPIED_TEXT = "This text should still be copied after failure to copy";

            cy.window().then(async (win) => {
                win.focus();
                await win.navigator.clipboard.writeText(PREV_COPIED_TEXT);
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(PREV_COPIED_TEXT);
                win.navigator.clipboard.writeText = cy.stub().rejects(new Error("Error copying"));
            });

            cy.get(".debug-link#debug").click();

            cy.contains("New Losing Game").click();

            cy.get("body").type("{rightArrow}");

            cy.get(".share-button").click();

            cy.contains("Could not copy to clipboard due to error").should("be.visible");

            cy.window().then(async (win) => {
                const copiedText = await win.navigator.clipboard.readText();
                expect(copiedText).to.eq(PREV_COPIED_TEXT);
            });
        });
    });

    describe.skip("legacy clipboard fallback method", () => {
        it("should copy the results to clipboard when share button is pressed", () => {
            throw new Error("TODO: implement this test");
        });

        it("should show a message when results have been copied", () => {
            throw new Error("TODO: implement this test");
        });

        it("should handle copy failure", () => {
            throw new Error("TODO: implement this test");
        });
    });
});
