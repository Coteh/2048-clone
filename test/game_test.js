const { initGame, move, DIRECTION_DOWN, DIRECTION_RIGHT, DIRECTION_LEFT, DIRECTION_UP, getGameState } = require("../src/game");
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const sinon = require("sinon");
const { STATE_JSON_FILENAME } = require("../src/storage/cli");
const vol = require('memfs').vol;
const SpawnManager = require("../src/manager/spawn");
const { mockDetermineNextBlockLocation, mockDetermineNextBlockValue } = require("../src/manager/spawn");

jest.mock("fs");
jest.mock("../src/manager/spawn");

describe("core game logic", () => {
    let eventHandlerStub;

    beforeAll(() => {
        process.chdir('/');
    });
    beforeEach(async () => {
        eventHandlerStub = sinon.stub();
        vol.reset();
        mockDetermineNextBlockLocation.mockClear();
        mockDetermineNextBlockValue.mockClear();
    });
    it("should move a single tile from top to bottom", async () => {
        mockDetermineNextBlockLocation.mockImplementation(() => {
            return {
                x: 1,
                y: 1,
            };
        });
        mockDetermineNextBlockValue.mockImplementation(() => {
            return 2;
        });

        let expectedGameState = {
            board: [
                [2, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            ended: false,
            highscore: 0,
            won: false,
            score: 0,
            did_undo: false,
        };
        const stateFilename = path.join(process.cwd(), STATE_JSON_FILENAME);
        console.log(stateFilename);
        vol.writeFileSync(stateFilename, JSON.stringify(expectedGameState));
        await initGame(eventHandlerStub);
        let gameState = getGameState();
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 2);
        assert.strictEqual(gameState.board[3][0], 0);
        move(DIRECTION_DOWN);
        gameState = getGameState();
        assert.strictEqual(gameState.board[0][0], 0);
        assert.strictEqual(gameState.board[3][0], 2);
    });
    it("should move a single tile from left to right", async () => {
        mockDetermineNextBlockLocation.mockImplementation(() => {
            return {
                x: 1,
                y: 1,
            };
        });
        mockDetermineNextBlockValue.mockImplementation(() => {
            return 2;
        });

        let expectedGameState = {
            board: [
                [2, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            ended: false,
            highscore: 0,
            won: false,
            score: 0,
            did_undo: false,
        };
        const stateFilename = path.join(process.cwd(), STATE_JSON_FILENAME);
        console.log(stateFilename);
        vol.writeFileSync(stateFilename, JSON.stringify(expectedGameState));
        await initGame(eventHandlerStub);
        let gameState = getGameState();
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 2);
        assert.strictEqual(gameState.board[0][3], 0);
        move(DIRECTION_RIGHT);
        gameState = getGameState();
        console.log(gameState)
        assert.strictEqual(gameState.board[0][0], 0);
        assert.strictEqual(gameState.board[0][3], 2);
    });
    it("should move a single tile from bottom to top", async () => {
        mockDetermineNextBlockLocation.mockImplementation(() => {
            return {
                x: 1,
                y: 1,
            };
        });
        mockDetermineNextBlockValue.mockImplementation(() => {
            return 2;
        });

        let expectedGameState = {
            board: [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [2, 0, 0, 0],
            ],
            ended: false,
            highscore: 0,
            won: false,
            score: 0,
            did_undo: false,
        };
        const stateFilename = path.join(process.cwd(), STATE_JSON_FILENAME);
        console.log(stateFilename);
        vol.writeFileSync(stateFilename, JSON.stringify(expectedGameState));
        await initGame(eventHandlerStub);
        let gameState = getGameState();
        console.log(gameState);
        assert.strictEqual(gameState.board[3][0], 2);
        assert.strictEqual(gameState.board[0][0], 0);
        move(DIRECTION_UP);
        gameState = getGameState();
        console.log("teh game state", gameState);
        assert.strictEqual(gameState.board[3][0], 0);
        assert.strictEqual(gameState.board[0][0], 2);
    });
    it("should move a single tile from right to left", async () => {
        mockDetermineNextBlockLocation.mockImplementation(() => {
            return {
                x: 1,
                y: 1,
            };
        });
        mockDetermineNextBlockValue.mockImplementation(() => {
            return 2;
        });

        let expectedGameState = {
            board: [
                [0, 0, 0, 2],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            ended: false,
            highscore: 0,
            won: false,
            score: 0,
            did_undo: false,
        };
        const stateFilename = path.join(process.cwd(), STATE_JSON_FILENAME);
        console.log(stateFilename);
        vol.writeFileSync(stateFilename, JSON.stringify(expectedGameState));
        await initGame(eventHandlerStub);
        let gameState = getGameState();
        console.log(gameState);
        assert.strictEqual(gameState.board[0][3], 2);
        assert.strictEqual(gameState.board[0][0], 0);
        move(DIRECTION_LEFT);
        gameState = getGameState();
        console.log("teh game state", gameState);
        assert.strictEqual(gameState.board[0][3], 0);
        assert.strictEqual(gameState.board[0][0], 2);
    });
    it("should merge two equivalent tiles together when they collide", async () => {
        mockDetermineNextBlockLocation.mockImplementation(() => {
            return {
                x: 1,
                y: 1,
            };
        });
        mockDetermineNextBlockValue.mockImplementation(() => {
            return 2;
        });

        let expectedGameState = {
            board: [
                [2, 0, 0, 2],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            ended: false,
            highscore: 0,
            won: false,
            score: 0,
            did_undo: false,
        };
        const stateFilename = path.join(process.cwd(), STATE_JSON_FILENAME);
        console.log(stateFilename);
        vol.writeFileSync(stateFilename, JSON.stringify(expectedGameState));
        await initGame(eventHandlerStub);
        let gameState = getGameState();
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 2);
        assert.strictEqual(gameState.board[0][3], 2);
        move(DIRECTION_RIGHT);
        gameState = getGameState();
        assert.strictEqual(gameState.board[0][0], 0);
        assert.strictEqual(gameState.board[0][3], 4);
    });
    it("should not merge two equivalent tiles together when they collide", async () => {
        mockDetermineNextBlockLocation.mockImplementation(() => {
            return {
                x: 1,
                y: 1,
            };
        });
        mockDetermineNextBlockValue.mockImplementation(() => {
            return 2;
        });

        let expectedGameState = {
            board: [
                [2, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [2, 0, 0, 0],
            ],
            ended: false,
            highscore: 0,
            won: false,
            score: 0,
            did_undo: false,
        };
        const stateFilename = path.join(process.cwd(), STATE_JSON_FILENAME);
        console.log(stateFilename);
        vol.writeFileSync(stateFilename, JSON.stringify(expectedGameState));
        await initGame(eventHandlerStub);
        let gameState = getGameState();
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 2);
        assert.strictEqual(gameState.board[3][0], 2);
        move(DIRECTION_DOWN);
        gameState = getGameState();
        assert.strictEqual(gameState.board[0][0], 0);
        assert.strictEqual(gameState.board[3][0], 4);
    });
    it("should generate a new block when a move is made", async () => {
        mockDetermineNextBlockLocation.mockImplementation(() => {
            return {
                x: 1,
                y: 1,
            };
        });
        mockDetermineNextBlockValue.mockImplementation(() => {
            return 2;
        });
        
        let expectedGameState = {
            board: [
                [2, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            ended: false,
            highscore: 0,
            won: false,
            score: 0,
            did_undo: false,
        };
        const stateFilename = path.join(process.cwd(), STATE_JSON_FILENAME);
        console.log(stateFilename);
        vol.writeFileSync(stateFilename, JSON.stringify(expectedGameState));
        await initGame(eventHandlerStub);
        let gameState = getGameState();
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 2);
        assert.strictEqual(gameState.board[3][0], 0);
        assert.strictEqual(gameState.board[1][1], 0);
        move(DIRECTION_DOWN);
        gameState = getGameState();
        assert.strictEqual(gameState.board[0][0], 0);
        assert.strictEqual(gameState.board[3][0], 2);
        assert.strictEqual(gameState.board[1][1], 2);
    });
    it("should declare game over if no more moves can be made on the board", async () => {
        mockDetermineNextBlockLocation.mockImplementation(() => {
            return {
                x: 0,
                y: 0,
            };
        });
        mockDetermineNextBlockValue.mockImplementation(() => {
            return 4;
        });

        let expectedGameState = {
            board: [
                [ 2, 2,  4,  8   ],
                [ 0, 4,  2,  16  ],
                [ 4, 16, 32, 8   ],
                [ 2, 32, 64, 256 ],
            ],
            ended: false,
            highscore: 2224,
            won: false,
            score: 2224,
            did_undo: false,
        };
        const stateFilename = path.join(process.cwd(), STATE_JSON_FILENAME);
        console.log(stateFilename);
        vol.writeFileSync(stateFilename, JSON.stringify(expectedGameState));
        await initGame(eventHandlerStub);
        let gameState = getGameState();
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 2);
        assert.strictEqual(gameState.board[1][0], 0);
        assert.strictEqual(gameState.ended, false);
        move(DIRECTION_DOWN);
        let prevBoard = JSON.parse(JSON.stringify(gameState.board));
        // TODO: Do I need to call getGameState() again if the gameState is returned by ref?
        gameState = getGameState();
        console.log(gameState);
        assert.notStrictEqual(gameState.board, prevBoard);
        assert.strictEqual(gameState.ended, true);
        // Should not be able to make any more moves upon game over
        mockDetermineNextBlockValue.mockImplementation(() => {
            return 2;
        });
        move(DIRECTION_RIGHT);
        prevBoard = JSON.parse(JSON.stringify(gameState.board));
        gameState = getGameState();
        assert.notStrictEqual(gameState.board, prevBoard);
        assert.strictEqual(gameState.ended, true);
    });
    it("should allow player to continue the game if board is full but adjacent blocks can be merged", async () => {
        mockDetermineNextBlockLocation.mockImplementation(() => {
            return {
                x: 0,
                y: 0,
            };
        });
        mockDetermineNextBlockValue.mockImplementation(() => {
            return 2;
        });

        let expectedGameState = {
            board: [
                [ 2, 2,  4,  8   ],
                [ 0, 4,  2,  16  ],
                [ 4, 16, 32, 8   ],
                [ 2, 32, 64, 256 ],
            ],
            ended: false,
            highscore: 2224,
            won: false,
            score: 2224,
            did_undo: false,
        };
        const stateFilename = path.join(process.cwd(), STATE_JSON_FILENAME);
        console.log(stateFilename);
        vol.writeFileSync(stateFilename, JSON.stringify(expectedGameState));
        await initGame(eventHandlerStub);
        let gameState = getGameState();
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 2);
        assert.strictEqual(gameState.board[1][0], 0);
        assert.strictEqual(gameState.board[0][1], 2);
        assert.strictEqual(gameState.ended, false);
        move(DIRECTION_DOWN);
        gameState = getGameState();
        console.log(gameState)
        assert.strictEqual(gameState.board[0][0], 2);
        assert.strictEqual(gameState.board[1][0], 2);
        assert.strictEqual(gameState.board[0][1], 2);
        assert.strictEqual(gameState.ended, false);
        // Should still be able to make a move at this point
        move(DIRECTION_RIGHT);
        gameState = getGameState();
        console.log(gameState)
        assert.strictEqual(gameState.board[0][0], 2);
        assert.strictEqual(gameState.board[1][0], 2);
        assert.strictEqual(gameState.board[0][1], 0);
        assert.strictEqual(gameState.ended, false);
    });
    it("should resolve merges bottom-up", async () => {
        mockDetermineNextBlockLocation.mockImplementation(() => {
            return {
                x: 1,
                y: 1,
            };
        });
        mockDetermineNextBlockValue.mockImplementation(() => {
            return 2;
        });

        let expectedGameState = {
            board: [
                [2, 0, 0, 0],
                [2, 0, 0, 0],
                [2, 0, 0, 0],
                [8, 0, 0, 0],
            ],
            ended: false,
            highscore: 0,
            won: false,
            score: 0,
            did_undo: false,
        };
        const stateFilename = path.join(process.cwd(), STATE_JSON_FILENAME);
        console.log(stateFilename);
        vol.writeFileSync(stateFilename, JSON.stringify(expectedGameState));
        await initGame(eventHandlerStub);
        let gameState = getGameState();
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 2);
        assert.strictEqual(gameState.board[1][0], 2);
        assert.strictEqual(gameState.board[2][0], 2);
        assert.strictEqual(gameState.board[3][0], 8);
        move(DIRECTION_DOWN);
        gameState = getGameState();
        console.log(gameState);
        assert.strictEqual(gameState.board[0][0], 0);
        assert.strictEqual(gameState.board[1][0], 2);
        assert.strictEqual(gameState.board[2][0], 4);
        assert.strictEqual(gameState.board[3][0], 8);
    });
});
