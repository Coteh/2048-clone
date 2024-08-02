declare namespace Cypress {
    interface Chainable<Subject = any> {
        clearBrowserCache(): Chainable<any>;
        shouldNotBeActionable(done: Mocha.Done): Chainable<Element>;
        shouldBeInViewport(): Chainable<any>;
        waitUntilDialogAppears(): Chainable<any>;
        verifyBoard(expectedBoard: (number | undefined)[][]): Chainable<any>;
    }
}
