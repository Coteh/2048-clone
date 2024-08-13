import { jest } from "@jest/globals";
import {
    initGame,
    move,
    DIRECTION_DOWN,
    DIRECTION_RIGHT,
    DIRECTION_LEFT,
    DIRECTION_UP,
    getGameState,
    GameState,
    GamePersistentState,
} from "../src/game";
import * as assert from "assert";
import { MockSpawnManager } from "../src/manager/__mocks__/spawn";
import { MockAnimationManager } from "../src/manager/__mocks__/animation";
import { IGameStorage } from "../src/storage";
import { Preferences } from "../src/preferences";
import { Mock } from "jest-mock";

class MockGameStorage implements IGameStorage {
    gameState: GameState;
    constructor(gameState: GameState) {
        this.gameState = gameState;
    }
    saveGame = (_gameState: GameState) => {};
    savePersistentState = (_persistentState: GamePersistentState) => {};
    savePreferences = (_preferences: Preferences) => {};
    gameExists = () => true;
    persistentStateExists = () => false;
    preferencesExists = () => false;
    loadGame: () => GameState = () => {
        return JSON.parse(JSON.stringify(this.gameState));
    };
    loadPersistentState: () => GamePersistentState = () => ({
        highscore: 0,
        unlockables: {},
        hasPlayedBefore: false,
    });
    loadPreferences: () => Preferences = () => ({});
    clearGame: () => void = () => {};
    clearPersistentState: () => void = () => {};
    clearPreferences: () => void = () => {};
}

describe("core game logic", () => {
    let eventHandlerStub: Mock;
    const mockSpawnManager = new MockSpawnManager();
    const mockAnimationManager = new MockAnimationManager();

    async function setupGame(gameState: GameState): Promise<GameState> {
        const mockGameStorage = new MockGameStorage(gameState);
        await initGame(eventHandlerStub, mockSpawnManager, mockAnimationManager, mockGameStorage);
        return getGameState();
    }

    beforeEach(async () => {
        eventHandlerStub = jest.fn();
        mockSpawnManager.determineNextBlockLocation.mockClear();
        mockSpawnManager.determineNextBlockValue.mockClear();
    });
    it("should move a single tile from top to bottom", async () => {
        mockSpawnManager.determineNextBlockLocation.mockImplementation(() => {
            return {
                x: 1,
                y: 1,
            };
        });
        mockSpawnManager.determineNextBlockValue.mockImplementation(() => {
            return 2;
        });

        const gameState = await setupGame({
            board: [
                [2, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            ended: false,
            won: false,
            score: 0,
            didUndo: false,
            achievedHighscore: false,
        });
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 2);
        assert.strictEqual(gameState.board[3][0], 0);
        move(DIRECTION_DOWN);
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 0);
        assert.strictEqual(gameState.board[3][0], 2);
    });
    it("should move a single tile from left to right", async () => {
        mockSpawnManager.determineNextBlockLocation.mockImplementation(() => {
            return {
                x: 1,
                y: 1,
            };
        });
        mockSpawnManager.determineNextBlockValue.mockImplementation(() => {
            return 2;
        });

        const gameState = await setupGame({
            board: [
                [2, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            ended: false,
            won: false,
            score: 0,
            didUndo: false,
            achievedHighscore: false,
        });
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 2);
        assert.strictEqual(gameState.board[0][3], 0);
        move(DIRECTION_RIGHT);
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 0);
        assert.strictEqual(gameState.board[0][3], 2);
    });
    it("should move a single tile from bottom to top", async () => {
        mockSpawnManager.determineNextBlockLocation.mockImplementation(() => {
            return {
                x: 1,
                y: 1,
            };
        });
        mockSpawnManager.determineNextBlockValue.mockImplementation(() => {
            return 2;
        });

        const gameState = await setupGame({
            board: [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [2, 0, 0, 0],
            ],
            ended: false,
            won: false,
            score: 0,
            didUndo: false,
            achievedHighscore: false,
        });
        console.log(gameState);
        assert.strictEqual(gameState.board[3][0], 2);
        assert.strictEqual(gameState.board[0][0], 0);
        move(DIRECTION_UP);
        console.log("teh game state", gameState);
        assert.strictEqual(gameState.board[3][0], 0);
        assert.strictEqual(gameState.board[0][0], 2);
    });
    it("should move a single tile from right to left", async () => {
        mockSpawnManager.determineNextBlockLocation.mockImplementation(() => {
            return {
                x: 1,
                y: 1,
            };
        });
        mockSpawnManager.determineNextBlockValue.mockImplementation(() => {
            return 2;
        });

        const gameState = await setupGame({
            board: [
                [0, 0, 0, 2],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            ended: false,
            won: false,
            score: 0,
            didUndo: false,
            achievedHighscore: false,
        });
        console.log(gameState);
        assert.strictEqual(gameState.board[0][3], 2);
        assert.strictEqual(gameState.board[0][0], 0);
        move(DIRECTION_LEFT);
        console.log("teh game state", gameState);
        assert.strictEqual(gameState.board[0][3], 0);
        assert.strictEqual(gameState.board[0][0], 2);
    });
    it("should merge two equivalent tiles together when they collide", async () => {
        mockSpawnManager.determineNextBlockLocation.mockImplementation(() => {
            return {
                x: 1,
                y: 1,
            };
        });
        mockSpawnManager.determineNextBlockValue.mockImplementation(() => {
            return 2;
        });

        const gameState = await setupGame({
            board: [
                [2, 0, 0, 2],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            ended: false,
            won: false,
            score: 0,
            didUndo: false,
            achievedHighscore: false,
        });
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 2);
        assert.strictEqual(gameState.board[0][3], 2);
        move(DIRECTION_RIGHT);
        assert.strictEqual(gameState.board[0][0], 0);
        assert.strictEqual(gameState.board[0][3], 4);
    });
    it("should not merge two equivalent tiles together when they collide", async () => {
        mockSpawnManager.determineNextBlockLocation.mockImplementation(() => {
            return {
                x: 1,
                y: 1,
            };
        });
        mockSpawnManager.determineNextBlockValue.mockImplementation(() => {
            return 2;
        });

        const gameState = await setupGame({
            board: [
                [2, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [2, 0, 0, 0],
            ],
            ended: false,
            won: false,
            score: 0,
            didUndo: false,
            achievedHighscore: false,
        });
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 2);
        assert.strictEqual(gameState.board[3][0], 2);
        move(DIRECTION_DOWN);
        assert.strictEqual(gameState.board[0][0], 0);
        assert.strictEqual(gameState.board[3][0], 4);
    });
    it("should generate a new block when a move is made", async () => {
        mockSpawnManager.determineNextBlockLocation.mockImplementation(() => {
            return {
                x: 1,
                y: 1,
            };
        });
        mockSpawnManager.determineNextBlockValue.mockImplementation(() => {
            return 2;
        });

        const gameState = await setupGame({
            board: [
                [2, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            ended: false,
            won: false,
            score: 0,
            didUndo: false,
            achievedHighscore: false,
        });
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 2);
        assert.strictEqual(gameState.board[3][0], 0);
        assert.strictEqual(gameState.board[1][1], 0);
        move(DIRECTION_DOWN);
        assert.strictEqual(gameState.board[0][0], 0);
        assert.strictEqual(gameState.board[3][0], 2);
        assert.strictEqual(gameState.board[1][1], 2);
    });
    it("should declare game over if no more moves can be made on the board", async () => {
        mockSpawnManager.determineNextBlockLocation.mockImplementation(() => {
            return {
                x: 0,
                y: 0,
            };
        });
        mockSpawnManager.determineNextBlockValue.mockImplementation(() => {
            return 4;
        });

        const gameState = await setupGame({
            board: [
                [2, 2, 4, 8],
                [0, 4, 2, 16],
                [4, 16, 32, 8],
                [2, 32, 64, 256],
            ],
            ended: false,
            won: false,
            score: 2224,
            didUndo: false,
            achievedHighscore: false,
        });
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 2);
        assert.strictEqual(gameState.board[1][0], 0);
        assert.strictEqual(gameState.ended, false);
        let prevBoard = JSON.parse(JSON.stringify(gameState.board));
        move(DIRECTION_DOWN);
        console.log(gameState);
        assert.notDeepStrictEqual(gameState.board, prevBoard);
        assert.strictEqual(gameState.ended, true);
        // Should not be able to make any more moves upon game over
        mockSpawnManager.determineNextBlockValue.mockImplementation(() => {
            return 2;
        });
        move(DIRECTION_RIGHT);
        prevBoard = JSON.parse(JSON.stringify(gameState.board));
        assert.notStrictEqual(gameState.board, prevBoard);
        assert.strictEqual(gameState.ended, true);
    });
    it("should allow player to continue the game if board is full but adjacent blocks can be merged", async () => {
        mockSpawnManager.determineNextBlockLocation.mockImplementation(() => {
            return {
                x: 0,
                y: 0,
            };
        });
        mockSpawnManager.determineNextBlockValue.mockImplementation(() => {
            return 2;
        });

        const gameState = await setupGame({
            board: [
                [2, 2, 4, 8],
                [0, 4, 2, 16],
                [4, 16, 32, 8],
                [2, 32, 64, 256],
            ],
            ended: false,
            won: false,
            score: 2224,
            didUndo: false,
            achievedHighscore: false,
        });
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 2);
        assert.strictEqual(gameState.board[1][0], 0);
        assert.strictEqual(gameState.board[0][1], 2);
        assert.strictEqual(gameState.ended, false);
        move(DIRECTION_DOWN);
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 2);
        assert.strictEqual(gameState.board[1][0], 2);
        assert.strictEqual(gameState.board[0][1], 2);
        assert.strictEqual(gameState.ended, false);
        // Should still be able to make a move at this point
        move(DIRECTION_RIGHT);
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 2);
        assert.strictEqual(gameState.board[1][0], 2);
        assert.strictEqual(gameState.board[0][1], 4);
        assert.strictEqual(gameState.ended, false);
    });
    it("should resolve merges bottom-up when moving down", async () => {
        mockSpawnManager.determineNextBlockLocation.mockImplementation(() => {
            return {
                x: 1,
                y: 1,
            };
        });
        mockSpawnManager.determineNextBlockValue.mockImplementation(() => {
            return 2;
        });

        const gameState = await setupGame({
            board: [
                [2, 0, 0, 0],
                [2, 0, 0, 0],
                [2, 0, 0, 0],
                [8, 0, 0, 0],
            ],
            ended: false,
            won: false,
            score: 0,
            didUndo: false,
            achievedHighscore: false,
        });
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 2);
        assert.strictEqual(gameState.board[1][0], 2);
        assert.strictEqual(gameState.board[2][0], 2);
        assert.strictEqual(gameState.board[3][0], 8);
        move(DIRECTION_DOWN);
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 0);
        assert.strictEqual(gameState.board[1][0], 2);
        assert.strictEqual(gameState.board[2][0], 4);
        assert.strictEqual(gameState.board[3][0], 8);
    });
    it("should resolve merges bottom-up when moving right", async () => {
        mockSpawnManager.determineNextBlockLocation.mockImplementation(() => {
            return {
                x: 1,
                y: 1,
            };
        });
        mockSpawnManager.determineNextBlockValue.mockImplementation(() => {
            return 2;
        });

        const gameState = await setupGame({
            board: [
                [2, 2, 2, 8],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            ended: false,
            won: false,
            score: 0,
            didUndo: false,
            achievedHighscore: false,
        });
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 2);
        assert.strictEqual(gameState.board[0][1], 2);
        assert.strictEqual(gameState.board[0][2], 2);
        assert.strictEqual(gameState.board[0][3], 8);
        move(DIRECTION_RIGHT);
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 0);
        assert.strictEqual(gameState.board[0][1], 2);
        assert.strictEqual(gameState.board[0][2], 4);
        assert.strictEqual(gameState.board[0][3], 8);
    });
    it("should resolve merges top-down when moving up", async () => {
        mockSpawnManager.determineNextBlockLocation.mockImplementation(() => {
            return {
                x: 1,
                y: 1,
            };
        });
        mockSpawnManager.determineNextBlockValue.mockImplementation(() => {
            return 2;
        });

        const gameState = await setupGame({
            board: [
                [8, 0, 0, 0],
                [2, 0, 0, 0],
                [2, 0, 0, 0],
                [2, 0, 0, 0],
            ],
            ended: false,
            won: false,
            score: 0,
            didUndo: false,
            achievedHighscore: false,
        });
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 8);
        assert.strictEqual(gameState.board[1][0], 2);
        assert.strictEqual(gameState.board[2][0], 2);
        assert.strictEqual(gameState.board[3][0], 2);
        move(DIRECTION_UP);
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 8);
        assert.strictEqual(gameState.board[1][0], 4);
        assert.strictEqual(gameState.board[2][0], 2);
        assert.strictEqual(gameState.board[3][0], 0);
    });
    it("should resolve merges top-down when moving left", async () => {
        mockSpawnManager.determineNextBlockLocation.mockImplementation(() => {
            return {
                x: 1,
                y: 1,
            };
        });
        mockSpawnManager.determineNextBlockValue.mockImplementation(() => {
            return 2;
        });

        const gameState = await setupGame({
            board: [
                [8, 2, 2, 2],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            ended: false,
            won: false,
            score: 0,
            didUndo: false,
            achievedHighscore: false,
        });
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 8);
        assert.strictEqual(gameState.board[0][1], 2);
        assert.strictEqual(gameState.board[0][2], 2);
        assert.strictEqual(gameState.board[0][3], 2);
        move(DIRECTION_LEFT);
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 8);
        assert.strictEqual(gameState.board[0][1], 4);
        assert.strictEqual(gameState.board[0][2], 2);
        assert.strictEqual(gameState.board[0][3], 0);
    });
    it("should allow blocks to merge only once per move", async () => {
        mockSpawnManager.determineNextBlockLocation.mockImplementation(() => {
            return {
                x: 1,
                y: 1,
            };
        });
        mockSpawnManager.determineNextBlockValue.mockImplementation(() => {
            return 2;
        });

        const gameState = await setupGame({
            board: [
                [2, 0, 0, 0],
                [2, 0, 0, 0],
                [2, 0, 0, 0],
                [2, 0, 0, 0],
            ],
            ended: false,
            won: false,
            score: 0,
            didUndo: false,
            achievedHighscore: false,
        });
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 2);
        assert.strictEqual(gameState.board[1][0], 2);
        assert.strictEqual(gameState.board[2][0], 2);
        assert.strictEqual(gameState.board[3][0], 2);
        move(DIRECTION_DOWN);
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 0);
        assert.strictEqual(gameState.board[1][0], 0);
        assert.strictEqual(gameState.board[2][0], 4);
        assert.strictEqual(gameState.board[3][0], 4);
    });
});
