import { IGameStorage } from "../storage";

export class FullscreenManager {
    private isFullscreen: boolean = false;
    private gameStorage: IGameStorage;

    constructor(gameStorage: IGameStorage) {
        this.gameStorage = gameStorage;
    }

    public isFullscreenEnabled() {
        return this.isFullscreen;
    }

    public toggleFullscreen(fullscreen?: boolean) {
        if (typeof fullscreen === "undefined") {
            fullscreen = !this.isFullscreen;
        }
        if (fullscreen) {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            }
        } else {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
        }
        this.isFullscreen = fullscreen;
        this.saveFullscreenPreference(this.isFullscreen);
    }

    public setFullscreenPreference(fullscreen: boolean) {
        this.isFullscreen = fullscreen;
        this.saveFullscreenPreference(fullscreen);
    }

    private saveFullscreenPreference(fullscreen: boolean) {
        const preferences = this.gameStorage.loadPreferences();
        preferences.fullscreen = fullscreen ? "enabled" : "disabled";
        this.gameStorage.savePreferences(preferences);
    }
}
