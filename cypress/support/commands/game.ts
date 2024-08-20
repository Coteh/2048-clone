Cypress.Commands.add("verifyBoardMatches", (expectedBoard: (number | undefined)[][]) => {
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

Cypress.Commands.add("verifyBoardDoesNotMatch", (expectedBoard: (number | undefined)[][]) => {
    cy.get(".base-rows > .input-row").should("have.length", expectedBoard.length);
    for (let i = 0; i < expectedBoard.length; i++) {
        cy.get(".base-rows > .input-row")
            .eq(i)
            .within(() => {
                cy.get(".box").then((boxes) => {
                    if (expectedBoard[i].length != boxes.length) {
                        return;
                    }
                    let numMatches = 0;
                    for (let j = 0; j < expectedBoard[i].length; j++) {
                        const expectedVal = expectedBoard[i][j];
                        const boxElem = boxes.eq(j);
                        if (boxElem.text() === expectedVal.toString()) {
                            numMatches++;
                        }
                    }
                    expect(numMatches).to.be.lessThan(expectedBoard[i].length);
                });
            });
    }
});
