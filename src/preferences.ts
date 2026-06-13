import { IGameStorage } from "./storage";

export class Preferences {
    [key: string]: unknown;
}

let preferences: Preferences = {};
let gameStorage: IGameStorage;

export const initPreferences = (_gameStorage: IGameStorage, initialPreferences: Preferences) => {
    gameStorage = _gameStorage;
    preferences = gameStorage.loadPreferences();
    if (!gameStorage.preferencesExists()) {
        preferences = Object.assign(preferences, initialPreferences);
        gameStorage.savePreferences(preferences);
    }
};

export const getPreferenceValue = <T = unknown>(key: string): T => {
    return preferences[key] as T;
};

export const savePreferenceValue = (key: string, value: unknown) => {
    preferences[key] = value;
    gameStorage.savePreferences(preferences);
};

export const resetPreferences = () => {
    gameStorage.clearPreferences();
};
