import jest from "jest-mock";

export const mockDetermineNextBlockLocation = jest.fn(() => {
    return {
        x: 0,
        y: 0,
    };
});

export const mockDetermineNextBlockValue = jest.fn(() => 2);

export class MockSpawnManager {
    constructor(gameState) {
        this.determineNextBlockLocation = mockDetermineNextBlockLocation;
        this.determineNextBlockValue = mockDetermineNextBlockValue;
        this.setGameState = jest.fn();
    }
}
