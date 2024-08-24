import { GameState, Position } from "../game";

export interface IAnimationManager {
    setGameState(gameState: GameState): void;
    resetState(): void;
    initNewBlocks(): void;
    addNewBlock(location: Position): void;
    updateBlocks(oldX: number, oldY: number, newX: number, newY: number, points: number): void;
    updateBlocksNonMerge(oldX: number, oldY: number, newX: number, newY: number): void;
}

export type MergedBlock = {
    position: Position;
    points: number;
};

export class AnimationManager {
    public isAnimationEnabled: boolean;
    // @ts-ignore TODO: This field is assigned in the constructor via resetState but TS is not smart enough to realize that
    public newBlocks: Position[];
    // @ts-ignore TODO: This field is assigned in the constructor via resetState but TS is not smart enough to realize that
    public movedBlocks: (Position | undefined)[][];
    // @ts-ignore TODO: This field is assigned in the constructor via resetState but TS is not smart enough to realize that
    public mergedBlocks: MergedBlock[];

    private gameState: GameState | null = null;

    constructor() {
        this.isAnimationEnabled = false;
        this.resetState();
    }

    setGameState(gameState: GameState) {
        this.gameState = gameState;
    }

    resetState() {
        this.newBlocks = [];
        this.movedBlocks = new Array(4).fill(0).map((_) => new Array(undefined));
        this.mergedBlocks = [];
    }

    initNewBlocks() {
        if (!this.gameState) {
            throw new Error("Game state not set");
        }

        this.newBlocks = [];
        for (let i = 0; i < this.gameState.board.length; i++) {
            for (let j = 0; j < this.gameState.board[i].length; j++) {
                if (this.gameState.board[i][j]) {
                    this.newBlocks.push({
                        x: j,
                        y: i,
                    });
                }
            }
        }
    }

    addNewBlock(location: Position) {
        this.newBlocks.push(location);
    }

    // TODO: Consolidate logic for updateBlocks and updateBlocksNonMerge
    updateBlocks(oldX: number, oldY: number, newX: number, newY: number, points: number) {
        if (!this.movedBlocks[newY][newX]) {
            let oldMovedValue = this.movedBlocks[oldY][oldX];
            if (!oldMovedValue) {
                oldMovedValue = {
                    x: oldX,
                    y: oldY,
                };
            }
            this.movedBlocks[oldY][oldX] = undefined;
            this.movedBlocks[newY][newX] = oldMovedValue;
            const movedBlockIndex = this.mergedBlocks.findIndex(
                (mergedBlock) => mergedBlock.position.x === oldX && mergedBlock.position.y === oldY
            );
            if (movedBlockIndex >= 0) {
                this.mergedBlocks.splice(movedBlockIndex, 1);
            }
        }
        this.mergedBlocks.push({
            points,
            position: {
                x: newX,
                y: newY,
            },
        });
    }

    updateBlocksNonMerge(oldX: number, oldY: number, newX: number, newY: number) {
        let oldMovedValue = this.movedBlocks[oldY][oldX];
        if (!oldMovedValue) {
            oldMovedValue = {
                x: oldX,
                y: oldY,
            };
        }
        this.movedBlocks[oldY][oldX] = undefined;
        this.movedBlocks[newY][newX] = oldMovedValue;
        const movedBlockIndex = this.mergedBlocks.findIndex(
            (mergedBlock) => mergedBlock.position.x === oldX && mergedBlock.position.y === oldY
        );
        if (movedBlockIndex >= 0) {
            const oldMergedBlock = this.mergedBlocks[movedBlockIndex];
            this.mergedBlocks.splice(movedBlockIndex, 1);
            this.mergedBlocks.push({
                points: oldMergedBlock.points,
                position: {
                    x: newX,
                    y: newY,
                },
            });
        }
    }
}
