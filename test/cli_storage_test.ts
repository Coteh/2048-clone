import {
    CLIGameStorage,
    GAME_STATE_JSON_FILENAME,
    PERSISTENT_STATE_JSON_FILENAME,
    PREFERENCES_JSON_FILENAME,
} from "../src/storage/cli";
import { fs, vol } from "memfs";
import * as assert from "assert";
import * as path from "path";
import { GamePersistentState, GameState } from "../src/game";
import { Preferences } from "../src/preferences";
import { IGameStorage } from "../src/storage";

jest.mock("fs");

describe("CLI storage", () => {
    let gameStorage: IGameStorage;

    beforeEach(() => {
        gameStorage = new CLIGameStorage();
    });

    describe("game state", () => {
        const initialState: GameState = {
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

        beforeEach(() => {
            vol.fromJSON({
                [GAME_STATE_JSON_FILENAME]: JSON.stringify(initialState),
            });
        });

        it("should save progress", () => {
            const expectedState: GameState = {
                ...initialState,
                board: [
                    [2048, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                ],
                ended: false,
                won: true,
                score: 10000,
                didUndo: false,
            };

            let stateContents = fs.readFileSync(
                path.resolve(process.cwd(), GAME_STATE_JSON_FILENAME),
                {
                    encoding: "utf-8",
                }
            );

            // @ts-ignore TODO: fix Buffer to string type error
            assert.deepStrictEqual(JSON.parse(stateContents), initialState);

            gameStorage.saveGame(expectedState);

            stateContents = fs.readFileSync(path.resolve(process.cwd(), GAME_STATE_JSON_FILENAME), {
                encoding: "utf-8",
            });

            // @ts-ignore TODO: fix Buffer to string type error
            assert.deepStrictEqual(JSON.parse(stateContents), expectedState);
        });

        it("should load progress", () => {
            const expectedState: GameState = {
                ...initialState,
                board: [
                    [2048, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                ],
                ended: false,
                won: true,
                score: 10000,
                didUndo: false,
            };

            vol.fromJSON({
                [GAME_STATE_JSON_FILENAME]: JSON.stringify(expectedState),
            });

            const state = gameStorage.loadGame();

            assert.deepStrictEqual(state, expectedState);
        });

        it("should clear progress", () => {
            const expectedPreClearState: GameState = {
                ...initialState,
                board: [
                    [2048, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                ],
                ended: false,
                won: true,
                score: 10000,
                didUndo: false,
            };

            vol.fromJSON({
                [GAME_STATE_JSON_FILENAME]: JSON.stringify(expectedPreClearState),
            });

            let state = gameStorage.loadGame();

            assert.deepStrictEqual(state, expectedPreClearState);

            gameStorage.clearGame();

            state = gameStorage.loadGame();

            assert.deepStrictEqual(state, {});
        });

        it("should load default values if no previous state was stored", () => {
            vol.reset();

            let state = gameStorage.loadGame();

            assert.deepStrictEqual(state, {});
        });
    });

    describe("persistent game state", () => {
        const initialPersistentState: GamePersistentState = {
            highscore: 1000,
            unlockables: {
                classic: true,
            },
        };

        beforeEach(() => {
            vol.fromJSON({
                [PERSISTENT_STATE_JSON_FILENAME]: JSON.stringify(initialPersistentState),
            });
        });

        it("should save persistent game state", () => {
            const expectedState = {
                ...initialPersistentState,
                highscore: 2000,
            };

            let stateContents = fs.readFileSync(
                path.resolve(process.cwd(), PERSISTENT_STATE_JSON_FILENAME),
                {
                    encoding: "utf-8",
                }
            );

            // @ts-ignore TODO: fix Buffer to string type error
            assert.deepStrictEqual(JSON.parse(stateContents), initialPersistentState);

            gameStorage.savePersistentState(expectedState);

            stateContents = fs.readFileSync(
                path.resolve(process.cwd(), PERSISTENT_STATE_JSON_FILENAME),
                {
                    encoding: "utf-8",
                }
            );

            // @ts-ignore TODO: fix Buffer to string type error
            assert.deepStrictEqual(JSON.parse(stateContents), expectedState);
        });

        it("should load persistent game state", () => {
            const expectedState = {
                ...initialPersistentState,
                highscore: 2000,
            };

            vol.fromJSON({
                [PERSISTENT_STATE_JSON_FILENAME]: JSON.stringify(expectedState),
            });

            const state = gameStorage.loadPersistentState();

            assert.deepStrictEqual(state, expectedState);
        });

        it("should clear persistent game state", () => {
            const unexpectedState = {
                ...initialPersistentState,
                highscore: 2000,
            };

            vol.fromJSON({
                [PERSISTENT_STATE_JSON_FILENAME]: JSON.stringify(unexpectedState),
            });

            let state = gameStorage.loadPersistentState();

            assert.deepStrictEqual(state, unexpectedState);

            gameStorage.clearPersistentState();

            state = gameStorage.loadPersistentState();

            assert.deepStrictEqual(state, {});
        });

        it("should load default values if no previous state was stored", () => {
            vol.reset();

            let state = gameStorage.loadGame();

            assert.deepStrictEqual(state, {});
        });
    });

    describe("preferences", () => {
        const preferences: Preferences = {
            something: "value",
        };

        beforeEach(() => {
            vol.fromJSON({
                [PREFERENCES_JSON_FILENAME]: JSON.stringify(preferences),
            });
        });

        it("can store preferences", () => {
            const preferences = {
                "test-key": "test-value",
            };

            gameStorage.savePreferences(preferences);

            const preferencesFileContents = fs.readFileSync(
                path.resolve(process.cwd(), PREFERENCES_JSON_FILENAME),
                {
                    encoding: "utf-8",
                }
            );

            // @ts-ignore TODO: fix Buffer to string type error
            assert.deepStrictEqual(JSON.parse(preferencesFileContents), preferences);
        });

        it("can load preferences", () => {
            const expectedPreferences = {
                "test-key": "test-value",
            };

            vol.fromJSON({
                [PREFERENCES_JSON_FILENAME]: JSON.stringify(expectedPreferences),
            });

            const preferences = gameStorage.loadPreferences();

            assert.deepStrictEqual(preferences, expectedPreferences);
        });

        it("can clear preferences", () => {
            const expectedPreferences = {
                "test-key": "test-value",
            };

            vol.fromJSON({
                [PREFERENCES_JSON_FILENAME]: JSON.stringify(expectedPreferences),
            });

            let preferencesFileContents = fs.readFileSync(
                path.resolve(process.cwd(), PREFERENCES_JSON_FILENAME),
                {
                    encoding: "utf-8",
                }
            );

            // @ts-ignore TODO: fix Buffer to string type error
            assert.deepStrictEqual(JSON.parse(preferencesFileContents), expectedPreferences);

            gameStorage.clearPreferences();

            preferencesFileContents = fs.readFileSync(
                path.resolve(process.cwd(), PREFERENCES_JSON_FILENAME),
                {
                    encoding: "utf-8",
                }
            );

            // @ts-ignore TODO: fix Buffer to string type error
            assert.deepStrictEqual(JSON.parse(preferencesFileContents), {});
        });

        it("can handle loading state that is not an object", () => {
            const expectedPreferences = {};

            vol.fromJSON({
                [PREFERENCES_JSON_FILENAME]: '"a string"',
            });

            const preferences = gameStorage.loadPreferences();

            assert.deepStrictEqual(preferences, expectedPreferences);
        });

        it("can handle loading invalid state", () => {
            const expectedPreferences = {};

            vol.fromJSON({
                [PREFERENCES_JSON_FILENAME]: "invalid state",
            });

            const preferences = gameStorage.loadPreferences();

            assert.deepStrictEqual(preferences, expectedPreferences);
        });

        it("can handle preferences file not existing", () => {
            const expectedPreferences = {};

            vol.reset();

            const preferences = gameStorage.loadPreferences();

            assert.deepStrictEqual(preferences, expectedPreferences);
        });
    });
});
