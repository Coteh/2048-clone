declare namespace Cypress {
    interface Chainable<Subject = any> {
        clearBrowserCache(): Chainable<any>;
        grantClipboardPermission(): Chainable<any>;
        shouldNotBeActionable(done: Mocha.Done): Chainable<Element>;
        shouldBeInViewport(): Chainable<any>;
        waitUntilDialogAppears(): Chainable<any>;
        verifyBoardMatches(expectedBoard: (number | undefined)[][]): Chainable<any>;
        verifyBoardDoesNotMatch(expectedBoard: (number | undefined)[][]): Chainable<any>;
    }
}
