let fs;
let debugEnabled;
if (typeof process !== "undefined") {
    fs = require("fs");

    const storage = require("./storage/cli");
    gameExists = storage.gameExists;
    clearGame = storage.clearGame;
    saveGame = storage.saveGame;
    loadGame = storage.loadGame;

    SpawnManager = require("./manager/spawn");

    debugEnabled = process.env.DEBUG === "true";
}

const GAME_IS_OVER_ERROR_ID = "GameIsOver";

const DIRECTION_LEFT = 1;
const DIRECTION_RIGHT = 2;
const DIRECTION_UP = 3;
const DIRECTION_DOWN = 4;

const getErrorMessage = (error, userInput) => {
    switch (error.error) {
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

let gameState = {};
let eventHandler = () => {};
let boardStack = [];
let spawnManager;

const newState = () => {
    boardStack = [];
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
        newBlocks: [],
        movedBlocks: new Array(4).fill(0).map(_ => new Array(4)),
        mergedBlocks: [],
    };
};

const loadState = () => {
    return loadGame();
};

const initState = () => {
    if (gameExists()) {
        gameState = loadGame();

        spawnManager = new SpawnManager(gameState);
    } else {
        gameState = newState();

        spawnManager = new SpawnManager(gameState);

        let location = spawnManager.determineNextBlockLocation();
        spawnBlock(location.x, location.y, spawnManager.determineNextBlockValue());
        
        location = spawnManager.determineNextBlockLocation();
        spawnBlock(location.x, location.y, spawnManager.determineNextBlockValue());
    }
};

const initGame = async (_eventHandler) => {
    initState();

    eventHandler = _eventHandler;

    eventHandler("init", { gameState });

    if (debugEnabled) console.log(gameState);

    // START - for animations
    gameState.newBlocks = [];
    for (let i = 0; i < gameState.board.length; i++) {
        for (let j = 0; j < gameState.board[i].length; j++) {
            if (gameState.board[i][j]) {
                gameState.newBlocks.push({
                    x: j,
                    y: i,
                });
            }
        }
    }
    // END - for animations

    // TODO: Should game state be passed into the draw?
    eventHandler("draw", { gameState });
};

const newGame = () => {
    gameState = newState();

    spawnManager = new SpawnManager(gameState);

    const location = spawnManager.determineNextBlockLocation();
    spawnBlock(location.x, location.y, spawnManager.determineNextBlockValue());

    eventHandler("init", { gameState });

    if (debugEnabled) console.log(gameState);

    // START - for animations
    gameState.newBlocks = [];
    for (let i = 0; i < gameState.board.length; i++) {
        for (let j = 0; j < gameState.board[i].length; j++) {
            if (gameState.board[i][j]) {
                gameState.newBlocks.push({
                    x: j,
                    y: i,
                });
            }
        }
    }
    // END - for animations

    // TODO: Should game state be passed into the draw?
    eventHandler("draw", { gameState });
};

const isBoardSame = (board1, board2) => {
    if (!board1 || !board2 || !board1.length || !board2.length || board1.length !== board2.length) {
        return false;
    }

    for (let i = 0; i < board1.length; i++) {
        for (let j = 0; j < board1[i].length; j++) {
            if (board1[i][j] !== board2[i][j]) {
                return false;
            }
        }
    }

    return true;
};

const undo = () => {
    if (!boardStack.length) {
        console.log("No more moves to undo");
        return;
    }
    gameState.board = boardStack.pop();
    gameState.didUndo = true;
    eventHandler("draw", { gameState });
};

const move = (direction) => {
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
    
    let prevBoard = [];
    for (let i = 0; i < gameState.board.length; i++) {
        prevBoard.push(gameState.board[i].slice());
    }
    console.log("prev board is now", prevBoard);
    boardStack.push(prevBoard);

    // These are for animation purposes
    gameState.movedBlocks = new Array(4).fill(0).map(_ => new Array(4));
    gameState.mergedBlocks = [];

    // Keep looping through movement until no more moves can be made
    prevBoard = null;
    numMoves = 0;
    while (!isBoardSame(gameState.board, prevBoard)) {
        prevBoard = [];
        for (let i = 0; i < gameState.board.length; i++) {
            prevBoard.push(gameState.board[i].slice());
        }
        console.log("prev board is now", prevBoard);
        for (let i = gameState.board.length - 1; i >= 0; i--) {
            for (let j = gameState.board[i].length - 1; j >= 0; j--) {
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
                if (currVal == newVal && currVal > 0) {
                    const combinedVal = currVal + newVal;
                    gameState.board[newY][newX] = combinedVal;
                    gameState.score += combinedVal;
                    // TODO: Generalize the endgame condition check so that other game types besides 2048 (2s) can be added in the future
                    if (combinedVal === 2048 && !gameState.won) {
                        gameState.won = true;
                        eventHandler("win");
                    }
                    // START animation stuff
                    if (!gameState.movedBlocks[newY][newX]) {
                        let oldMovedValue = gameState.movedBlocks[i][j];
                        if (!oldMovedValue) {
                            oldMovedValue = {
                                x: j,
                                y: i,
                            };
                        }
                        gameState.movedBlocks[i][j] = undefined;
                        gameState.movedBlocks[newY][newX] = oldMovedValue;
                        const movedBlockIndex = gameState.mergedBlocks.findIndex(mergedBlock => mergedBlock.x === j && mergedBlock.y === i)
                        if (movedBlockIndex >= 0) {
                            gameState.mergedBlocks.splice(movedBlockIndex, 1);
                        }
                    }
                    gameState.mergedBlocks.push({
                        x: newX,
                        y: newY,
                    });
                    // END animation stuff
                } else {
                    if (newVal === 0) {
                        gameState.board[newY][newX] = currVal;
                        // START animation stuff
                        if (currVal) {
                            let oldMovedValue = gameState.movedBlocks[i][j];
                            if (!oldMovedValue) {
                                oldMovedValue = {
                                    x: j,
                                    y: i,
                                };
                            }
                            gameState.movedBlocks[i][j] = undefined;
                            gameState.movedBlocks[newY][newX] = oldMovedValue;
                            const movedBlockIndex = gameState.mergedBlocks.findIndex(mergedBlock => mergedBlock.x === j && mergedBlock.y === i)
                            if (movedBlockIndex >= 0) {
                                gameState.mergedBlocks.splice(movedBlockIndex, 1);
                                gameState.mergedBlocks.push({
                                    x: newX,
                                    y: newY,
                                });
                            }
                        }
                        // END animation stuff
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

    console.log("moved blocks", gameState.movedBlocks);

    gameState.newBlocks = [];
    if (numMoves > 1) {
        console.log("spawn next block and check game conditions");
        
        const location = spawnManager.determineNextBlockLocation();
        gameState.newBlocks.push(location);
        spawnBlock(location.x, location.y, spawnManager.determineNextBlockValue());
    }
    eventHandler("draw", { gameState });
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
outerLoop:
        for (let i = 0; i < gameState.board.length; i++) {
            for (let j = 0; j < gameState.board[i].length; j++) {
                if (gameState.board[i][j] != 0) {
                    const val = gameState.board[i][j];
                    if (i > 0 && val === gameState.board[i - 1][j]
                        || i < gameState.board.length - 1 && val === gameState.board[i + 1][j]
                        || j > 0 && val === gameState.board[i][j - 1]
                        || j < gameState.board[i].length - 1 && val === gameState.board[i][j + 1]
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
};

const spawnBlock = (x, y, number) => {
    const board = gameState.board;
    board[y][x] = number;
    console.log("spawned");
};

if (typeof process !== "undefined") {
    const getGameState = () => {
        return gameState;
    };

    module.exports = {
        initGame,
        getGameState,
        newGame,
        undo,
        move,
        getErrorMessage,
        spawnBlock,
        DIRECTION_LEFT,
        DIRECTION_RIGHT,
        DIRECTION_UP,
        DIRECTION_DOWN,
    };
}
