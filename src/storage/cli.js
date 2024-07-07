const {
    BOARD_KEY,
    SCORE_KEY,
    HIGH_SCORE_KEY,
    WON_KEY,
    ENDED_KEY,
    DID_UNDO_KEY,
} = require("./index");
const fs = require("fs");
const path = require("path");

const STATE_JSON_FILENAME = "state.json";
const PREFERENCES_JSON_FILENAME = "preferences.json";

const saveGame = (highscore) => {
    overwriteState({
        [HIGH_SCORE_KEY]: highscore,
    });
};

const savePreferences = (preferences) => {
    fs.writeFileSync(PREFERENCES_JSON_FILENAME, JSON.stringify(preferences));
};

const gameExists = () => {
    return fs.existsSync(STATE_JSON_FILENAME);
};

const loadGame = () => {
    const stateFilename = path.join(process.cwd(), STATE_JSON_FILENAME);
    if (fs.existsSync(stateFilename)) {
        const jsonStr = fs.readFileSync(stateFilename);
        const json = JSON.parse(jsonStr);
        return {
            [BOARD_KEY]: json[BOARD_KEY] || [[],[],[],[]],
            [SCORE_KEY]: json[SCORE_KEY] || 0,
            [HIGH_SCORE_KEY]: json[HIGH_SCORE_KEY] || 0,
            [WON_KEY]: json[WON_KEY] || false,
            [ENDED_KEY]: json[ENDED_KEY] || false,
            didUndo: json[DID_UNDO_KEY] || false,
        };
    }
    return {
        [BOARD_KEY]: [[],[],[],[]],
        [SCORE_KEY]: 0,
        [HIGH_SCORE_KEY]: 0,
        [WON_KEY]: false,
        [ENDED_KEY]: false,
        didUndo: false,
    };
};

const loadPreferences = () => {
    if (fs.existsSync(PREFERENCES_JSON_FILENAME)) {
        const jsonStr = fs.readFileSync(PREFERENCES_JSON_FILENAME);
        try {
            const json = JSON.parse(jsonStr);
            if (typeof json !== "object") {
                return {};
            }
            return json;
        } catch (e) {
            return {};
        }
    }
    return {};
};

const clearGame = () => {
    fs.writeFileSync(STATE_JSON_FILENAME, "{}");
};

const clearPreferences = () => {
    fs.writeFileSync(PREFERENCES_JSON_FILENAME, "{}");
};

const overwriteState = (newState) => {
    let json;
    if (fs.existsSync(STATE_JSON_FILENAME)) {
        const jsonStr = fs.readFileSync(STATE_JSON_FILENAME);
        json = JSON.parse(jsonStr);
    } else {
        json = {};
    }
    json = Object.assign(json, newState);
    const jsonStr = JSON.stringify(json);
    fs.writeFileSync(STATE_JSON_FILENAME, jsonStr);
};

if (typeof process !== "undefined") {
    module.exports = {
        STATE_JSON_FILENAME,
        PREFERENCES_JSON_FILENAME,
        saveGame,
        savePreferences,
        gameExists,
        loadGame,
        loadPreferences,
        clearGame,
        clearPreferences,
    };
}
