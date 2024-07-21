let gameExists;
let clearGame;
let saveGame;
let loadGame;

// TODO: Find a better way to inject either browser or cli storage depending on where game is played from. May require refactoring.
export const setStorageFuncs = (_gameExists, _clearGame, _saveGame, _loadGame) => {
    gameExists = _gameExists;
    clearGame = _clearGame;
    saveGame = _saveGame;
    loadGame = _loadGame;
};

let debugEnabled = import.meta?.env?.DEV ?? false;

const GAME_IS_OVER_ERROR_ID = "GameIsOver";

export const DIRECTION_LEFT = 1;
export const DIRECTION_RIGHT = 2;
export const DIRECTION_UP = 3;
export const DIRECTION_DOWN = 4;

export const getErrorMessage = (error, userInput) => {
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
let animationManager;

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
    };
};

const loadState = () => {
    return loadGame();
};

const initState = () => {
    if (gameExists()) {
        gameState = loadGame();

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
};

export const initGame = async (_eventHandler, _spawnManager, _animationManager) => {
    eventHandler = _eventHandler;
    spawnManager = _spawnManager;
    animationManager = _animationManager;
    
    initState();

    eventHandler("init", { gameState });

    if (debugEnabled) console.log(gameState);

    animationManager.initNewBlocks();

    // TODO: Should game state be passed into the draw?
    eventHandler("draw", { gameState });
};

export const newGame = () => {
    gameState = newState();

    spawnManager = new SpawnManager(gameState);

    const location = spawnManager.determineNextBlockLocation();
    spawnBlock(location.x, location.y, spawnManager.determineNextBlockValue());

    animationManager = new AnimationManager(gameState);

    eventHandler("init", { gameState });

    if (debugEnabled) console.log(gameState);

    animationManager.initNewBlocks();

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

export const undo = () => {
    if (!boardStack.length) {
        console.log("No more moves to undo");
        return;
    }
    gameState.board = boardStack.pop();
    gameState.didUndo = true;
    eventHandler("draw", { gameState });
};

export const move = (direction) => {
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

    animationManager.resetState();

    // Keep looping through movement until no more moves can be made
    prevBoard = null;
    let numMoves = 0;
    while (!isBoardSame(gameState.board, prevBoard)) {
        prevBoard = [];
        for (let i = 0; i < gameState.board.length; i++) {
            prevBoard.push(gameState.board[i].slice());
        }
        console.log("prev board is now", prevBoard);
        let iStart = 0, iEnd = (i) => i < gameState.board.length, iStep = 1
        let jStart = 0, jEnd = (j) => j < gameState.board[0].length, jStep = 1;
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
                if (currVal == newVal && currVal > 0) {
                    const combinedVal = currVal + newVal;
                    gameState.board[newY][newX] = combinedVal;
                    gameState.score += combinedVal;
                    // TODO: Generalize the endgame condition check so that other game types besides 2048 (2s) can be added in the future
                    if (combinedVal === 2048 && !gameState.won) {
                        gameState.won = true;
                        eventHandler("win");
                    }
                    animationManager.updateBlocks(j, i, newX, newY);
                } else {
                    if (newVal === 0) {
                        gameState.board[newY][newX] = currVal;
                        if (currVal) {
                            animationManager.updateBlocksNonMerge(j, i, newX, newY);
                        }
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

export const spawnBlock = (x, y, number) => {
    const board = gameState.board;
    board[y][x] = number;
    console.log("spawned");
};

export const getGameState = () => {
    return gameState;
};

export const getAnimationManager = () => {
    return animationManager;
};
