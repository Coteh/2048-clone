import jest from "jest-mock";

export class MockAnimationManager {
    constructor() {
        this.isAnimationEnabled = false;
        this.setGameState = jest.fn();
        this.resetState = jest.fn();
        this.initNewBlocks = jest.fn();
        this.addNewBlock = jest.fn();
        this.updateBlocks = jest.fn();
        this.updateBlocksNonMerge = jest.fn();
    }
}
