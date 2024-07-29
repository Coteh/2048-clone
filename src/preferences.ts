import { IGameStorage } from "./storage";

export class Preferences {
    [key: string]: any;
}

let preferences: Preferences = {};
let gameStorage: IGameStorage;

export const initPreferences = (_gameStorage: IGameStorage) => {
    gameStorage = _gameStorage;
    preferences = gameStorage.loadPreferences();
};

export const getPreferenceValue = (key: string) => {
    return preferences[key];
};

export const savePreferenceValue = (key: string, value: any) => {
    preferences[key] = value;
    gameStorage.savePreferences(preferences);
};

export const resetPreferences = () => {
    gameStorage.clearPreferences();
};
