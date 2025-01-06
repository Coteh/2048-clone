import feather from "feather-icons";

export class ActionIconManager {
    private iconsLoaded: boolean = false;

    constructor() {
        this.iconsLoaded = false;
    }

    public loadIcons() {
        feather.replace();
        this.iconsLoaded = true;
    }

    public changeIcon(parentElement: HTMLElement, newIcon: string) {
        let childElement = parentElement.querySelector("svg") as HTMLOrSVGElement;
        if (childElement) {
            (childElement as SVGElement).remove();
            childElement = document.createElement("i");
        } else {
            childElement = parentElement.querySelector("i") as HTMLElement;
        }
        (childElement as HTMLElement).setAttribute("data-feather", newIcon);
        parentElement.appendChild(childElement as HTMLElement);
        if (this.iconsLoaded) {
            feather.replace();
        }
    }
}

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
