import { jest } from "@jest/globals";
import { ISpawnManager } from "../spawn";
import { GameState, Position } from "../../game";

export const mockDetermineNextBlockLocation = jest.fn(() => {
    return {
        x: 0,
        y: 0,
    };
});

export const mockDetermineNextBlockValue = jest.fn(() => 2);

export class MockSpawnManager implements ISpawnManager {
    public setGameState: jest.Mock<(gameState: GameState) => void>;
    public determineNextBlockLocation: jest.Mock<() => Position>;
    public determineNextBlockValue: jest.Mock<() => number>;

    constructor() {
        this.determineNextBlockLocation = mockDetermineNextBlockLocation;
        this.determineNextBlockValue = mockDetermineNextBlockValue;
        this.setGameState = jest.fn();
    }
}
