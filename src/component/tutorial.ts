import pointingHand from "../../images/PointingHand.png";
import { renderNotification } from "../render";
import { isMobile } from "../util/mobile";

export class Tutorial {
    howToPlayElements: HTMLImageElement[];

    timeouts: NodeJS.Timeout[];
    
    isMobileTutorialPlaying: boolean = false;
    isDesktopTutorialPlaying: boolean = false;

    constructor() {
        if (isMobile()) {
            this.timeouts = new Array<NodeJS.Timeout>(6);
            this.howToPlayElements = new Array<HTMLImageElement>(2);
        } else {
            this.timeouts = new Array<NodeJS.Timeout>(1);
            this.howToPlayElements = new Array<HTMLImageElement>(1);
        }
    }

    renderHowToPlay() {
        if (isMobile()) {
            if (this.isMobileTutorialPlaying) {
                return;
            }
            const howToPlay1ID = "how-to-play-1";
            const howToPlay2ID = "how-to-play-2";
            this.howToPlayElements[0] = document.getElementById(howToPlay1ID) as HTMLImageElement;
            this.howToPlayElements[1] = document.getElementById(howToPlay2ID) as HTMLImageElement;
            if (!this.howToPlayElements[0]) {
                this.howToPlayElements[0] = document.createElement("img");
                this.howToPlayElements[0].src = pointingHand;
                this.howToPlayElements[0].className = "pointing-hand";
                this.howToPlayElements[0].style.top = "25%";
                this.howToPlayElements[0].id = howToPlay1ID;
                document.body.appendChild(this.howToPlayElements[0]);
            }
            this.howToPlayElements[0].style.opacity = "1";
            if (!this.howToPlayElements[1]) {
                this.howToPlayElements[1] = document.createElement("img");
                this.howToPlayElements[1].src = pointingHand;
                this.howToPlayElements[1].className = "pointing-hand";
                this.howToPlayElements[1].style.left = "25%";
                this.howToPlayElements[1].style.opacity = "0";
                this.howToPlayElements[1].id = howToPlay2ID;
                document.body.appendChild(this.howToPlayElements[1]);
            }

            clearTimeout(this.timeouts[0]);
            clearTimeout(this.timeouts[1]);
            clearTimeout(this.timeouts[2]);
            clearTimeout(this.timeouts[3]);
            clearTimeout(this.timeouts[4]);
            clearTimeout(this.timeouts[5]);
            this.timeouts[0] = setTimeout(() => {
                this.howToPlayElements[0].style.top = "75%";
                this.timeouts[1] = setTimeout(() => {
                    this.howToPlayElements[0].style.opacity = "0";
                    this.timeouts[2] = setTimeout(() => {
                        this.howToPlayElements[1].style.opacity = "1";
                        this.timeouts[3] = setTimeout(() => {
                            this.howToPlayElements[1].style.left = "75%";
                            this.timeouts[4] = setTimeout(() => {
                                this.howToPlayElements[1].style.opacity = "0";
                                this.howToPlayElements[0].style.top = "25%";
                                this.timeouts[5] = setTimeout(() => {
                                    this.howToPlayElements[1].style.left = "25%";
                                    this.isMobileTutorialPlaying = false;
                                }, 1000);
                            }, 1000);
                        });
                    }, 1000);
                }, 1000);
            });
            this.isMobileTutorialPlaying = true;
        } else {
            if (this.isDesktopTutorialPlaying) {
                return;
            }
            // TODO: Render desktop graphic for how to play
            renderNotification("Use arrow keys to play");
            this.timeouts[0] = setTimeout(() => {
                this.isDesktopTutorialPlaying = false;
            }, 1500);
            this.isDesktopTutorialPlaying = true;
        }
    }
}
