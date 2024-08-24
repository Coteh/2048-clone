import { jest } from "@jest/globals";
import { IAnimationManager } from "../animation";
import { GameState, Position } from "../../game";

export class MockAnimationManager implements IAnimationManager {
    public setGameState: (gameState: GameState) => void;
    public resetState: () => void;
    public initNewBlocks: () => void;
    public addNewBlock: (location: Position) => void;
    public updateBlocks: (
        oldX: number,
        oldY: number,
        newX: number,
        newY: number,
        points: number
    ) => void;
    public updateBlocksNonMerge: (oldX: number, oldY: number, newX: number, newY: number) => void;

    public isAnimationEnabled: boolean;

    constructor() {
        this.isAnimationEnabled = false;
        this.setGameState = jest.fn();
        this.resetState = jest.fn();
        this.initNewBlocks = jest.fn();
        this.addNewBlock = jest.fn();
        this.updateBlocks = jest.fn();
        this.updateBlocksNonMerge = jest.fn();
    }
}
