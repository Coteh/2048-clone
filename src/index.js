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

debugEnabled = true;
let isAnimationEnabled = false;

document.addEventListener("DOMContentLoaded", async () => {
    const middleElem = document.querySelector("#middle");
    const bottomElem = document.querySelector("#bottom");

    let gameState;
    let gameLoaded = false;

    const renderer = {
        renderWin() {},
        renderGameOver(word) {},
    };

    const eventHandler = (event, data) => {
        switch (event) {
            case "init":
                gameState = data.gameState;
                break;
            case "draw":
                gameState = data.gameState;
                renderBoard(middleElem, gameState);
                document.querySelector("#score").innerText = gameState.score.toString();
                break;
            case "error":
                break;
            case "lose":
                renderDialog(createDialogContentFromTemplate("#lose-dialog-content"), true);
                break;
            case "win":
                renderDialog(createDialogContentFromTemplate("#win-dialog-content"), true);
                break;
        }
    };

    const closeDialog = (dialog, overlayBackElem) => {
        if (dialog) {
            // Check if dialog is closable first before closing (close button would be visible, if so)
            const closeBtn = dialog.querySelector("button.close");
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
        const dialog = document.querySelector(".dialog");
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

    const helpLink = document.querySelector(".help-link");
    helpLink.addEventListener("click", (e) => {
        e.preventDefault();
        renderDialog(createDialogContentFromTemplate("#how-to-play"), true);
        helpLink.blur();
    });

    const gamePane = document.querySelector(".game");
    const settingsPane = document.querySelector(".settings");
    const settingsLink = document.querySelector(".settings-link");
    const swipeArea = document.getElementById('swipeArea');

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

    const settingsClose = settingsPane.querySelector(".close");
    settingsClose.addEventListener("click", (e) => {
        e.preventDefault();
        toggleSettings();
    });

    const overlayBackElem = document.querySelector(".overlay-back");
    overlayBackElem.addEventListener("click", (e) => {
        const dialog = document.querySelector(".dialog");
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
        document.querySelector("meta[name='theme-color']").content = themeColor;
        selectedTheme = theme;
    };

    const settings = document.querySelectorAll(".setting");
    settings.forEach((setting) => {
        setting.addEventListener("click", (e) => {
            const elem = e.target;
            const toggle = setting.querySelector(".toggle");
            let enabled = false;
            if (elem.classList.contains(THEME_SETTING_NAME)) {
                const themeIndex = selectableThemes.indexOf(selectedTheme);
                const nextTheme = selectableThemes[(themeIndex + 1) % selectableThemes.length];
                switchTheme(nextTheme);
                savePreferenceValue(THEME_PREFERENCE_NAME, nextTheme);
                toggle.innerText = nextTheme;
            } else if (elem.classList.contains(ANIMATIONS_SETTING_NAME)) {
                const knob = setting.querySelector(".knob");
                enabled = isAnimationEnabled = !isAnimationEnabled;
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
    const themeSetting = document.querySelector(".setting.theme-switch");
    themeSetting.querySelector(".toggle").innerText = selectedTheme;
    if (getPreferenceValue(ANIMATIONS_PREFERENCE_NAME) === SETTING_ENABLED) {
        isAnimationEnabled = true;
        const setting = document.querySelector(".setting.animations");
        const knob = setting.querySelector(".knob");
        knob.classList.add("enabled");
    }

    const landscapeQuery = window.matchMedia("(orientation: landscape)");

    const checkForOrientation = (mediaQueryEvent) => {
        const md =
            typeof MobileDetect !== "undefined" && new MobileDetect(window.navigator.userAgent);
        if (md && mediaQueryEvent.matches && md.mobile()) {
            document.getElementById("landscape-overlay").style.display = "block";
            document.body.classList.add(LANDSCAPE_CLASS_NAME);
            // Have the snow element appear on top of the landscape overlay
            // (will only be visible if the "display" attribute is set, though)
            if (snowEmbed) snowEmbed.style.zIndex = "99999";
        } else {
            document.getElementById("landscape-overlay").style.display = "none";
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

    swipeArea.addEventListener('touchstart', (event) => {
        touchStartX = event.changedTouches[0].screenX;
        touchStartY = event.changedTouches[0].screenY;
    });

    swipeArea.addEventListener('touchmove', (event) => {
        // Prevent default behavior to avoid scrolling
        event.preventDefault();
    });

    swipeArea.addEventListener('touchend', (event) => {
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
                console.log('Swiped right');
                move(DIRECTION_RIGHT);
                swipeArea.innerText = 'Swiped right';
                return;
            } else if (diffX < -sensitivity) {
                console.log('Swiped left');
                move(DIRECTION_LEFT);
                swipeArea.innerText = 'Swiped left';
                return;
            }
        } else {
            if (diffY > sensitivity) {
                console.log('Swiped down');
                move(DIRECTION_DOWN);
                swipeArea.innerText = 'Swiped down';
                return;
            } else if (diffY < -sensitivity) {
                console.log('Swiped up');
                move(DIRECTION_UP);
                swipeArea.innerText = 'Swiped up';
                return;
            }
        }
        swipeArea.innerText = 'No swipe';
    }

    const undoButton = document.querySelector("#undo");
    undoButton.addEventListener("click", (e) => {
        e.preventDefault();
        undo();
    });
    if (debugEnabled) {
        undoButton.style.display = "";
    }

    document.querySelector("#new-game").addEventListener("click", (e) => {
        e.preventDefault();
        newGame();
    });

    try {
        await initGame(eventHandler);
    } catch (e) {
        if (typeof Sentry !== "undefined") Sentry.captureException(e);
        const elem = createDialogContentFromTemplate("#error-dialog-content");
        const errorContent = elem.querySelector(".error-text");

        console.error("Unknown error occurred", e);
        errorContent.innerText = e.message;

        renderDialog(elem, true, false);
    }

    gameLoaded = true;
});
