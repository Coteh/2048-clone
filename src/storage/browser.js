import { HIGH_SCORE_KEY, PREFERENCES_KEY } from "./index";

export const saveGame = (highscore) => {
    window.localStorage.setItem(HIGH_SCORE_KEY, highscore);
};

export const savePreferences = (preferences) => {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
};

export const gameExists = () => {
    return window.localStorage.getItem(HIGH_SCORE_KEY) != null;
};

export const loadGame = () => {
    let highscore = parseInt(window.localStorage.getItem(HIGH_SCORE_KEY));
    if (highscore == null || isNaN(highscore)) {
        highscore = 0;
    }
    return {
        highscore,
    };
};

export const loadPreferences = () => {
    try {
        const preferences = JSON.parse(window.localStorage.getItem(PREFERENCES_KEY));
        if (!preferences || typeof preferences !== "object") {
            return {};
        }
        return preferences;
    } catch {
        const fallback = {};
        savePreferences(fallback);
        return fallback;
    }
};

export const clearGame = () => {
    window.localStorage.removeItem(HIGH_SCORE_KEY);
};

export const clearPreferences = () => {
    window.localStorage.removeItem(PREFERENCES_KEY);
};
