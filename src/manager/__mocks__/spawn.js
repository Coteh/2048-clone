const mockDetermineNextBlockLocation = jest.fn(() => {
    return {
        x: 0,
        y: 0,
    };
});

const mockDetermineNextBlockValue = jest.fn(() => 2);

class MockSpawnManager {
    constructor(gameState) {
        this.determineNextBlockLocation = mockDetermineNextBlockLocation;
        this.determineNextBlockValue = mockDetermineNextBlockValue;
    }
}

module.exports = MockSpawnManager;
module.exports.mockDetermineNextBlockLocation = mockDetermineNextBlockLocation;
module.exports.mockDetermineNextBlockValue = mockDetermineNextBlockValue;
