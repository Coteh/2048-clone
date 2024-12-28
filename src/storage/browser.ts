import { IGameStorage } from ".";
import { GamePersistentState, GameState } from "../game";
import { Preferences } from "../preferences";

export const GAME_STATE_KEY = "game-state";
export const PERSISTENT_STATE_KEY = "persistent-state";
export const PREFERENCES_KEY = "preferences";

export class BrowserGameStorage implements IGameStorage {
    saveGame = (gameState: GameState) => {
        this.saveState(GAME_STATE_KEY, gameState);
    };

    savePersistentState = (persistentState: GamePersistentState) => {
        this.saveState(PERSISTENT_STATE_KEY, persistentState);
    };

    savePreferences = (preferences: Preferences) => {
        this.saveState(PREFERENCES_KEY, preferences);
    };

    gameExists = () => {
        return this.stateExists(GAME_STATE_KEY);
    };

    persistentStateExists = () => {
        return this.stateExists(PERSISTENT_STATE_KEY);
    };

    preferencesExists = () => {
        return this.stateExists(PREFERENCES_KEY);
    };

    loadGame: () => GameState = () => {
        return this.loadState(GAME_STATE_KEY);
    };

    loadPersistentState: () => GamePersistentState = () => {
        return this.loadState(PERSISTENT_STATE_KEY);
    };

    loadPreferences: () => Preferences = () => {
        return this.loadState(PREFERENCES_KEY);
    };

    clearGame = () => {
        this.clearState(GAME_STATE_KEY);
    };

    clearPersistentState = () => {
        this.clearState(PERSISTENT_STATE_KEY);
    };

    clearPreferences = () => {
        this.clearState(PREFERENCES_KEY);
    };

    stateExists = (key: string) => {
        return window.localStorage.getItem(key) != null;
    };

    saveState = <T>(key: string, obj: T) => {
        window.localStorage.setItem(key, JSON.stringify(obj));
    };

    loadState: <T>(key: string) => T = (key) => {
        try {
            const state = JSON.parse(window.localStorage.getItem(key)!);
            if (!state || typeof state !== "object") {
                return {};
            }
            return state;
        } catch (e) {
            console.error(`Could not load state for key '${key}', ${e}`);
            return {};
        }
    };

    clearState = (key: string) => {
        window.localStorage.removeItem(key);
    };
}
