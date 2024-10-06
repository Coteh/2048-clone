import { renderDialog, createDialogContentFromTemplate } from "../../render";

export class HowToPlay {
    step1VisualsInterval?: NodeJS.Timeout;
    step1KeyboardInterval?: NodeJS.Timeout;

    constructor() {
        
    }

    renderHowToPlay() {
        const howToPlayElem = createDialogContentFromTemplate("#how-to-play");
        const keyboardElem = howToPlayElem.querySelector(".keyboard-visual") as HTMLElement;
        const touchscreenElem = howToPlayElem.querySelector(".pointing-hand") as HTMLElement;
        const arrowElems = ["up-arrow", "left-arrow", "down-arrow", "right-arrow"].map(id => howToPlayElem.querySelector(`#${id}`));
        renderDialog(howToPlayElem, true);

        let i = 0;
        this.step1KeyboardInterval = setInterval(() => {
            const index = Math.floor(i / 2) % arrowElems.length;
            const arrowElem = arrowElems[index] as HTMLDivElement;
            if (i % 2 === 0) {
                arrowElem.classList.add("pressed");
            } else {
                arrowElem.classList.remove("pressed");
            }
            i++;
        }, 500);

        let j = 0;
        this.step1VisualsInterval = setInterval(() => {
            if (j % 2 === 0) {
                keyboardElem.style.opacity = "0";
                touchscreenElem.style.opacity = "1";
            } else {
                touchscreenElem.style.opacity = "0";
                keyboardElem.style.opacity = "1";
            }
            j++;
        }, 2500);
    }
}