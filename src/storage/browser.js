if (typeof process !== "undefined") {
    const storage = require("./index");
    HIGH_SCORE_KEY = storage.HIGH_SCORE_KEY;
    PREFERENCES_KEY = storage.PREFERENCES_KEY;
}

const saveGame = (highscore) => {
    window.localStorage.setItem(storage.HIGH_SCORE_KEY, highscore);
};

const savePreferences = (preferences) => {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
};

const gameExists = () => {
    return window.localStorage.getItem(HIGH_SCORE_KEY) != null;
};

const loadGame = () => {
    let highscore = parseInt(window.localStorage.getItem(HIGH_SCORE_KEY));
    if (highscore == null || isNaN(highscore)) {
        highscore = 0;
    }
    return {
        highscore,
    };
};

const loadPreferences = () => {
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

const clearGame = () => {
    window.localStorage.removeItem(HIGH_SCORE_KEY);
};

const clearPreferences = () => {
    window.localStorage.removeItem(PREFERENCES_KEY);
};

if (typeof process !== "undefined") {
    module.exports = {
        saveGame,
        savePreferences,
        loadGame,
        loadPreferences,
        clearGame,
        clearPreferences,
    };
}
