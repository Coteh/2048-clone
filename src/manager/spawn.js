export class SpawnManager {
    constructor() {

    }

    setGameState(gameState) {
        this.gameState = gameState;
    }

    determineNextBlockLocation() {
        let newX, newY, blockValue = -1;

        while (blockValue !== 0) {
            newX = Math.floor(Math.random() * 4);
            newY = Math.floor(Math.random() * 4);
            console.log("new xy", newX, newY);
            blockValue = this.gameState.board[newY][newX];
            console.log("block value", blockValue)
        }

        return {
            x: newX,
            y: newY,
        };
    }
    
    determineNextBlockValue() {
        return Math.round(Math.random()) == 0 ? 2 : 4;
    }
}
