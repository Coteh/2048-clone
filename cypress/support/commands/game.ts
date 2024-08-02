Cypress.Commands.add("verifyBoard", (expectedBoard: number[][]) => {
    cy.get(".base-rows > .input-row").should("have.length", expectedBoard.length);
    for (let i = 0; i < expectedBoard.length; i++) {
        cy.get(".base-rows > .input-row")
            .eq(i)
            .within(() => {
                cy.get(".box").then((boxes) => {
                    expect(boxes).to.have.length(expectedBoard[i].length);
                    for (let j = 0; j < expectedBoard[i].length; j++) {
                        const expectedVal = expectedBoard[i][j];
                        if (expectedVal > 0) {
                            expect(boxes.eq(j)).to.have.text(expectedVal.toString());
                        } else if (expectedVal === 0) {
                            expect(boxes.eq(j)).to.have.text("");
                        }
                    }
                });
            });
    }
});
