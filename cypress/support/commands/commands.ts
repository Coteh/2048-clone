// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("clearBrowserCache", () => {
    // Call Chrome's API for clearing browser cache when running this test
    // https://stackoverflow.com/a/67858001
    Cypress.automation("remote:debugger:protocol", {
        command: "Network.clearBrowserCache",
    });
});

// Adapted from https://github.com/cypress-io/cypress/discussions/21150#discussioncomment-2620947
Cypress.Commands.add("shouldNotBeActionable", { prevSubject: "element" }, (subject, done) => {
    cy.once("fail", (err) => {
        expect(err.message).to.include("`cy.click()` failed because this element");
        expect(err.message).to.include("is being covered by another element");
        done();
    });

    cy.wrap(subject)
        .click({
            timeout: 100,
        })
        .then(() => {
            done(new Error("Expected element NOT to be clickable, but click() succeeded"));
        });
});

// Adapted from https://github.com/cypress-io/cypress/issues/877#issuecomment-490504922
Cypress.Commands.add("shouldBeInViewport", { prevSubject: true }, (subject) => {
    // @ts-ignore TODO: Fix cy.state type error
    const window = Cypress.$(cy.state("window"));
    const bottom = window.height();
    const right = window.width();
    const rect = subject[0].getBoundingClientRect();

    expect(rect.top).not.to.be.greaterThan(bottom).and.not.to.be.lessThan(0);
    expect(rect.bottom).not.to.be.greaterThan(bottom).and.not.to.be.lessThan(0);
    expect(rect.left).not.to.be.greaterThan(right).and.not.to.be.lessThan(0);
    expect(rect.right).not.to.be.greaterThan(right).and.not.to.be.lessThan(0);
});

Cypress.Commands.add("waitUntilDialogAppears", () => {
    cy.waitUntil(() =>
        cy.window().then((win) => {
            cy.get(".dialog").then(
                (dialog) => parseInt(win.getComputedStyle(dialog[0]).opacity) === 1
            );
        })
    );
});

// Extended cy.intercept to add a log when the request gets intercepted.
// See https://glebbahmutov.com/blog/cypress-intercept-problems/
Cypress.Commands.overwrite("intercept", (intercept, ...args) =>
    cy.log("intercept", args).then(() => intercept(...args))
);
