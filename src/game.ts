import { ISpawnManager } from "./manager/spawn";
import { IAnimationManager } from "./manager/animation";
import { IUndoManager } from "./manager/undo";
import { IGameStorage } from "./storage";

export type GameBoard = number[][];

export type GameState = {
    board: GameBoard;
    ended: boolean;
    won: boolean;
    score: number;
    didUndo: boolean;
    achievedHighscore: boolean;
    moveCount: number;
};

// Game state to last between games
export type GamePersistentState = {
    highscore: number;
    unlockables: {
        [key: string]: boolean;
    };
    hasPlayedBefore: boolean;
};

export type Position = {
    x: number;
    y: number;
};

let debugEnabled = false;
// @ts-ignore TODO: Resolve this type issue "Property 'env' does not exist on type 'ImportMeta'."
// TODO: Fix "SyntaxError: Cannot use 'import.meta' outside a module" when trying to run in Jest
// Either restrict the usage of import.meta to the browser code only, bring in debugEnabled from there into game.ts
// or, might have to bring in Babel.
// let debugEnabled = import.meta.env.DEV ?? false;

const GAME_IS_OVER_ERROR_ID = "GameIsOver";

export const DIRECTION_LEFT = 1;
export const DIRECTION_RIGHT = 2;
export const DIRECTION_UP = 3;
export const DIRECTION_DOWN = 4;

export type Direction =
    | typeof DIRECTION_LEFT
    | typeof DIRECTION_RIGHT
    | typeof DIRECTION_UP
    | typeof DIRECTION_DOWN;

export const getErrorMessage = (errorID: string) => {
    switch (errorID) {
        // case WORDS_DIFFERENT_LENGTH_ERROR_ID:
        //     if (userInput && userInput.length > 5) {
        //         return "Too many letters";
        //     } else {
        //         return "Not enough letters";
        //     }
        // case NOT_IN_WORD_LIST_ERROR_ID:
        //     return "Not in word list";
        // case USER_INPUT_NOT_PROVIDED_ERROR_ID:
        //     return "Input not provided";
        // case WORD_NOT_PROVIDED_ERROR_ID:
        //     return "Word not provided to check against (this should not happen, post an issue on GitHub)";
        // case USER_RAN_OUT_OF_LIVES_ERROR_ID:
        //     return "User ran out of lives";
        // case GAME_IS_OVER_ERROR_ID:
        //     return "Game is over";
        // case PREV_STATE_NOT_MATCHING_ERROR_ID:
        //     return getHardModeErrorMessage(error.expected);
        default:
            return "Unknown error";
    }
};

export type EventHandler = (eventID: string, data?: any) => void;

let gameState: GameState = {} as GameState;
let persistentState: GamePersistentState = {} as GamePersistentState;
let eventHandler: EventHandler = () => {};
let spawnManager: ISpawnManager;
let animationManager: IAnimationManager;
let undoManager: IUndoManager;
let gameStorage: IGameStorage;

const newState: () => GameState = () => {
    return {
        board: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        ended: false,
        won: false,
        score: 0,
        didUndo: false,
        achievedHighscore: false,
        moveCount: 0,
    };
};

const initState = () => {
    if (gameStorage.gameExists()) {
        gameState = gameStorage.loadGame();

        // TODO: Loading state should first load default state, then overwrite that state with the values from local storage/file,
        // this will prevent having to add checks like this to make sure required properties that were not present in previous versions are initialized in the state.
        if (typeof gameState.moveCount === "undefined") {
            gameState.moveCount = 0;
        }

        spawnManager.setGameState(gameState);
    } else {
        gameState = newState();

        spawnManager.setGameState(gameState);

        let location = spawnManager.determineNextBlockLocation();
        spawnBlock(location.x, location.y, spawnManager.determineNextBlockValue());

        location = spawnManager.determineNextBlockLocation();
        spawnBlock(location.x, location.y, spawnManager.determineNextBlockValue());
    }
    animationManager.setGameState(gameState);
    undoManager.setGameState(gameState);
};

const initPersistentState = () => {
    if (gameStorage.persistentStateExists()) {
        persistentState = gameStorage.loadPersistentState();
    } else {
        persistentState = {
            highscore: 0,
            unlockables: {},
            hasPlayedBefore: false,
        };
    }
};

export const initGame = async (
    _eventHandler: EventHandler,
    _spawnManager: ISpawnManager,
    _animationManager: IAnimationManager,
    _undoManager: IUndoManager,
    _gameStorage: IGameStorage
) => {
    eventHandler = _eventHandler;
    spawnManager = _spawnManager;
    animationManager = _animationManager;
    undoManager = _undoManager;
    gameStorage = _gameStorage;

    initState();
    initPersistentState();

    eventHandler("init", { gameState, persistentState });

    if (debugEnabled) console.log(gameState);

    animationManager.initNewBlocks();

    eventHandler("draw", {
        undoInfo: {
            undoStack: undoManager.getGameStateStack(),
        },
    });

    if (gameState.ended) {
        eventHandler("lose");
    }
};

export const newGame = (debugState?: GameState) => {
    if (debugState) {
        gameState = debugState;
    } else {
        gameState = newState();
    }

    spawnManager.setGameState(gameState);
    animationManager.setGameState(gameState);
    undoManager.setGameState(gameState);

    if (!debugState) {
        let location = spawnManager.determineNextBlockLocation();
        spawnBlock(location.x, location.y, spawnManager.determineNextBlockValue());

        location = spawnManager.determineNextBlockLocation();
        spawnBlock(location.x, location.y, spawnManager.determineNextBlockValue());
    }

    eventHandler("init", { gameState, persistentState });

    if (debugEnabled) console.log(gameState);

    animationManager.initNewBlocks();
    undoManager.clear();

    eventHandler("draw", {
        undoInfo: {
            undoStack: undoManager.getGameStateStack(),
        },
    });

    gameStorage.clearGame();
};

const isBoardSame = (board: GameBoard | null, otherBoard: GameBoard | null) => {
    if (
        !board ||
        !otherBoard ||
        !board.length ||
        !otherBoard.length ||
        board.length !== otherBoard.length
    ) {
        return false;
    }

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] !== otherBoard[i][j]) {
                return false;
            }
        }
    }

    return true;
};

export const undo = () => {
    if (gameState.ended) {
        console.log("Game is over. Cannot undo.");
        return;
    }
    const poppedGameState = undoManager.popGameState();
    if (!poppedGameState) {
        console.log("No more moves to undo");
        return;
    }
    gameState.didUndo = true;
    eventHandler("draw", {
        undoInfo: {
            undoStack: undoManager.getGameStateStack(),
        },
    });
    gameStorage.saveGame(gameState);
};

export const move = (direction: Direction) => {
    let xDir = 0;
    let yDir = 0;
    switch (direction) {
        case DIRECTION_LEFT:
            xDir = -1;
            break;
        case DIRECTION_RIGHT:
            xDir = 1;
            break;
        case DIRECTION_UP:
            yDir = -1;
            break;
        case DIRECTION_DOWN:
            yDir = 1;
            break;
        default:
            console.error("invalid direction");
    }

    let prevBoard: GameBoard | null = [];
    for (let i = 0; i < gameState.board.length; i++) {
        prevBoard.push(gameState.board[i].slice());
    }
    console.log("prev board is now", prevBoard);

    undoManager.pushGameState();
    gameState.moveCount++;

    animationManager.resetState();

    // Tracks whether a block has merged before in the same move, prevents it from merging again in that case
    const mergedStatuses: boolean[][] = new Array(4)
        .fill(0)
        .map((_) => new Array(4).fill(0).map((_) => false));

    // Keep looping through movement until no more moves can be made
    prevBoard = null;
    let numMoves = 0;
    while (!isBoardSame(gameState.board, prevBoard)) {
        prevBoard = [];
        for (let i = 0; i < gameState.board.length; i++) {
            prevBoard.push(gameState.board[i].slice());
        }
        console.log("prev board is now", prevBoard);
        let iStart = 0,
            iEnd = (i: number) => i < gameState.board.length,
            iStep = 1;
        let jStart = 0,
            jEnd = (j: number) => j < gameState.board[0].length,
            jStep = 1;
        if (yDir > 0) {
            iStart = gameState.board.length - 1;
            iEnd = (i) => i >= 0;
            iStep = -1;
        }
        if (xDir > 0) {
            jStart = gameState.board[0].length - 1;
            jEnd = (j) => j >= 0;
            jStep = -1;
        }
        for (let i = iStart; iEnd(i); i += iStep) {
            for (let j = jStart; jEnd(j); j += jStep) {
                const newX = j + xDir;
                const newY = i + yDir;
                if (
                    newX < 0 ||
                    newX >= gameState.board[i].length ||
                    newY < 0 ||
                    newY >= gameState.board.length
                ) {
                    continue;
                }
                // Transfer the value at current spot to the new spot only if new spot is 0
                // Merge the values if value at new spot matches current spot's value
                const currVal = gameState.board[i][j];
                const newVal = gameState.board[newY][newX];
                gameState.board[i][j] = 0;
                // Only merge if the values are nonzero, they match, and they haven't been merged prior
                if (
                    currVal == newVal &&
                    currVal > 0 &&
                    !mergedStatuses[i][j] &&
                    !mergedStatuses[newY][newX]
                ) {
                    const combinedVal = currVal + newVal;
                    gameState.board[newY][newX] = combinedVal;
                    gameState.score += combinedVal;
                    if (gameState.score > persistentState.highscore) {
                        persistentState.highscore = gameState.score;
                        gameState.achievedHighscore = true;
                        gameStorage.savePersistentState(persistentState);
                    }
                    mergedStatuses[newY][newX] = true;
                    // TODO: Generalize the endgame condition check so that other game types besides 2048 (2s) can be added in the future
                    if (combinedVal === 2048 && !gameState.won) {
                        gameState.won = true;
                        persistentState.unlockables.classic = true;
                        const preferences = gameStorage.loadPreferences();
                        if (preferences["theme"] === "classic") {
                            persistentState.unlockables.initialCommit = true;
                        }
                        gameStorage.savePersistentState(persistentState);
                        eventHandler("win", { persistentState });
                    }
                    animationManager.updateBlocks(j, i, newX, newY, combinedVal);
                } else {
                    if (newVal === 0) {
                        gameState.board[newY][newX] = currVal;
                        if (currVal) {
                            animationManager.updateBlocksNonMerge(j, i, newX, newY);
                        }
                        // Transfer the merged status of the block as well
                        mergedStatuses[newY][newX] = mergedStatuses[i][j];
                        mergedStatuses[i][j] = false;
                    } else {
                        gameState.board[i][j] = currVal;
                    }
                    continue;
                }
            }
        }
        console.log("current board is", gameState.board);
        numMoves++;
    }

    if (numMoves > 1) {
        console.log("spawn next block and check game conditions");

        const location = spawnManager.determineNextBlockLocation();
        animationManager.addNewBlock(location);
        spawnBlock(location.x, location.y, spawnManager.determineNextBlockValue());
    }
    eventHandler("draw", {
        undoInfo: {
            undoStack: undoManager.getGameStateStack(),
        },
    });
    let allBlocksFilled = true;
    outerLoop: for (let i = 0; i < gameState.board.length; i++) {
        for (let j = 0; j < gameState.board[i].length; j++) {
            if (gameState.board[i][j] == 0) {
                allBlocksFilled = false;
                break outerLoop;
            }
        }
    }
    if (allBlocksFilled) {
        // Check if any moves can still be made with the blocks that are on the board
        let canMakeMove = false;
        outerLoop: for (let i = 0; i < gameState.board.length; i++) {
            for (let j = 0; j < gameState.board[i].length; j++) {
                if (gameState.board[i][j] != 0) {
                    const val = gameState.board[i][j];
                    if (
                        (i > 0 && val === gameState.board[i - 1][j]) ||
                        (i < gameState.board.length - 1 && val === gameState.board[i + 1][j]) ||
                        (j > 0 && val === gameState.board[i][j - 1]) ||
                        (j < gameState.board[i].length - 1 && val === gameState.board[i][j + 1])
                    ) {
                        canMakeMove = true;
                        break outerLoop;
                    }
                }
            }
        }
        if (!canMakeMove) {
            gameState.ended = true;
            eventHandler("lose");
        }
    }
    gameStorage.saveGame(gameState);
};

export const spawnBlock = (x: number, y: number, number: number) => {
    const board = gameState.board;
    board[y][x] = number;
    console.log("spawned");
};

export const getGameState: () => GameState = () => {
    return gameState;
};
