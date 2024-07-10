class AnimationManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.resetState();
    }

    resetState() {
        this.newBlocks = [];
        this.movedBlocks = new Array(4).fill(0).map(_ => new Array(4));
        this.mergedBlocks = [];
    }

    initNewBlocks() {
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

    addNewBlock(location) {
        this.newBlocks.push(location);
    }

    // TODO: Consolidate logic for updateBlocks and updateBlocksNonMerge
    updateBlocks(oldX, oldY, newX, newY) {
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
            const movedBlockIndex = this.mergedBlocks.findIndex(mergedBlock => mergedBlock.x === oldX && mergedBlock.y === oldY)
            if (movedBlockIndex >= 0) {
                this.mergedBlocks.splice(movedBlockIndex, 1);
            }
        }
        this.mergedBlocks.push({
            x: newX,
            y: newY,
        });
    }

    updateBlocksNonMerge(oldX, oldY, newX, newY) {
        let oldMovedValue = this.movedBlocks[oldY][oldX];
        if (!oldMovedValue) {
            oldMovedValue = {
                x: oldX,
                y: oldY,
            };
        }
        this.movedBlocks[oldY][oldX] = undefined;
        this.movedBlocks[newY][newX] = oldMovedValue;
        const movedBlockIndex = this.mergedBlocks.findIndex(mergedBlock => mergedBlock.x === oldX && mergedBlock.y === oldY)
        if (movedBlockIndex >= 0) {
            this.mergedBlocks.splice(movedBlockIndex, 1);
            this.mergedBlocks.push({
                x: newX,
                y: newY,
            });
        }
    }
}

if (typeof process !== "undefined") {
    module.exports = AnimationManager;
}