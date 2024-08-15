import { GameState, Position } from "../game";

export interface ISpawnManager {
    setGameState(gameState: GameState): void;
    determineNextBlockLocation(): Position;
    determineNextBlockValue(): number;
}

export class SpawnManager implements ISpawnManager {
    private gameState: GameState | null = null;

    constructor() {}

    setGameState(gameState: GameState) {
        this.gameState = gameState;
    }

    determineNextBlockLocation(): Position {
        if (!this.gameState) {
            throw new Error("Game state not set");
        }

        let newX = -1,
            newY = -1,
            blockValue = -1;

        while (blockValue !== 0) {
            newX = Math.floor(Math.random() * 4);
            newY = Math.floor(Math.random() * 4);
            console.log("new xy", newX, newY);
            blockValue = this.gameState.board[newY][newX];
            console.log("block value", blockValue);
        }

        return {
            x: newX,
            y: newY,
        };
    }

    determineNextBlockValue(): number {
        return Math.round(Math.random()) == 0 ? 2 : 4;
    }
}
