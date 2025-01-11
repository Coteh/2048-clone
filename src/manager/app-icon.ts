export class AppIconManager {
    constructor() {}

    public setAppIcon(type: string) {
        this.setAppleTouchIcon(type);
        this.setFavicon(type);
    }

    // TODO: Alter manifest.json icons as well so that it would work on Android and other platforms too
    private setAppleTouchIcon(type: string) {
        const appleTouchIcon = document.querySelector(
            "link[rel='apple-touch-icon']"
        ) as HTMLLinkElement;
        switch (type) {
            case "classic":
                appleTouchIcon.href = "icon152_classic.png";
                break;
            default:
                appleTouchIcon.href = "icon152.png";
                break;
        }
    }

    private setFavicon(type: string) {
        const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
        switch (type) {
            case "classic":
                favicon.href = "favicon_classic.ico";
                break;
            default:
                favicon.href = "favicon.ico";
                break;
        }
    }
}
