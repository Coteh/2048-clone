import pointingHand from "../../assets/images/PointingHand.png";
import { isMobile } from "../../util/mobile";

import "./index.css";

export class Tutorial {
    howToPlayElements: HTMLElement[];

    timeouts: NodeJS.Timeout[];
    intervals: NodeJS.Timeout[];

    isMobileTutorialPlaying: boolean = false;
    isDesktopTutorialPlaying: boolean = false;

    constructor() {
        if (isMobile()) {
            this.timeouts = new Array<NodeJS.Timeout>(6);
            this.intervals = new Array<NodeJS.Timeout>(0);
            this.howToPlayElements = new Array<HTMLImageElement>(2);
        } else {
            this.timeouts = new Array<NodeJS.Timeout>(2);
            this.intervals = new Array<NodeJS.Timeout>(1);
            this.howToPlayElements = new Array<HTMLImageElement>(1);
        }
    }

    stop() {
        this.howToPlayElements.forEach((elem) => elem.remove());
        this.timeouts.forEach((timeout) => clearTimeout(timeout));
        this.intervals.forEach((interval) => clearTimeout(interval));
        this.isDesktopTutorialPlaying = false;
        this.isMobileTutorialPlaying = false;
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
                (this.howToPlayElements[0] as HTMLImageElement).src = pointingHand;
                this.howToPlayElements[0].className = "pointing-hand";
                this.howToPlayElements[0].style.top = "25%";
                this.howToPlayElements[0].id = howToPlay1ID;
                document.body.appendChild(this.howToPlayElements[0]);
            }
            this.howToPlayElements[0].style.opacity = "1";
            if (!this.howToPlayElements[1]) {
                this.howToPlayElements[1] = document.createElement("img");
                (this.howToPlayElements[1] as HTMLImageElement).src = pointingHand;
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

            const elem = document.createElement("div");
            elem.innerHTML = `
            <div style="background-color: var(--notification-background-color); padding: 2rem; margin: 1rem; border-radius: 0.25rem;">
                <span>Use arrow keys to play</span>
            </div>
            <div>
                <div>
                    <div class="keyboard-button" style="opacity: 0;">←</div>
                    <div class="keyboard-button" id="up-arrow">↑</div>
                    <div class="keyboard-button" style="opacity: 0;">→</div>
                </div>
                <div>
                    <div class="keyboard-button" id="left-arrow">←</div>
                    <div class="keyboard-button" id="down-arrow">↓</div>
                    <div class="keyboard-button" id="right-arrow">→</div>
                </div>
            </div>
            `;
            elem.style.position = "fixed";
            elem.style.top = "25%";
            elem.style.left = "50%";
            elem.style.transform = "translate(-50%,-50%)";
            elem.style.display = "flex";
            elem.style.flexDirection = "column";
            elem.style.alignItems = "center";
            document.body.appendChild(elem);

            this.howToPlayElements[0] = elem;

            let i = 0;
            const arrowIDs = ["up-arrow", "left-arrow", "down-arrow", "right-arrow"];
            const interval = setInterval(() => {
                if (i / 2 >= arrowIDs.length) {
                    return;
                }
                const arrowElem = document.getElementById(
                    arrowIDs[Math.floor(i / 2)]
                ) as HTMLDivElement;
                if (i % 2 === 0) {
                    arrowElem.classList.add("pressed");
                } else {
                    arrowElem.classList.remove("pressed");
                }
                i++;
            }, 500);
            this.intervals[0] = interval;

            this.timeouts[0] = setTimeout(() => {
                elem.remove();
                clearInterval(interval);
            }, 5000);
            this.timeouts[1] = setTimeout(() => {
                this.isDesktopTutorialPlaying = false;
            }, 5500);
            this.isDesktopTutorialPlaying = true;
        }
    }
}
