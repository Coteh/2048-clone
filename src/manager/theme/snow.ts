import { Theme } from ".";

export class SnowTheme implements Theme {
    private snowEmbed: HTMLElement | null;

    constructor() {
        this.snowEmbed = document.getElementById("embedim--snow");
        console.log("snow embed", this.snowEmbed);
        if (this.snowEmbed) {
            this.snowEmbed.style.display = "none";
        }
    }

    apply() {
        if (this.snowEmbed) {
            this.snowEmbed.style.display = "initial";
        }
    }

    teardown() {
        if (this.snowEmbed) {
            this.snowEmbed.style.display = "none";
        }
    }
}
