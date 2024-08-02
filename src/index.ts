import {
    initGame,
    newGame,
    move,
    undo,
    DIRECTION_DOWN,
    DIRECTION_LEFT,
    DIRECTION_RIGHT,
    DIRECTION_UP,
    GameState,
    GamePersistentState,
} from "./game";
import { getPreferenceValue, initPreferences, savePreferenceValue } from "./preferences";
import {
    createDialogContentFromTemplate,
    renderBoard,
    renderDialog,
    renderNotification,
} from "./render";
import feather from "feather-icons";
import { AnimationManager } from "./manager/animation";
import { SpawnManager } from "./manager/spawn";
import MobileDetect from "mobile-detect";
import { BrowserGameStorage } from "./storage/browser";
import { copyShareText, triggerShare } from "./share/browser";
import confetti from "canvas-confetti";

const STANDARD_THEME = "standard";
const LIGHT_THEME = "light";
const DARK_THEME = "dark";
const SNOW_THEME = "snow";
const CLASSIC_THEME = "classic";

const STANDARD_STANDARD_TILESET = "standard";
const LIGHT_LIGHT_TILESET = "light";
const DARK_DARK_TILESET = "dark";
const SNOW_SNOW_TILESET = "snow";
const CLASSIC_MODERN_TILESET = "modern";

const THEME_PREFERENCE_NAME = "theme";
const ANIMATIONS_PREFERENCE_NAME = "animations";

const THEME_SETTING_NAME = "theme-switch";
const ANIMATIONS_SETTING_NAME = "animations";

const SETTING_ENABLED = "enabled";
const SETTING_DISABLED = "disabled";

const LANDSCAPE_CLASS_NAME = "landscape";

const CLASSIC_THEME_LABEL = "2048Clone";

let isAnimationEnabled = false;

document.addEventListener("DOMContentLoaded", async () => {
    const middleElem = document.querySelector("#middle") as HTMLElement;
    const bottomElem = document.querySelector("#bottom") as HTMLElement;

    let gameState: GameState;
    let persistentState: GamePersistentState;
    let spawnManager = new SpawnManager();
    let animationManager = new AnimationManager();
    let gameStorage = new BrowserGameStorage();
    let unlockedClassic = false;

    const eventHandler = (event: string, data: any) => {
        switch (event) {
            case "init":
                gameState = data.gameState;
                persistentState = data.persistentState;
                animationManager.isAnimationEnabled = isAnimationEnabled;
                unlockedClassic = persistentState.unlockables.classic;
                break;
            case "draw":
                // TODO: I don't think I need to set these here because they're references, just setting them in init should be enough
                gameState = data.gameState;
                persistentState = data.persistentState;
                renderBoard(middleElem, gameState, animationManager, {
                    theme: selectedTheme,
                });
                (document.querySelector("#score") as HTMLElement).innerText =
                    gameState.score.toString();
                (document.querySelector("#highscore") as HTMLElement).innerText =
                    persistentState.highscore.toString();
                break;
            case "error":
                break;
            case "lose": {
                const loseElem = createDialogContentFromTemplate("#lose-dialog-content");
                const shareButton = loseElem.querySelector(".share-button") as HTMLElement;
                const copyButton = loseElem.querySelector(".clipboard-button") as HTMLElement;
                renderDialog(loseElem, true);
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
                const shareText = generateShareText(gameState);
                shareButton.addEventListener("click", async (e) => {
                    e.preventDefault();
                    if (!(await triggerShare(shareText))) {
                        console.log(
                            "Triggering share not successful, swapping out for copy to clipboard button..."
                        );
                        copyButton.style.display = "";
                        shareButton.style.display = "none";
                    }
                });
                copyButton.addEventListener("click", (e) => {
                    e.preventDefault();
                    copyShareText(shareText);
                });
                break;
            }
            case "win": {
                const winElem = createDialogContentFromTemplate("#win-dialog-content");
                const shareButton = winElem.querySelector(".share-button") as HTMLElement;
                const copyButton = winElem.querySelector(".clipboard-button") as HTMLElement;
                renderDialog(winElem, true);
                if (!unlockedClassic && data.persistentState.unlockables.classic) {
                    renderNotification("2048Clone theme unlocked");
                    unlockedClassic = true;
                }
                persistentState = data.persistentState;
                const shareText = generateShareText(gameState);
                shareButton.addEventListener("click", async (e) => {
                    e.preventDefault();
                    if (!(await triggerShare(shareText))) {
                        console.log(
                            "Triggering share not successful, swapping out for copy to clipboard button..."
                        );
                        copyButton.style.display = "";
                        shareButton.style.display = "none";
                    }
                });
                copyButton.addEventListener("click", (e) => {
                    e.preventDefault();
                    copyShareText(shareText);
                });
                setTimeout(() => {
                    // TODO: Refine the particle effects a bit more
                    confetti({
                        particleCount: 50,
                        spread: 70,
                        origin: { y: 0.6 },
                    });
                    confetti({
                        particleCount: 50,
                        spread: 100,
                        origin: { y: 0.6 },
                    });
                }, 100);
                break;
            }
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

    const handleKeyInput = (key: string) => {
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

    // const helpLink = document.querySelector(".help-link") as HTMLElement;
    // helpLink.addEventListener("click", (e) => {
    //     e.preventDefault();
    //     renderDialog(createDialogContentFromTemplate("#how-to-play"), true);
    //     helpLink.blur();
    // });

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

    let selectedTheme = STANDARD_THEME;
    let selectedTileset = STANDARD_STANDARD_TILESET;

    const selectableThemes = [STANDARD_THEME, LIGHT_THEME, DARK_THEME, CLASSIC_THEME];
    const selectableTilesets: { [key: string]: string[] } = {
        [STANDARD_THEME]: [STANDARD_STANDARD_TILESET],
        [LIGHT_THEME]: [LIGHT_LIGHT_TILESET],
        [DARK_THEME]: [DARK_DARK_TILESET],
        [CLASSIC_THEME]: [CLASSIC_MODERN_TILESET],
    };

    const switchTheme = (theme: string) => {
        if (!theme || !selectableThemes.includes(theme)) {
            theme = STANDARD_THEME;
        }
        document.body.classList.remove(selectedTheme);
        document.body.classList.remove(`tileset-${selectedTileset}`);
        if (theme !== STANDARD_THEME) {
            document.body.classList.add(theme);
        }
        let themeColor = "#000";
        if (snowEmbed) snowEmbed.style.display = "none";
        switch (theme) {
            case STANDARD_THEME:
                themeColor = "bisque";
                break;
            case LIGHT_THEME:
                themeColor = "#FFF";
                break;
            case SNOW_THEME:
                themeColor = "#020024";
                if (snowEmbed) snowEmbed.style.display = "initial";
                break;
            case CLASSIC_THEME:
                themeColor = "rgb(128, 128, 128)";
                break;
        }
        (document.querySelector("meta[name='theme-color']") as HTMLMetaElement).content =
            themeColor;
        selectedTheme = theme;
        // TODO: Add ability for user to configure the tileset for each theme
        selectedTileset = selectableTilesets[theme][0];
        document.body.classList.add(`tileset-${selectedTileset}`);
        // Redraw the board to remove any theme-specific modifiers on any of the DOM elements
        if (gameState) {
            animationManager.resetState();
            renderBoard(middleElem, gameState, animationManager, {
                theme: selectedTheme,
            });
        }
    };

    const settings = document.querySelectorAll(".setting");
    settings.forEach((setting) => {
        setting.addEventListener("click", (e) => {
            const elem = e.target as HTMLElement;
            const toggle = setting.querySelector(".toggle") as HTMLElement;
            let enabled = false;
            if (elem.classList.contains(THEME_SETTING_NAME)) {
                const themeIndex = selectableThemes.indexOf(selectedTheme);
                let nextTheme = selectableThemes[(themeIndex + 1) % selectableThemes.length];
                // If classic theme isn't unlocked yet, skip to next theme
                if (nextTheme === CLASSIC_THEME && !persistentState.unlockables.classic) {
                    nextTheme = selectableThemes[(themeIndex + 2) % selectableThemes.length];
                }
                switchTheme(nextTheme);
                savePreferenceValue(THEME_PREFERENCE_NAME, nextTheme);
                toggle.innerText = nextTheme === "classic" ? CLASSIC_THEME_LABEL : nextTheme;
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

    initPreferences(gameStorage, {
        [ANIMATIONS_PREFERENCE_NAME]: SETTING_ENABLED,
    });
    switchTheme(getPreferenceValue(THEME_PREFERENCE_NAME));
    const themeSetting = document.querySelector(".setting.theme-switch") as HTMLElement;
    (themeSetting.querySelector(".toggle") as HTMLElement).innerText =
        selectedTheme === "classic" ? CLASSIC_THEME_LABEL : selectedTheme;
    if (getPreferenceValue(ANIMATIONS_PREFERENCE_NAME) === SETTING_ENABLED) {
        isAnimationEnabled = true;
        const setting = document.querySelector(".setting.animations") as HTMLElement;
        const knob = setting.querySelector(".knob") as HTMLElement;
        knob.classList.add("enabled");
    }

    const generateShareText = (gameState: GameState) => {
        return `I got a score of ${gameState.score} in 2048-clone${
            gameState.won ? ", and I achieved 2048!" : "."
        } Play it here: https://coteh.github.io/2048-clone/`;
    };

    const landscapeQuery = window.matchMedia("(orientation: landscape)");

    const checkForOrientation = (mediaQueryEvent: MediaQueryListEvent | MediaQueryList) => {
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
        if (gameState.ended) {
            return;
        }

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
                        [512, 0, 0, 512],
                        [512, 0, 0, 512],
                    ],
                    ended: false,
                    won: false,
                    score: 0,
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
                    didUndo: false,
                });
                closeDialogAndOverlay();
            }
        );
        (document.querySelector(".button.new-all-game") as HTMLElement).addEventListener(
            "click",
            (e) => {
                e.preventDefault();
                newGame({
                    board: [
                        [2, 32, 512, 8192],
                        [4, 64, 1024, 16384],
                        [8, 128, 2048, 32768],
                        [16, 256, 4096, 65536],
                    ],
                    ended: false,
                    won: false,
                    score: 0,
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

    // (document.querySelector("[data-feather='help-circle']") as HTMLElement).innerText = "?";
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
        await initGame(eventHandler, spawnManager, animationManager, gameStorage);
    } catch (e: any) {
        // TODO: Add Sentry to the project
        // if (typeof Sentry !== "undefined") Sentry.captureException(e);
        const elem = createDialogContentFromTemplate("#error-dialog-content");
        const errorContent = elem.querySelector(".error-text") as HTMLElement;

        console.error("Unknown error occurred", e);
        errorContent.innerText = e.message;

        renderDialog(elem, true, false);
    }
});
