import { GameState, Position } from "../game";

export interface ISpawnManager {
    setGameState(gameState: GameState);
    determineNextBlockLocation(): Position;
    determineNextBlockValue(): number;
}

export class SpawnManager implements ISpawnManager {
    private gameState: GameState;

    constructor() {}

    setGameState(gameState: GameState) {
        this.gameState = gameState;
    }

    determineNextBlockLocation(): Position {
        let newX,
            newY,
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
