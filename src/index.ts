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
    renderPromptDialog,
} from "./render";
import feather from "feather-icons";
import { AnimationManager } from "./manager/animation";
import { SpawnManager } from "./manager/spawn";
import MobileDetect from "mobile-detect";
import { BrowserGameStorage } from "./storage/browser";
import { copyShareText, triggerShare } from "./share/browser";
import confetti from "canvas-confetti";
import { Tutorial } from "./component/tutorial";
import { HowToPlay } from "./component/how-to-play";
import * as Sentry from "@sentry/browser";
import posthog from "posthog-js";
import { UndoManager } from "./manager/undo";
import { AssetManager } from "./manager/asset";
import { formatTilesetName } from "./util/format";
import * as marked from "marked";
import { FullscreenManager } from "./manager/fullscreen";

import "./styles/global.css";

const STANDARD_THEME = "standard";
const LIGHT_THEME = "light";
const DARK_THEME = "dark";
const SNOW_THEME = "snow";
const CLASSIC_THEME = "classic";

const STANDARD_STANDARD_TILESET = "standard";
const LIGHT_LIGHT_TILESET = "light";
const DARK_DARK_TILESET = "dark";
const SNOW_SNOW_TILESET = "snow";
const SNOW_CHRISTMAS_TILESET = "christmas";
const CLASSIC_MODERN_TILESET = "modern";
const CLASSIC_CLASSIC_TILESET = "classic";
const CLASSIC_COLORFUL_TILESET = "colorful";
const CLASSIC_INITIAL_COMMIT_TILESET = "initial-commit";

const STANDARD_BLOCK_STYLE = "standard";
const COMPACT_BLOCK_STYLE = "compact";

const THEME_PREFERENCE_NAME = "theme";
const TILESET_PREFERENCE_NAME = "tileset";
const ANIMATIONS_PREFERENCE_NAME = "animations";
const BLOCK_STYLE_PREFERENCE_NAME = "block";
const DEBUG_HUD_ENABLED_PREFERENCE_NAME = "debugHudEnabled";
const DEBUG_HUD_VISIBLE_PREFERENCE_NAME = "debugHudVisible";
const FULLSCREEN_PREFERENCE_NAME = "fullscreen";

const THEME_SETTING_NAME = "theme-switch";
const TILESET_SETTING_NAME = "tileset-switch";
const ANIMATIONS_SETTING_NAME = "animations";
const BLOCK_STYLE_SETTING_NAME = "block";
const FULLSCREEN_SETTING_NAME = "fullscreen";
const CLEAR_DATA_SETTING_NAME = "clear-all-data";

const SETTING_ENABLED = "enabled";
const SETTING_DISABLED = "disabled";

const LANDSCAPE_CLASS_NAME = "landscape";

const CLASSIC_THEME_LABEL = "2048Clone";

let changelogText: string;
// @ts-ignore TODO: Fix ts error saying that CHANGELOG.md cannot be found
import("../CHANGELOG.md").then((res) => {
    fetch(res.default)
        .then((resp) => resp.text())
        .then((text) => (changelogText = text));
});

let isAnimationEnabled = false;

let isPrompted = false;

let iconsLoaded = false;

console.info(`2048-clone v${GAME_VERSION}`);

document.addEventListener("DOMContentLoaded", async () => {
    const middleElem = document.querySelector("#middle") as HTMLElement;
    const bottomElem = document.querySelector("#bottom") as HTMLElement;

    let gameState: GameState;
    let persistentState: GamePersistentState;
    let spawnManager = new SpawnManager();
    let animationManager = new AnimationManager();
    let undoManager = new UndoManager();
    let gameStorage = new BrowserGameStorage();
    let fullscreenManager = new FullscreenManager(gameStorage);
    let assetManager = new AssetManager(document.querySelector(".loader-wrapper") as HTMLElement);
    // Store unlockable statuses so that their unlock messages don't display again if player achieved the same conditions again
    let unlockedClassic = false;
    let unlockedInitialCommit = false;

    let tutorial: Tutorial = new Tutorial();
    let howToPlay: HowToPlay = new HowToPlay();

    const swipeSensitivity = 50;

    const md = new MobileDetect(window.navigator.userAgent);
    const isMobile = md.mobile() !== null;

    const eventHandler = (event: string, data: any) => {
        switch (event) {
            case "init":
                gameState = data.gameState;
                persistentState = data.persistentState;
                animationManager.isAnimationEnabled = isAnimationEnabled;
                unlockedClassic = persistentState.unlockables.classic;
                unlockedInitialCommit = persistentState.unlockables.initialCommit;
                if (!persistentState.hasPlayedBefore) {
                    tutorial.render();

                    persistentState.hasPlayedBefore = true;
                    gameStorage.savePersistentState(persistentState);
                }
                break;
            case "draw":
                renderBoard(middleElem, gameState.board, animationManager, {
                    theme: selectedTheme,
                    blockStyle: selectedBlockStyle,
                });
                (document.querySelector("#score") as HTMLElement).innerText =
                    gameState.score.toString();
                (document.querySelector("#highscore") as HTMLElement).innerText =
                    persistentState.highscore.toString();
                (document.querySelector("#moveCount") as HTMLSpanElement).innerText =
                    gameState.moveCount.toString();
                if (data.undoInfo) {
                    if (data.undoInfo.undoStack.length > 0) {
                        undoButton.classList.remove("disabled");
                    } else {
                        undoButton.classList.add("disabled");
                    }
                }
                break;
            case "error":
                break;
            case "lose": {
                const loseElem = createDialogContentFromTemplate("#lose-dialog-content");
                const shareButton = loseElem.querySelector(".share-button") as HTMLElement;
                const copyButton = loseElem.querySelector(".clipboard-button") as HTMLElement;
                renderDialog(loseElem, {
                    fadeIn: true,
                });
                const dialog = document.querySelector(".dialog") as HTMLDialogElement;
                dialog.classList.add("game-over");
                (document.getElementById("dialog-score") as HTMLElement).innerText =
                    gameState.score.toString();
                (document.getElementById("dialog-move-count") as HTMLElement).innerText = `${
                    gameState.moveCount
                } move${gameState.moveCount === 1 ? "" : "s"}`;
                if (gameState.achievedHighscore) {
                    (document.getElementById("dialog-highscore") as HTMLElement).style.display = "";
                }
                (
                    document.querySelector(".dialog .button.new-game") as HTMLElement
                ).addEventListener("click", (e) => {
                    e.preventDefault();
                    newGame();
                    const overlayBackElem = document.querySelector(".overlay-back") as HTMLElement;
                    closeDialog(dialog, overlayBackElem);
                });
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
                undoButton.classList.add("disabled");
                break;
            }
            case "win": {
                const winElem = createDialogContentFromTemplate("#win-dialog-content");
                const shareButton = winElem.querySelector(".share-button") as HTMLElement;
                const copyButton = winElem.querySelector(".clipboard-button") as HTMLElement;
                const undoText = winElem.querySelector("#undo-text") as HTMLElement;
                if (gameState.didUndo) {
                    undoText.style.display = "";
                }
                renderDialog(winElem, {
                    fadeIn: true,
                });
                const dialog = document.querySelector(".dialog") as HTMLElement;
                dialog.classList.add("win");
                if (!unlockedClassic && data.persistentState.unlockables.classic) {
                    renderNotification("2048Clone theme unlocked", 2500);
                    unlockedClassic = true;
                }
                if (!unlockedInitialCommit && data.persistentState.unlockables.initialCommit) {
                    renderNotification("Initial Commit tileset unlocked", 2500);
                    unlockedInitialCommit = true;
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
                }, 125);
                posthog.capture("2048 achieved", { version: GAME_VERSION });
                break;
            }
        }
    };

    const closeDialog = (dialog: HTMLDialogElement, overlayBackElem: HTMLElement) => {
        if (dialog) {
            // Check if dialog is closable first before closing (close button would be visible, if so)
            const closeBtn = dialog.querySelector("button.close") as HTMLElement;
            if (closeBtn.style.display === "none") {
                return;
            }
            dialog.close();
            dialog.remove();
        }
        // NTS: Perhaps it'd make more sense if overlay backdrop only disappeared when a valid dialog is passed,
        // but if an invalid dialog is being passed, it might not be on the screen either.
        // In this case, it may be better to leave this as-is and always have the backdrop close so that players can still play.
        overlayBackElem.style.display = "none";
    };

    const handleKeyInput = (key: string) => {
        console.log(key);
        const dialog = document.querySelector(".dialog") as HTMLDialogElement;
        if (dialog) {
            if (key === "escape") {
                // Do not allow player to close the dialog if they're presented with a prompt dialog asking for Yes/No
                if (isPrompted) {
                    return;
                }
                return closeDialog(dialog, overlayBackElem);
            }
            if (key === "r") {
                // If "r" is pressed, presumably, in the game over dialog, and the game is over, then start new game and close dialog
                if (gameState.ended && !isPrompted) {
                    newGame();
                    return closeDialog(dialog, overlayBackElem);
                }
            }
        }
        if (dialog) {
            return;
        }
        if (key === "r") {
            promptNewGame(() => {
                if (settingsPane.style.display !== "none") {
                    toggleSettings();
                }
            });
            return;
        }
        if (key === "f" && !isMobile) {
            fullscreenManager.toggleFullscreen();
            const knob = document.querySelector(".setting.fullscreen .knob") as HTMLElement;
            if (fullscreenManager.isFullscreenEnabled()) {
                knob.classList.add("enabled");
            } else {
                knob.classList.remove("enabled");
            }
            return;
        }
        if (gameState.ended) {
            return;
        }
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
            case "d":
                // Only toggle the debug HUD if debug HUD is enabled
                if (isDebugHudEnabled) {
                    toggleDebugHud(debugOverlay.style.display !== "none");
                }
                break;
        }
    };

    window.addEventListener("keydown", (e) => {
        handleKeyInput(e.key.toLowerCase());
    });

    document.addEventListener("fullscreenchange", () => {
        if (!document.fullscreenElement) {
            fullscreenManager.setFullscreenPreference(false);
            const knob = document.querySelector(".setting.fullscreen .knob") as HTMLElement;
            knob.classList.remove("enabled");
        }
    });

    const promptNewGame = (onNewGameStarted?: () => void) => {
        // If game ended, no need to prompt
        if (gameState.ended) {
            newGame();
            if (onNewGameStarted) {
                onNewGameStarted();
            }
            return;
        }
        const dialogElem = createDialogContentFromTemplate("#prompt-dialog-content");
        (dialogElem.querySelector(".prompt-text") as HTMLSpanElement).innerText =
            "Are you sure you want to start a new game? All progress will be lost.";
        renderPromptDialog(dialogElem, {
            fadeIn: true,
            onConfirm: () => {
                newGame();
                if (onNewGameStarted) {
                    onNewGameStarted();
                }
            },
        });
    };

    const promptFullscreen = () => {
        const dialogElem = createDialogContentFromTemplate("#prompt-dialog-content");
        (dialogElem.querySelector(".prompt-text") as HTMLSpanElement).innerText =
            "Fullscreen mode is enabled. Do you want to turn it on?";
        renderPromptDialog(dialogElem, {
            fadeIn: true,
            onConfirm: () => {
                fullscreenManager.toggleFullscreen(true);
                const setting = document.querySelector(
                    `.setting.${FULLSCREEN_SETTING_NAME}`
                ) as HTMLElement;
                const knob = setting.querySelector(".knob") as HTMLElement;
                knob.classList.add("enabled");
            },
            onCancel: () => {
                fullscreenManager.toggleFullscreen(false);
                const setting = document.querySelector(
                    `.setting.${FULLSCREEN_SETTING_NAME}`
                ) as HTMLElement;
                const knob = setting.querySelector(".knob") as HTMLElement;
                knob.classList.remove("enabled");
            },
        });
    };

    const helpLink = document.querySelector(".help-link") as HTMLElement;
    helpLink.addEventListener("click", (e) => {
        e.preventDefault();
        howToPlay.render();
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
            tutorial.stop();
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
        // Do not allow player to close the dialog if they're presented with a prompt dialog asking for Yes/No
        if (isPrompted) {
            return;
        }
        const dialog = document.querySelector(".dialog") as HTMLDialogElement;
        closeDialog(dialog, overlayBackElem);
    });

    let snowEmbed = document.getElementById("embedim--snow");
    if (snowEmbed) snowEmbed.style.display = "none";

    let selectedTheme = STANDARD_THEME;
    let selectedTileset = STANDARD_STANDARD_TILESET;
    let selectedBlockStyle = STANDARD_BLOCK_STYLE;

    const selectableThemes = [STANDARD_THEME, LIGHT_THEME, DARK_THEME, SNOW_THEME, CLASSIC_THEME];
    const selectableTilesets: { [key: string]: string[] } = {
        [STANDARD_THEME]: [STANDARD_STANDARD_TILESET],
        [LIGHT_THEME]: [LIGHT_LIGHT_TILESET],
        [DARK_THEME]: [DARK_DARK_TILESET],
        [SNOW_THEME]: [SNOW_SNOW_TILESET, SNOW_CHRISTMAS_TILESET],
        [CLASSIC_THEME]: [
            CLASSIC_MODERN_TILESET,
            CLASSIC_CLASSIC_TILESET,
            CLASSIC_COLORFUL_TILESET,
            CLASSIC_INITIAL_COMMIT_TILESET,
        ],
    };
    const selectableBlockStyles = [STANDARD_BLOCK_STYLE, COMPACT_BLOCK_STYLE];

    let classicTimeout: NodeJS.Timeout;

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
            case DARK_THEME:
                themeColor = "#1c1c1c";
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
        selectedTileset = selectableTilesets[theme][0];
        document.body.classList.add(`tileset-${selectedTileset}`);
        // Redraw the board to remove any theme-specific modifiers on any of the DOM elements
        if (gameState) {
            animationManager.resetState();
            renderBoard(middleElem, gameState.board, animationManager, {
                theme: selectedTheme,
                blockStyle: selectedBlockStyle,
            });
        }
        const welcomeText = document.querySelector(".classic-welcome-text") as HTMLElement;
        const scoreLabel = document.querySelector(".score-box > .score-label") as HTMLElement;
        const highscoreLabel = document.querySelector(
            ".highscore-box > .score-label"
        ) as HTMLElement;
        if (selectedTheme === CLASSIC_THEME) {
            welcomeText.style.display = "block";
            classicTimeout = setTimeout(() => {
                welcomeText.style.display = "";
            }, 5000);
            scoreLabel.innerText = "Score:";
            highscoreLabel.innerText = "Highscore:";
        } else {
            clearTimeout(classicTimeout);
            welcomeText.style.display = "";
            scoreLabel.innerText = "Score";
            highscoreLabel.innerText = "Best";
        }
    };

    const switchTileset = (theme: string, tileset: string) => {
        const selectableTilesetsForTheme = selectableTilesets[theme];
        if (!tileset || !selectableTilesetsForTheme.includes(tileset)) {
            tileset = selectableTilesetsForTheme[0];
        }
        document.body.classList.remove(`tileset-${selectedTileset}`);
        // The "Initial Commit" tileset in 2048Clone theme has a special background and meta theme color
        if (theme === CLASSIC_THEME) {
            let themeColor = "rgb(128, 128, 128)";
            if (tileset === CLASSIC_INITIAL_COMMIT_TILESET) {
                themeColor = "#6495ed";
            }
            (document.querySelector("meta[name='theme-color']") as HTMLMetaElement).content =
                themeColor;
        }
        selectedTileset = tileset;
        document.body.classList.add(`tileset-${selectedTileset}`);
    };

    const switchBlockStyle = (blockStyle: string) => {
        if (!blockStyle || !selectableBlockStyles.includes(blockStyle)) {
            blockStyle = selectableBlockStyles[0];
        }
        document.body.classList.remove(`block-style-${selectedBlockStyle}`);
        selectedBlockStyle = blockStyle;
        document.body.classList.add(`block-style-${selectedBlockStyle}`);
        // Redraw the board to reset the font sizes for the different block styles
        if (gameState) {
            animationManager.resetState();
            renderBoard(middleElem, gameState.board, animationManager, {
                theme: selectedTheme,
                blockStyle: selectedBlockStyle,
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
                // If player has a tileset selected for this theme, use it. Otherwise, it will default to the first one for the theme.
                if (tilesetPreferences && tilesetPreferences[selectedTheme]) {
                    switchTileset(selectedTheme, tilesetPreferences[selectedTheme]);
                }
                const tilesetSettingItem = document.querySelector(
                    ".settings-item.setting.tileset-switch"
                ) as HTMLElement;
                if (selectableTilesets[selectedTheme].length > 1) {
                    tilesetSettingItem.style.display = "";
                    const tilesetToggle = tilesetSettingItem.querySelector(
                        ".toggle"
                    ) as HTMLElement;
                    tilesetToggle.innerText = formatTilesetName(selectedTileset);
                } else {
                    tilesetSettingItem.style.display = "none";
                }
            } else if (elem.classList.contains(TILESET_SETTING_NAME)) {
                const selectableTilesetsForTheme = selectableTilesets[selectedTheme];
                const tilesetIndex = selectableTilesetsForTheme.indexOf(selectedTileset);
                let nextTileset =
                    selectableTilesetsForTheme[
                        (tilesetIndex + 1) % selectableTilesetsForTheme.length
                    ];
                // If classic theme is selected and initial commit tileset is not unlocked, skip to the next tileset
                if (
                    selectedTheme === CLASSIC_THEME &&
                    nextTileset === CLASSIC_INITIAL_COMMIT_TILESET &&
                    !persistentState.unlockables.initialCommit
                ) {
                    nextTileset =
                        selectableTilesetsForTheme[
                            (tilesetIndex + 2) % selectableTilesetsForTheme.length
                        ];
                }
                switchTileset(selectedTheme, nextTileset);
                if (!tilesetPreferences) {
                    tilesetPreferences = {};
                }
                tilesetPreferences[selectedTheme] = nextTileset;
                savePreferenceValue(TILESET_PREFERENCE_NAME, tilesetPreferences);
                toggle.innerText = formatTilesetName(nextTileset);
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
            } else if (elem.classList.contains(BLOCK_STYLE_SETTING_NAME)) {
                const blockStyleIndex = selectableBlockStyles.indexOf(selectedBlockStyle);
                let nextBlockStyle =
                    selectableBlockStyles[(blockStyleIndex + 1) % selectableBlockStyles.length];
                switchBlockStyle(nextBlockStyle);
                savePreferenceValue(BLOCK_STYLE_PREFERENCE_NAME, nextBlockStyle);
                toggle.innerText = nextBlockStyle;
            } else if (elem.classList.contains(FULLSCREEN_SETTING_NAME)) {
                fullscreenManager.toggleFullscreen();
                const knob = setting.querySelector(".knob") as HTMLElement;
                if (fullscreenManager.isFullscreenEnabled()) {
                    knob.classList.add("enabled");
                } else {
                    knob.classList.remove("enabled");
                }
            } else if (elem.classList.contains(CLEAR_DATA_SETTING_NAME)) {
                const dialogElem = createDialogContentFromTemplate("#prompt-dialog-content");
                (dialogElem.querySelector(".prompt-text") as HTMLSpanElement).innerHTML =
                    "Are you sure you want to clear all game data? <u>Preferences</u>, <u>high score</u>, and <u>unlockables</u> will <em>all be lost</em>.";
                renderPromptDialog(dialogElem, {
                    fadeIn: true,
                    onConfirm: () => {
                        isPrompted = false;
                        gameStorage.clearPersistentState();
                        gameStorage.clearGame();
                        gameStorage.clearPreferences();
                        window.location.reload();
                    },
                    onCancel: () => {
                        isPrompted = false;
                    },
                });
                isPrompted = true;
            }
        });
    });

    // Hide fullscreen setting on mobile devices
    const fullscreenOption = document.querySelector(".setting.fullscreen") as HTMLElement;
    if (isMobile) {
        fullscreenOption.style.display = "none";
    }

    initPreferences(gameStorage, {
        [ANIMATIONS_PREFERENCE_NAME]: SETTING_ENABLED,
    });
    switchTheme(getPreferenceValue(THEME_PREFERENCE_NAME));
    const themeSetting = document.querySelector(`.setting.${THEME_SETTING_NAME}`) as HTMLElement;
    (themeSetting.querySelector(".toggle") as HTMLElement).innerText =
        selectedTheme === "classic" ? CLASSIC_THEME_LABEL : selectedTheme;
    let tilesetPreferences = getPreferenceValue(TILESET_PREFERENCE_NAME);
    if (tilesetPreferences) {
        switchTileset(selectedTheme, tilesetPreferences[selectedTheme]);
    }
    const tilesetSettingItem = document.querySelector(
        `.settings-item.setting.${TILESET_SETTING_NAME}`
    ) as HTMLElement;
    if (selectableTilesets[selectedTheme].length > 1) {
        tilesetSettingItem.style.display = "";
        const tilesetToggle = tilesetSettingItem.querySelector(".toggle") as HTMLElement;
        tilesetToggle.innerText = formatTilesetName(selectedTileset);
    } else {
        tilesetSettingItem.style.display = "none";
    }
    if (getPreferenceValue(ANIMATIONS_PREFERENCE_NAME) === SETTING_ENABLED) {
        isAnimationEnabled = true;
        const setting = document.querySelector(
            `.setting.${ANIMATIONS_SETTING_NAME}`
        ) as HTMLElement;
        const knob = setting.querySelector(".knob") as HTMLElement;
        knob.classList.add("enabled");
    }
    switchBlockStyle(getPreferenceValue(BLOCK_STYLE_PREFERENCE_NAME));
    const blockStyleSetting = document.querySelector(
        `.setting.${BLOCK_STYLE_SETTING_NAME}`
    ) as HTMLElement;
    (blockStyleSetting.querySelector(".toggle") as HTMLElement).innerText = selectedBlockStyle;
    if (getPreferenceValue(FULLSCREEN_PREFERENCE_NAME) === SETTING_ENABLED) {
        promptFullscreen();
    }

    const generateShareText = (gameState: GameState) => {
        return `I got a score of ${gameState.score} in 2048-clone${
            gameState.won ? ", and I achieved 2048" : ""
        } in ${gameState.moveCount} move${gameState.moveCount === 1 ? "" : "s"}. Play it here: ${
            import.meta.env.VITE_WEBSITE_URL || "https://coteh.github.io/2048-clone/"
        }`;
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

        (document.querySelector("#diffX") as HTMLSpanElement).innerText = diffX.toString();
        (document.querySelector("#diffY") as HTMLSpanElement).innerText = diffY.toString();

        const swipeRegistered = document.querySelector("#swipeRegistered") as HTMLSpanElement;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > swipeSensitivity) {
                console.log("Swiped right");
                move(DIRECTION_RIGHT);
                swipeRegistered.innerText = "Swiped right";
                swipeRegistered.style.color = "limegreen";
                return;
            } else if (diffX < -swipeSensitivity) {
                console.log("Swiped left");
                move(DIRECTION_LEFT);
                swipeRegistered.innerText = "Swiped left";
                swipeRegistered.style.color = "limegreen";
                return;
            }
        } else {
            if (diffY > swipeSensitivity) {
                console.log("Swiped down");
                move(DIRECTION_DOWN);
                swipeRegistered.innerText = "Swiped down";
                swipeRegistered.style.color = "limegreen";
                return;
            } else if (diffY < -swipeSensitivity) {
                console.log("Swiped up");
                move(DIRECTION_UP);
                swipeRegistered.innerText = "Swiped up";
                swipeRegistered.style.color = "limegreen";
                return;
            }
        }
        swipeRegistered.innerText = "No swipe";
        swipeRegistered.style.color = "red";
    }

    function changeIcon(parentElement: HTMLElement, newIcon: string) {
        let childElement = parentElement.querySelector("svg") as HTMLOrSVGElement;
        if (childElement) {
            (childElement as SVGElement).remove();
            childElement = document.createElement("i");
        } else {
            childElement = parentElement.querySelector("i") as HTMLElement;
        }
        (childElement as HTMLElement).setAttribute("data-feather", newIcon);
        parentElement.appendChild(childElement as HTMLElement);
        if (iconsLoaded) {
            feather.replace();
        }
    }

    const undoButton = document.querySelector(".link-icon#undo") as HTMLElement;
    const debugOverlay = document.querySelector("#debug-overlay") as HTMLDivElement;
    const debugMenuButton = document.querySelector(".link-icon#debug") as HTMLElement;
    const debugHudButton = document.querySelector(".link-icon#debug-hud") as HTMLElement;

    const updateDebugHudState = (isEnabled: boolean, isVisible: boolean) => {
        debugHudButton.style.display = isEnabled ? "" : "none";
        debugOverlay.style.display = isVisible ? "" : "none";
        changeIcon(debugHudButton, isVisible ? "eye-off" : "eye");
        (document.querySelector("#swipeSensitivity") as HTMLSpanElement).innerText =
            swipeSensitivity.toString();
    };

    debugHudButton.addEventListener("click", (e) => {
        e.preventDefault();
        toggleDebugHud(debugOverlay.style.display !== "none");
    });

    const toggleDebugHud = (isVisible: boolean) => {
        debugOverlay.style.display = isVisible ? "none" : "";
        savePreferenceValue(
            DEBUG_HUD_VISIBLE_PREFERENCE_NAME,
            !isVisible ? SETTING_ENABLED : SETTING_DISABLED
        );
        updateDebugHudState(isDebugHudEnabled, !isVisible);
    };

    let isDebugHudEnabled =
        getPreferenceValue(DEBUG_HUD_ENABLED_PREFERENCE_NAME) === SETTING_ENABLED;
    let isDebugHudVisible =
        getPreferenceValue(DEBUG_HUD_VISIBLE_PREFERENCE_NAME) === SETTING_ENABLED;

    updateDebugHudState(isDebugHudEnabled, isDebugHudVisible);

    if (import.meta.env.DEV && !import.meta.env.VITE_DEBUG_OFF) {
        debugMenuButton.style.display = "";
        undoButton.style.display = "";
        // If no hud enabled preference is set, set it to enabled and visible
        if (getPreferenceValue(DEBUG_HUD_ENABLED_PREFERENCE_NAME) == null) {
            savePreferenceValue(DEBUG_HUD_ENABLED_PREFERENCE_NAME, SETTING_ENABLED);
            isDebugHudEnabled = true;
            savePreferenceValue(DEBUG_HUD_VISIBLE_PREFERENCE_NAME, SETTING_ENABLED);
            isDebugHudVisible = true;
        }
        updateDebugHudState(isDebugHudEnabled, isDebugHudVisible);
    }

    undoButton.addEventListener("click", (e) => {
        e.preventDefault();
        undo();
    });

    const debugButton = document.querySelector(".link-icon#debug") as HTMLElement;
    debugButton.addEventListener("click", (e) => {
        e.preventDefault();
        renderDialog(createDialogContentFromTemplate("#debug-dialog-content"), {
            fadeIn: true,
        });
        const closeDialogAndOverlay = () => {
            const overlayBackElem = document.querySelector(".overlay-back") as HTMLElement;
            const dialog = document.querySelector(".dialog") as HTMLDialogElement;
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
                    achievedHighscore: false,
                    moveCount: 0,
                });
                if (settingsPane.style.display !== "none") {
                    toggleSettings();
                }
                closeDialogAndOverlay();
            }
        );
        (document.querySelector(".button.new-lose-game") as HTMLElement).addEventListener(
            "click",
            (e) => {
                e.preventDefault();
                persistentState.highscore = 9000;
                gameStorage.savePersistentState(persistentState);
                newGame({
                    board: [
                        [2, 16, 2, 32],
                        [4, 512, 8, 128],
                        [16, 4, 16, 32],
                        [4, 32, 1024, 2],
                    ],
                    ended: false,
                    won: false,
                    score: 10000,
                    didUndo: false,
                    achievedHighscore: true,
                    moveCount: 0,
                });
                if (settingsPane.style.display !== "none") {
                    toggleSettings();
                }
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
                    achievedHighscore: false,
                    moveCount: 0,
                });
                if (settingsPane.style.display !== "none") {
                    toggleSettings();
                }
                closeDialogAndOverlay();
            }
        );
        (document.querySelector(".button.prompt-dialog") as HTMLElement).addEventListener(
            "click",
            (e) => {
                e.preventDefault();
                const dialogElem = createDialogContentFromTemplate("#prompt-dialog-content");
                (dialogElem.querySelector(".prompt-text") as HTMLSpanElement).innerText = "Answer?";
                renderPromptDialog(dialogElem, {
                    fadeIn: true,
                    onConfirm: () => {
                        const dialogElem = document.createElement("span");
                        dialogElem.innerText = "Confirmed";
                        renderDialog(dialogElem, {
                            fadeIn: true,
                        });
                    },
                });
            }
        );
        (document.querySelector(".button.non-closable-dialog") as HTMLElement).addEventListener(
            "click",
            (e) => {
                e.preventDefault();
                const dialogElem = document.createElement("span");
                dialogElem.innerText =
                    "Testing a dialog that does not close. You will need to refresh the page.";
                renderDialog(dialogElem, {
                    fadeIn: true,
                    closable: false,
                });
            }
        );
        (document.querySelector(".button.show-notification") as HTMLElement).addEventListener(
            "click",
            (e) => {
                e.preventDefault();
                renderNotification("This is a test notification", 2500);
            }
        );
        debugButton.blur();
    });

    (document.querySelector("#new-game") as HTMLElement).addEventListener("click", (e) => {
        e.preventDefault();
        promptNewGame(() => {
            if (settingsPane.style.display !== "none") {
                toggleSettings();
            }
        });
    });

    // (document.querySelector("[data-feather='help-circle']") as HTMLElement).innerText = "?";
    (document.querySelector("[data-feather='settings']") as HTMLElement).innerText = "⚙";
    (document.querySelector(".settings [data-feather='x']") as HTMLElement).innerText = "X";
    feather.replace();
    iconsLoaded = true;

    const versionElem = document.querySelector(".version-number") as HTMLElement;
    versionElem.innerText = `v${GAME_VERSION}`;

    const commitElem = document.querySelector(".commit-hash") as HTMLElement;
    commitElem.innerText = COMMIT_HASH;
    (commitElem.parentElement as HTMLAnchorElement).href += COMMIT_HASH;

    (document.querySelector("link[rel='canonical']") as HTMLLinkElement).href =
        import.meta.env.VITE_WEBSITE_URL || "https://coteh.github.io/2048-clone/";

    let changelogTapCount = 0;
    const changelogTapThreshold = 5;
    const changelogTapTimeout = 1000;
    let changelogTapTimer: NodeJS.Timeout;

    const changelogLink = document.querySelector("#changelog-link") as HTMLAnchorElement;
    changelogLink.addEventListener("click", async (e) => {
        e.preventDefault();
        const dialogElem = createDialogContentFromTemplate("#changelog-content");
        const changelog = await marked.parse(changelogText);
        const changelogElem = dialogElem.querySelector("#changelog-text") as HTMLElement;
        changelogElem.innerHTML = changelog;
        // Capitalize title
        (changelogElem.children.item(0) as HTMLElement).style.textTransform = "uppercase";
        // Remove Keep a Changelog and Unreleased sections
        changelogElem.children.item(1)?.remove();
        changelogElem.children.item(1)?.remove();
        changelogElem.children.item(1)?.remove();
        // All links in this section should open a new tab
        changelogElem.querySelectorAll("a").forEach((elem) => (elem.target = "_blank"));
        renderDialog(dialogElem, {
            fadeIn: true,
            closable: true,
            style: {
                width: "75%",
                height: "75%",
                maxWidth: "600px",
            },
        });

        const changelogTitle = changelogElem.querySelector("h1") as HTMLElement;
        changelogTitle.addEventListener("click", () => {
            changelogTapCount++;
            if (changelogTapCount === 1) {
                changelogTapTimer = setTimeout(() => {
                    changelogTapCount = 0;
                }, changelogTapTimeout);
            }
            if (changelogTapCount >= changelogTapThreshold) {
                changelogTapCount = 0;
                clearTimeout(changelogTapTimer);
                const isEnabled =
                    getPreferenceValue(DEBUG_HUD_ENABLED_PREFERENCE_NAME) === SETTING_ENABLED;
                savePreferenceValue(
                    DEBUG_HUD_ENABLED_PREFERENCE_NAME,
                    isEnabled ? SETTING_DISABLED : SETTING_ENABLED
                );
                savePreferenceValue(
                    DEBUG_HUD_VISIBLE_PREFERENCE_NAME,
                    isEnabled ? SETTING_DISABLED : SETTING_ENABLED
                );
                isDebugHudEnabled = isDebugHudVisible = !isEnabled;
                updateDebugHudState(!isEnabled, !isEnabled);
                renderNotification(`Debug HUD ${isEnabled ? "disabled" : "enabled"}`, 2500);
            }
        });
    });

    Sentry.onLoad(() => {
        Sentry.init({
            release: `2048-clone@${GAME_VERSION}`,
            dsn: "https://4063de3fbf0774707bcc061c87c7e0f1@o518258.ingest.us.sentry.io/4507397529927680",
            integrations: [
                Sentry.replayIntegration({
                    maskAllText: false,
                    blockAllMedia: false,
                }),
            ],
            // Session Replay
            replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
            replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
            // @ts-ignore TODO: Fix type issue with event param
            beforeSend(event) {
                if (
                    event.request &&
                    event.request.url &&
                    (event.request.url.includes("localhost") ||
                        event.request.url.includes("127.0.0.1"))
                ) {
                    return null;
                }
                return event;
            },
        });
    });

    posthog.init("phc_lRFukmeGIBhfg2uSxJJmVE91B6Y44Qf7cj14tlClHnl", {
        api_host: "https://us.i.posthog.com",
        person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
    });

    posthog.capture("game open", { version: GAME_VERSION });

    try {
        await assetManager.loadAssets([
            "images/CheckerboardTiles.png",
            "images/Checkbox_unchecked.png",
            "images/Checkbox_checked.png",
        ]);

        (document.querySelector(".loader-wrapper") as HTMLElement).style.display = "none";

        await initGame(eventHandler, spawnManager, animationManager, undoManager, gameStorage);
    } catch (e: any) {
        if (typeof Sentry !== "undefined") Sentry.captureException(e);
        const elem = createDialogContentFromTemplate("#error-dialog-content");
        const errorContent = elem.querySelector(".error-text") as HTMLElement;

        console.error("Could not initialize game due to error:", e);
        errorContent.innerText = e.message;

        renderDialog(elem, {
            fadeIn: true,
            closable: false,
        });
    }
});
