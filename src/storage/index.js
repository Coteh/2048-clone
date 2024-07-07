const BOARD_KEY = "board";
const SCORE_KEY = "score";
const HIGH_SCORE_KEY = "highscore";
const WON_KEY = "won";
const ENDED_KEY = "ended";
const DID_UNDO_KEY = "did_undo";
const PREFERENCES_KEY = "preferences";

if (typeof process !== "undefined") {
    module.exports = {
        BOARD_KEY,
        SCORE_KEY,
        HIGH_SCORE_KEY,
        WON_KEY,
        ENDED_KEY,
        DID_UNDO_KEY,
        PREFERENCES_KEY,
    };
}
