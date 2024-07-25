import { savePreferences, loadPreferences, clearPreferences } from "./storage/browser";

export class Preferences {
    [key: string]: any;
}

let preferences: Preferences = {};

export const initPreferences = () => {
    preferences = loadPreferences();
};

export const getPreferenceValue = (key: string) => {
    return preferences[key];
};

export const savePreferenceValue = (key: string, value: any) => {
    preferences[key] = value;
    savePreferences(preferences);
};

export const resetPreferences = () => {
    clearPreferences();
};
