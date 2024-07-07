const sinon = require("sinon");
const assert = require("assert");
const {
    saveGame,
    savePreferences,
    loadGame,
    loadPreferences,
    clearGame,
    clearPreferences,
} = require("../src/storage/browser");
const cliStorage = require("../src/storage/cli");
const { STATE_JSON_FILENAME, PREFERENCES_JSON_FILENAME } = cliStorage;
// TODO: Rewrite storage tests to use memfs instead, so that mock-fs can be discarded
// (mock-fs is redundant now that memfs is being used, also junit test results are passing through mock-fs atm when they're being written. Best to remove it out of the equation at this point.)
const mockFs = require("mock-fs");
const fs = require("fs");
const {
    HIGH_SCORE_KEY,
    PREFERENCES_KEY,
} = require("../src/storage");

global.window = {};

class MockStorage {}
MockStorage.prototype.setItem = (keyName, keyValue) => {};
MockStorage.prototype.getItem = (keyName) => {};
MockStorage.prototype.removeItem = (keyName) => {};

const HIGHSCORE = 1000;

describe("game storage - browser", () => {
    let stubbedLocalStorage;

    beforeEach(() => {
        stubbedLocalStorage = window.localStorage = sinon.stub(MockStorage.prototype);
    });
    afterEach(() => {
        sinon.restore();
    });

    it("should save progress", () => {
        sinon.assert.notCalled(stubbedLocalStorage.setItem);
        saveGame(HIGHSCORE);
        sinon.assert.callCount(stubbedLocalStorage.setItem, 1);
        sinon.assert.calledWithMatch(
            stubbedLocalStorage.setItem,
            HIGH_SCORE_KEY,
            HIGHSCORE
        );
    });

    it("should load progress", () => {
        const origFunc = window.localStorage.getItem;
        const getItemStub = (window.localStorage.getItem = sinon.stub());
        getItemStub.withArgs(HIGH_SCORE_KEY).returns(HIGHSCORE);
        try {
            sinon.assert.notCalled(getItemStub);
            const state = loadGame();
            sinon.assert.callCount(getItemStub, 1);
            sinon.assert.calledWithMatch(getItemStub, HIGH_SCORE_KEY);
            assert.strictEqual(state.highscore, HIGHSCORE);
        } finally {
            window.localStorage.getItem = origFunc;
        }
    });

    it("should clear progress", () => {
        sinon.assert.notCalled(stubbedLocalStorage.removeItem);
        clearGame();
        sinon.assert.callCount(stubbedLocalStorage.removeItem, 1);
        sinon.assert.calledWithMatch(stubbedLocalStorage.removeItem, HIGH_SCORE_KEY);
    });

    it("should load default values if no previous state was stored", () => {
        const origFunc = window.localStorage.getItem;
        const getItemStub = (window.localStorage.getItem = sinon.stub());
        getItemStub.withArgs(HIGH_SCORE_KEY).returns(null);
        try {
            sinon.assert.notCalled(getItemStub);
            const state = loadGame();
            sinon.assert.callCount(getItemStub, 1);
            sinon.assert.calledWithMatch(getItemStub, HIGH_SCORE_KEY);
            assert.strictEqual(state.highscore, 0);
        } finally {
            window.localStorage.getItem = origFunc;
        }
    });
});

describe("game storage - CLI", () => {
    beforeEach(() => {
        mockFs({
            [STATE_JSON_FILENAME]: JSON.stringify({}),
        });
    });
    afterEach(() => {
        mockFs.restore();
    });

    it("should save progress", () => {
        const expectedState = {
            [HIGH_SCORE_KEY]: HIGHSCORE,
        };

        cliStorage.saveGame(HIGHSCORE);

        let stateContents = fs.readFileSync(STATE_JSON_FILENAME, {
            encoding: "utf-8",
        });

        assert.deepStrictEqual(JSON.parse(stateContents), expectedState);
    });

    it("should load progress", () => {
        const expectedState = {
            [HIGH_SCORE_KEY]: HIGHSCORE,
        };

        mockFs({
            [STATE_JSON_FILENAME]: JSON.stringify({
                [HIGH_SCORE_KEY]: HIGHSCORE,
            }),
        });

        const state = cliStorage.loadGame();

        assert.deepStrictEqual(state, expectedState);
    });

    it("should clear progress", () => {
        const expectedState = {
            [HIGH_SCORE_KEY]: 0,
        };

        mockFs({
            [STATE_JSON_FILENAME]: JSON.stringify({
                [HIGHSCORE]: HIGHSCORE,
            }),
        });

        let state = cliStorage.loadGame();

        assert.notDeepStrictEqual(state, expectedState);

        cliStorage.clearGame();

        state = cliStorage.loadGame();

        assert.deepStrictEqual(state, expectedState);
    });

    // NOTE: Only one state value atm, commenting out for now
    // it("should not affect other state values if game progress is saved", () => {
    //     mockFs({
    //         [STATE_JSON_FILENAME]: JSON.stringify({
    //             [HIGH_SCORE_KEY]: HIGHSCORE,
    //         }),
    //     });

    //     const expectedState = {
    //         [HIGH_SCORE_KEY]: HIGHSCORE,
    //     };

    //     cliStorage.saveGame(HIGHSCORE);

    //     let stateContents = fs.readFileSync(STATE_JSON_FILENAME, {
    //         encoding: "utf-8",
    //     });

    //     assert.deepStrictEqual(JSON.parse(stateContents), expectedState);
    // });

    it("should load default values if no previous state was stored", () => {
        const expectedState = {
            [HIGH_SCORE_KEY]: 0,
        };

        mockFs();

        let state = cliStorage.loadGame();

        assert.deepStrictEqual(state, expectedState);
    });
});

describe("preferences storage - browser", () => {
    let stubbedLocalStorage;

    beforeEach(() => {
        stubbedLocalStorage = window.localStorage = sinon.stub(MockStorage.prototype);
    });
    afterEach(() => {
        sinon.restore();
    });

    it("can store preferences", () => {
        const preferences = {
            my_setting: "my-value",
        };

        sinon.assert.notCalled(stubbedLocalStorage.setItem);
        savePreferences(preferences);
        sinon.assert.calledOnce(stubbedLocalStorage.setItem);
        sinon.assert.calledWithMatch(
            stubbedLocalStorage.setItem,
            PREFERENCES_KEY,
            JSON.stringify(preferences)
        );
    });

    it("can load preferences", () => {
        const preferences = {
            my_setting: "my-value",
        };

        const origFunc = window.localStorage.getItem;
        const getItemStub = (window.localStorage.getItem = sinon.stub());
        getItemStub.withArgs(PREFERENCES_KEY).returns(JSON.stringify(preferences));
        try {
            sinon.assert.notCalled(getItemStub);
            const loadedPreferences = loadPreferences();
            sinon.assert.calledOnce(getItemStub);
            sinon.assert.calledWithMatch(getItemStub, PREFERENCES_KEY);
            assert.deepStrictEqual(loadedPreferences, preferences);
        } finally {
            window.localStorage.getItem = origFunc;
        }
    });

    it("can clear preferences", () => {
        sinon.assert.notCalled(stubbedLocalStorage.removeItem);
        clearPreferences();
        sinon.assert.calledOnce(stubbedLocalStorage.removeItem);
        sinon.assert.calledWithMatch(stubbedLocalStorage.removeItem, PREFERENCES_KEY);
    });

    it("can handle loading state that is not an object", () => {
        const preferences = '"a string"';
        const expected = {};

        const origFunc = window.localStorage.getItem;
        const getItemStub = (window.localStorage.getItem = sinon.stub());
        getItemStub.withArgs(PREFERENCES_KEY).returns(preferences);
        try {
            sinon.assert.notCalled(getItemStub);
            const loadedPreferences = loadPreferences();
            sinon.assert.calledOnce(getItemStub);
            sinon.assert.calledWithMatch(getItemStub, PREFERENCES_KEY);
            assert.deepStrictEqual(loadedPreferences, expected);
        } finally {
            window.localStorage.getItem = origFunc;
        }
    });

    it("can handle loading invalid state", () => {
        const preferences = "invalid";
        const expected = {};

        const origFunc = window.localStorage.getItem;
        const getItemStub = (window.localStorage.getItem = sinon.stub());
        getItemStub.withArgs(PREFERENCES_KEY).returns(preferences);
        try {
            sinon.assert.notCalled(getItemStub);
            const loadedPreferences = loadPreferences();
            sinon.assert.calledOnce(getItemStub);
            sinon.assert.calledWithMatch(getItemStub, PREFERENCES_KEY);
            assert.deepStrictEqual(loadedPreferences, expected);
        } finally {
            window.localStorage.getItem = origFunc;
        }
    });
});

describe("preferences storage - CLI", () => {
    beforeEach(() => {
        mockFs({
            [PREFERENCES_JSON_FILENAME]: JSON.stringify({}),
        });
    });
    afterEach(() => {
        mockFs.restore();
    });

    it("can store preferences", () => {
        const preferences = {
            "test-key": "test-value",
        };

        cliStorage.savePreferences(preferences);

        const preferencesFileContents = fs.readFileSync(PREFERENCES_JSON_FILENAME, {
            encoding: "utf-8",
        });

        assert.deepStrictEqual(JSON.parse(preferencesFileContents), preferences);
    });

    it("can load preferences", () => {
        const expectedPreferences = {
            "test-key": "test-value",
        };

        mockFs({
            [PREFERENCES_JSON_FILENAME]: JSON.stringify(expectedPreferences),
        });

        preferences = cliStorage.loadPreferences();

        assert.deepStrictEqual(preferences, expectedPreferences);
    });

    it("can clear preferences", () => {
        const expectedPreferences = {
            "test-key": "test-value",
        };

        mockFs({
            [PREFERENCES_JSON_FILENAME]: JSON.stringify(expectedPreferences),
        });

        let preferencesFileContents = fs.readFileSync(PREFERENCES_JSON_FILENAME, {
            encoding: "utf-8",
        });

        assert.deepStrictEqual(JSON.parse(preferencesFileContents), expectedPreferences);

        cliStorage.clearPreferences();

        preferencesFileContents = fs.readFileSync(PREFERENCES_JSON_FILENAME, {
            encoding: "utf-8",
        });

        assert.deepStrictEqual(JSON.parse(preferencesFileContents), {});
    });

    it("can handle loading state that is not an object", () => {
        const expectedPreferences = {};

        mockFs({
            [PREFERENCES_JSON_FILENAME]: '"a string"',
        });

        preferences = cliStorage.loadPreferences();

        assert.deepStrictEqual(preferences, expectedPreferences);
    });

    it("can handle loading invalid state", () => {
        const expectedPreferences = {};

        mockFs({
            [PREFERENCES_JSON_FILENAME]: "invalid state",
        });

        preferences = cliStorage.loadPreferences();

        assert.deepStrictEqual(preferences, expectedPreferences);
    });

    it("can handle preferences file not existing", () => {
        const expectedPreferences = {};

        mockFs({});

        preferences = cliStorage.loadPreferences();

        assert.deepStrictEqual(preferences, expectedPreferences);
    });
});
