import {
    initGame,
    newGame,
    move,
    undo,
    DIRECTION_DOWN,
    DIRECTION_LEFT,
    DIRECTION_RIGHT,
    DIRECTION_UP,
    setStorageFuncs,
} from "./game";
import { getPreferenceValue, initPreferences, savePreferenceValue } from "./preferences";
import {
    createDialogContentFromTemplate,
    renderBackRow,
    renderBoard,
    renderDialog,
} from "./render";
import feather from "feather-icons";
import { clearGame, gameExists, loadGame, saveGame } from "./storage/browser";
import { AnimationManager } from "./manager/animation";
import { SpawnManager } from "./manager/spawn";
import MobileDetect from "mobile-detect";

const LIGHT_MODE = "light";
const DARK_MODE = "dark";
const SNOW_THEME = "snow";
const CLASSIC_THEME = "classic";

const THEME_PREFERENCE_NAME = "theme";
const ANIMATIONS_PREFERENCE_NAME = "animations";

const THEME_SETTING_NAME = "theme-switch";
const ANIMATIONS_SETTING_NAME = "animations";

const SETTING_ENABLED = "enabled";
const SETTING_DISABLED = "disabled";

const LANDSCAPE_CLASS_NAME = "landscape";

let isAnimationEnabled = false;

setStorageFuncs(gameExists, clearGame, saveGame, loadGame);

document.addEventListener("DOMContentLoaded", async () => {
    const middleElem = document.querySelector("#middle") as HTMLElement;
    const bottomElem = document.querySelector("#bottom") as HTMLElement;

    let gameState;
    let gameLoaded = false;
    let spawnManager = new SpawnManager();
    let animationManager = new AnimationManager();

    const eventHandler = (event, data) => {
        switch (event) {
            case "init":
                gameState = data.gameState;
                animationManager.isAnimationEnabled = isAnimationEnabled;
                break;
            case "draw":
                gameState = data.gameState;
                renderBoard(middleElem, gameState, animationManager);
                (document.querySelector("#score") as HTMLElement).innerText =
                    gameState.score.toString();
                break;
            case "error":
                break;
            case "lose":
                renderDialog(createDialogContentFromTemplate("#lose-dialog-content"), true);
                (document.querySelector(".button.new-game") as HTMLElement).addEventListener(
                    "click",
                    (e) => {
                        e.preventDefault();
                        newGame();
                        const overlayBackElem = document.querySelector(
                            ".overlay-back"
                        ) as HTMLElement;
                        const dialog = document.querySelector(".dialog") as HTMLElement;
                        closeDialog(dialog, overlayBackElem);
                    }
                );
                break;
            case "win":
                renderDialog(createDialogContentFromTemplate("#win-dialog-content"), true);
                break;
        }
    };

    const closeDialog = (dialog: HTMLElement, overlayBackElem: HTMLElement) => {
        if (dialog) {
            // Check if dialog is closable first before closing (close button would be visible, if so)
            const closeBtn = dialog.querySelector("button.close") as HTMLElement;
            if (closeBtn.style.display === "none") {
                return;
            }
            dialog.remove();
        }
        // NTS: Perhaps it'd make more sense if overlay backdrop only disappeared when a valid dialog is passed,
        // but if an invalid dialog is being passed, it might not be on the screen either.
        // In this case, it may be better to leave this as-is and always have the backdrop close so that players can still play.
        overlayBackElem.style.display = "none";
    };

    const handleKeyInput = (key) => {
        const dialog = document.querySelector(".dialog") as HTMLElement;
        if (dialog && (key === "enter" || key === "escape")) {
            return closeDialog(dialog, overlayBackElem);
        }
        if (dialog || gameState.ended) {
            return;
        }
        console.log(key);
        switch (key) {
            case "arrowleft":
                console.log("going left");
                move(DIRECTION_LEFT);
                break;
            case "arrowright":
                console.log("going right");
                move(DIRECTION_RIGHT);
                break;
            case "arrowdown":
                console.log("going down");
                move(DIRECTION_DOWN);
                break;
            case "arrowup":
                console.log("going up");
                move(DIRECTION_UP);
                break;
        }
    };

    window.addEventListener("keydown", (e) => {
        handleKeyInput(e.key.toLowerCase());
    });

    const helpLink = document.querySelector(".help-link") as HTMLElement;
    helpLink.addEventListener("click", (e) => {
        e.preventDefault();
        renderDialog(createDialogContentFromTemplate("#how-to-play"), true);
        helpLink.blur();
    });

    const gamePane = document.querySelector(".game") as HTMLElement;
    const settingsPane = document.querySelector(".settings") as HTMLElement;
    const settingsLink = document.querySelector(".settings-link") as HTMLElement;
    const swipeArea = document.getElementById("swipeArea") as HTMLElement;

    const toggleSettings = () => {
        settingsLink.blur();
        if (settingsPane.style.display === "none") {
            gamePane.style.display = "none";
            settingsPane.style.display = "flex";
            swipeArea.style.display = "none";
        } else {
            gamePane.style.display = "flex";
            settingsPane.style.display = "none";
            swipeArea.style.display = "flex";
        }
    };

    settingsLink.addEventListener("click", (e) => {
        e.preventDefault();
        toggleSettings();
    });

    const settingsClose = settingsPane.querySelector(".close") as HTMLElement;
    settingsClose.addEventListener("click", (e) => {
        e.preventDefault();
        toggleSettings();
    });

    const overlayBackElem = document.querySelector(".overlay-back") as HTMLElement;
    overlayBackElem.addEventListener("click", (e) => {
        const dialog = document.querySelector(".dialog") as HTMLElement;
        closeDialog(dialog, overlayBackElem);
    });

    let snowEmbed = document.getElementById("embedim--snow");
    if (snowEmbed) snowEmbed.style.display = "none";

    let selectedTheme = LIGHT_MODE;

    const selectableThemes = [DARK_MODE, LIGHT_MODE, SNOW_THEME, CLASSIC_THEME];

    const switchTheme = (theme) => {
        if (!theme || !selectableThemes.includes(theme)) {
            theme = "dark";
        }
        document.body.classList.remove(selectedTheme);
        if (theme !== "dark") {
            document.body.classList.add(theme);
        }
        let themeColor = "#000";
        if (snowEmbed) snowEmbed.style.display = "none";
        switch (theme) {
            case LIGHT_MODE:
                themeColor = "#FFF";
                break;
            case SNOW_THEME:
                themeColor = "#020024";
                if (snowEmbed) snowEmbed.style.display = "initial";
                break;
        }
        (document.querySelector("meta[name='theme-color']") as HTMLMetaElement).content =
            themeColor;
        selectedTheme = theme;
    };

    const settings = document.querySelectorAll(".setting");
    settings.forEach((setting) => {
        setting.addEventListener("click", (e) => {
            const elem = e.target as HTMLElement;
            const toggle = setting.querySelector(".toggle") as HTMLElement;
            let enabled = false;
            if (elem.classList.contains(THEME_SETTING_NAME)) {
                const themeIndex = selectableThemes.indexOf(selectedTheme);
                const nextTheme = selectableThemes[(themeIndex + 1) % selectableThemes.length];
                switchTheme(nextTheme);
                savePreferenceValue(THEME_PREFERENCE_NAME, nextTheme);
                toggle.innerText = nextTheme;
            } else if (elem.classList.contains(ANIMATIONS_SETTING_NAME)) {
                const knob = setting.querySelector(".knob") as HTMLElement;
                enabled = isAnimationEnabled = !isAnimationEnabled;
                animationManager.isAnimationEnabled = isAnimationEnabled;
                savePreferenceValue(
                    ANIMATIONS_PREFERENCE_NAME,
                    isAnimationEnabled ? SETTING_ENABLED : SETTING_DISABLED
                );
                if (enabled) {
                    knob.classList.add("enabled");
                } else {
                    knob.classList.remove("enabled");
                }
            }
        });
    });

    initPreferences();
    switchTheme(getPreferenceValue(THEME_PREFERENCE_NAME));
    const themeSetting = document.querySelector(".setting.theme-switch") as HTMLElement;
    (themeSetting.querySelector(".toggle") as HTMLElement).innerText = selectedTheme;
    if (getPreferenceValue(ANIMATIONS_PREFERENCE_NAME) === SETTING_ENABLED) {
        isAnimationEnabled = true;
        const setting = document.querySelector(".setting.animations") as HTMLElement;
        const knob = setting.querySelector(".knob") as HTMLElement;
        knob.classList.add("enabled");
    }

    const landscapeQuery = window.matchMedia("(orientation: landscape)");

    const checkForOrientation = (mediaQueryEvent) => {
        const md = new MobileDetect(window.navigator.userAgent);
        const landscapeOverlay = document.getElementById("landscape-overlay") as HTMLElement;
        if (md && mediaQueryEvent.matches && md.mobile()) {
            landscapeOverlay.style.display = "block";
            document.body.classList.add(LANDSCAPE_CLASS_NAME);
            // Have the snow element appear on top of the landscape overlay
            // (will only be visible if the "display" attribute is set, though)
            if (snowEmbed) snowEmbed.style.zIndex = "99999";
        } else {
            landscapeOverlay.style.display = "none";
            document.body.classList.remove(LANDSCAPE_CLASS_NAME);
            if (snowEmbed) snowEmbed.style.zIndex = "";
        }
    };

    if (landscapeQuery.addEventListener) {
        landscapeQuery.addEventListener("change", function (event) {
            checkForOrientation(event);
        });
    } else {
        // Support for older browsers, addListener is deprecated
        landscapeQuery.addListener(checkForOrientation);
    }

    checkForOrientation(landscapeQuery);

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    swipeArea.addEventListener("touchstart", (event) => {
        touchStartX = event.changedTouches[0].screenX;
        touchStartY = event.changedTouches[0].screenY;
    });

    swipeArea.addEventListener("touchmove", (event) => {
        // Prevent default behavior to avoid scrolling
        event.preventDefault();
    });

    swipeArea.addEventListener("touchend", (event) => {
        touchEndX = event.changedTouches[0].screenX;
        touchEndY = event.changedTouches[0].screenY;
        handleGesture();
    });

    function handleGesture() {
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        console.log("diff x/y", diffX, diffY);

        const sensitivity = 100;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > sensitivity) {
                console.log("Swiped right");
                move(DIRECTION_RIGHT);
                swipeArea.innerText = "Swiped right";
                return;
            } else if (diffX < -sensitivity) {
                console.log("Swiped left");
                move(DIRECTION_LEFT);
                swipeArea.innerText = "Swiped left";
                return;
            }
        } else {
            if (diffY > sensitivity) {
                console.log("Swiped down");
                move(DIRECTION_DOWN);
                swipeArea.innerText = "Swiped down";
                return;
            } else if (diffY < -sensitivity) {
                console.log("Swiped up");
                move(DIRECTION_UP);
                swipeArea.innerText = "Swiped up";
                return;
            }
        }
        swipeArea.innerText = "No swipe";
    }

    const undoButton = document.querySelector("button#undo") as HTMLElement;
    undoButton.addEventListener("click", (e) => {
        e.preventDefault();
        undo();
    });

    const debugButton = document.querySelector("button#debug") as HTMLElement;
    debugButton.addEventListener("click", (e) => {
        e.preventDefault();
        renderDialog(createDialogContentFromTemplate("#debug-dialog-content"), true);
        const closeDialogAndOverlay = () => {
            const overlayBackElem = document.querySelector(".overlay-back") as HTMLElement;
            const dialog = document.querySelector(".dialog") as HTMLElement;
            closeDialog(dialog, overlayBackElem);
        };
        (document.querySelector(".button.new-win-game") as HTMLElement).addEventListener(
            "click",
            (e) => {
                e.preventDefault();
                newGame({
                    board: [
                        [1024, 0, 0, 1024],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0],
                    ],
                    ended: false,
                    won: false,
                    score: 0,
                    highscore: 0,
                    didUndo: false,
                });
                closeDialogAndOverlay();
            }
        );
        (document.querySelector(".button.new-lose-game") as HTMLElement).addEventListener(
            "click",
            (e) => {
                e.preventDefault();
                newGame({
                    board: [
                        [2, 16, 2, 32],
                        [4, 512, 8, 128],
                        [16, 4, 16, 32],
                        [4, 32, 1024, 2],
                    ],
                    ended: false,
                    won: false,
                    score: 0,
                    highscore: 0,
                    didUndo: false,
                });
                closeDialogAndOverlay();
            }
        );
    });

    if (import.meta.env.DEV) {
        undoButton.style.display = "";
        debugButton.style.display = "";
    }

    (document.querySelector("#new-game") as HTMLElement).addEventListener("click", (e) => {
        e.preventDefault();
        newGame();
    });

    (document.querySelector("[data-feather='help-circle']") as HTMLElement).innerText = "?";
    (document.querySelector("[data-feather='settings']") as HTMLElement).innerText = "⚙";
    (document.querySelector(".settings [data-feather='x']") as HTMLElement).innerText = "X";
    feather.replace();

    const versionElem = document.querySelector(".version-number") as HTMLElement;
    // @ts-ignore TODO: Let TypeScript know about the game version coming from Vite config
    versionElem.innerText = `v${GAME_VERSION}`;

    // TODO: Add Sentry to the project
    // if (typeof Sentry !== "undefined") {
    //     Sentry.onLoad(() => {
    //         Sentry.init({
    //             // @ts-ignore TODO: Let TypeScript know about the game version coming from Vite config
    //             release: `wordle-clone@${GAME_VERSION}`,
    //             beforeSend(event) {
    //                 if (
    //                     event.request.url.includes("localhost") ||
    //                     event.request.url.includes("127.0.0.1")
    //                 ) {
    //                     return null;
    //                 }
    //                 return event;
    //             },
    //         });
    //     });
    // }

    // TODO: Add Google Analytics to the project
    // gtag("event", "game_open", {
    //     version: GAME_VERSION,
    // });

    try {
        await initGame(eventHandler, spawnManager, animationManager);
    } catch (e) {
        // TODO: Add Sentry to the project
        // if (typeof Sentry !== "undefined") Sentry.captureException(e);
        const elem = createDialogContentFromTemplate("#error-dialog-content");
        const errorContent = elem.querySelector(".error-text") as HTMLElement;

        console.error("Unknown error occurred", e);
        errorContent.innerText = e.message;

        renderDialog(elem, true, false);
    }

    gameLoaded = true;
});
