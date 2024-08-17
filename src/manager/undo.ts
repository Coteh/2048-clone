import { GameState } from "../game";

export interface IUndoManager {
    setGameState(gameState: GameState): void;
    getGameStateStack(): readonly GameState[];
    pushGameState(): void;
    popGameState(): GameState | null;
    clear(): void;
}

export class UndoManager {
    private gameStateStack: GameState[];

    private gameState: GameState | null = null;

    constructor() {
        this.gameStateStack = new Array<GameState>(0);
    }

    setGameState(gameState: GameState) {
        this.gameState = gameState;
    }

    getGameStateStack() {
        return this.gameStateStack;
    }

    pushGameState() {
        if (!this.gameState) {
            throw new Error("Game state not set");
        }

        const gameStateCopy = JSON.parse(JSON.stringify(this.gameState));
        this.gameStateStack.push(gameStateCopy);
    }

    popGameState() {
        if (!this.gameState) {
            throw new Error("Game state not set");
        }

        if (this.gameStateStack.length === 0) {
            return null;
        }

        const gameStateCopy = this.gameStateStack.pop()!;
        const gameStateKeys = Object.keys(gameStateCopy) as (keyof GameState)[];
        gameStateKeys.forEach((key) => {
            // TODO: Fix the following type errors
            // Object is possibly 'null'.ts(2531)
            // Type 'number | boolean | GameBoard' is not assignable to type 'never'.
            // Type 'number' is not assignable to type 'never'.ts(2322)
            // @ts-ignore
            this.gameState[key] = gameStateCopy[key];
        });
        return gameStateCopy;
    }

    clear() {
        this.gameStateStack = new Array<GameState>(0);
    }
}
