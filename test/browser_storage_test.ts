import * as sinon from "sinon";
import * as assert from "assert";
import {
    BrowserGameStorage,
    GAME_STATE_KEY,
    PERSISTENT_STATE_KEY,
    PREFERENCES_KEY,
} from "../src/storage/browser";

import { GamePersistentState, GameState } from "../src/game";
import { IGameStorage } from "../src/storage";

global.window = {} as Window & typeof globalThis;

class MockStorage {
    setItem: (key: string, value: any) => void = (_keyName, _keyValue) => {};
    getItem: (key: string) => string = (_keyName) => "";
    removeItem: (key: string) => void = (_keyName) => {};
    clear: () => void = () => {};
    key: (index: number) => string | null = (_index) => null;
    readonly length: number = 0;
}
MockStorage.prototype.setItem = (_keyName, _keyValue) => {};
MockStorage.prototype.getItem = (_keyName) => "";
MockStorage.prototype.removeItem = (_keyName) => {};
MockStorage.prototype.clear = () => {};
MockStorage.prototype.key = (_index) => null;

describe("browser storage", () => {
    let gameStorage: IGameStorage;
    let stubbedLocalStorage: sinon.SinonStubbedInstance<MockStorage>;

    beforeEach(() => {
        gameStorage = new BrowserGameStorage();
        stubbedLocalStorage = window.localStorage = sinon.stub(MockStorage.prototype);
    });
    afterEach(() => {
        sinon.restore();
    });

    describe("game state", () => {
        it("should save progress", () => {
            sinon.assert.notCalled(stubbedLocalStorage.setItem);
            const initialGameState: GameState = {
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
            gameStorage.saveGame(initialGameState);
            sinon.assert.callCount(stubbedLocalStorage.setItem, 1);
            sinon.assert.calledWithMatch(
                stubbedLocalStorage.setItem,
                GAME_STATE_KEY,
                JSON.stringify(initialGameState)
            );
        });

        it("should load progress", () => {
            const origFunc = window.localStorage.getItem;
            const getItemStub = (window.localStorage.getItem = sinon.stub());
            const expectedState = {
                board: [
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [4, 0, 0, 0],
                ],
                ended: false,
                won: false,
                score: 4,
                didUndo: false,
            };
            getItemStub.withArgs(GAME_STATE_KEY).returns(JSON.stringify(expectedState));
            try {
                sinon.assert.notCalled(getItemStub);
                const state = gameStorage.loadGame();
                sinon.assert.callCount(getItemStub, 1);
                sinon.assert.calledWithMatch(getItemStub, GAME_STATE_KEY);
                assert.deepStrictEqual(state, expectedState);
            } finally {
                window.localStorage.getItem = origFunc;
            }
        });

        it("should clear progress", () => {
            sinon.assert.notCalled(stubbedLocalStorage.removeItem);
            gameStorage.clearGame();
            sinon.assert.callCount(stubbedLocalStorage.removeItem, 1);
            sinon.assert.calledWithMatch(stubbedLocalStorage.removeItem, GAME_STATE_KEY);
        });

        it("should load default values if no previous state was stored", () => {
            const origFunc = window.localStorage.getItem;
            const getItemStub = (window.localStorage.getItem = sinon.stub());
            getItemStub.withArgs(GAME_STATE_KEY).returns(null);
            try {
                sinon.assert.notCalled(getItemStub);
                const state = gameStorage.loadGame();
                sinon.assert.callCount(getItemStub, 1);
                sinon.assert.calledWithMatch(getItemStub, GAME_STATE_KEY);
                assert.deepStrictEqual(state, {});
            } finally {
                window.localStorage.getItem = origFunc;
            }
        });
    });

    describe("persistent game state", () => {
        it("should save persistent state", () => {
            sinon.assert.notCalled(stubbedLocalStorage.setItem);
            const initialPersistentState: GamePersistentState = {
                highscore: 100,
                unlockables: {
                    classic: true,
                },
                hasPlayedBefore: false,
            };
            gameStorage.savePersistentState(initialPersistentState);
            sinon.assert.callCount(stubbedLocalStorage.setItem, 1);
            sinon.assert.calledWithMatch(
                stubbedLocalStorage.setItem,
                PERSISTENT_STATE_KEY,
                JSON.stringify(initialPersistentState)
            );
        });

        it("should load persistent state", () => {
            const origFunc = window.localStorage.getItem;
            const getItemStub = (window.localStorage.getItem = sinon.stub());
            const expectedPersistentState: GamePersistentState = {
                highscore: 100,
                unlockables: {
                    classic: true,
                },
                hasPlayedBefore: false,
            };
            getItemStub
                .withArgs(PERSISTENT_STATE_KEY)
                .returns(JSON.stringify(expectedPersistentState));
            try {
                sinon.assert.notCalled(getItemStub);
                const state = gameStorage.loadPersistentState();
                sinon.assert.callCount(getItemStub, 1);
                sinon.assert.calledWithMatch(getItemStub, PERSISTENT_STATE_KEY);
                assert.deepStrictEqual(state, expectedPersistentState);
            } finally {
                window.localStorage.getItem = origFunc;
            }
        });

        it("should clear persistent state", () => {
            sinon.assert.notCalled(stubbedLocalStorage.removeItem);
            gameStorage.clearPersistentState();
            sinon.assert.callCount(stubbedLocalStorage.removeItem, 1);
            sinon.assert.calledWithMatch(stubbedLocalStorage.removeItem, PERSISTENT_STATE_KEY);
        });

        it("should load default values if no previous state was stored", () => {
            const origFunc = window.localStorage.getItem;
            const getItemStub = (window.localStorage.getItem = sinon.stub());
            getItemStub.withArgs(PERSISTENT_STATE_KEY).returns(null);
            try {
                sinon.assert.notCalled(getItemStub);
                const state = gameStorage.loadPersistentState();
                sinon.assert.callCount(getItemStub, 1);
                sinon.assert.calledWithMatch(getItemStub, PERSISTENT_STATE_KEY);
                assert.deepStrictEqual(state, {});
            } finally {
                window.localStorage.getItem = origFunc;
            }
        });
    });

    describe("preferences", () => {
        it("can store preferences", () => {
            const preferences = {
                my_setting: "my-value",
            };

            sinon.assert.notCalled(stubbedLocalStorage.setItem);
            gameStorage.savePreferences(preferences);
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
                const loadedPreferences = gameStorage.loadPreferences();
                sinon.assert.calledOnce(getItemStub);
                sinon.assert.calledWithMatch(getItemStub, PREFERENCES_KEY);
                assert.deepStrictEqual(loadedPreferences, preferences);
            } finally {
                window.localStorage.getItem = origFunc;
            }
        });

        it("can clear preferences", () => {
            sinon.assert.notCalled(stubbedLocalStorage.removeItem);
            gameStorage.clearPreferences();
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
                const loadedPreferences = gameStorage.loadPreferences();
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
                const loadedPreferences = gameStorage.loadPreferences();
                sinon.assert.calledOnce(getItemStub);
                sinon.assert.calledWithMatch(getItemStub, PREFERENCES_KEY);
                assert.deepStrictEqual(loadedPreferences, expected);
            } finally {
                window.localStorage.getItem = origFunc;
            }
        });
    });
});
