import { savePreferences, loadPreferences, clearPreferences } from "./storage/browser";

let preferences = {};

export const initPreferences = () => {
    preferences = loadPreferences();
};

export const getPreferenceValue = (key) => {
    return preferences[key];
};

export const savePreferenceValue = (key, value) => {
    preferences[key] = value;
    savePreferences(preferences);
};

export const resetPreferences = () => {
    clearPreferences();
};
