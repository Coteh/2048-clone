import { GameBoard } from "../../game";
import { AnimationManager } from "../../manager/animation";
import { renderDialog, createDialogContentFromTemplate, renderBoard } from "../../render";
import { isMobile } from "../../util/mobile";

import "./index.css";

export class HowToPlay {
    step1VisualsInterval?: NodeJS.Timeout;
    step1KeyboardInterval?: NodeJS.Timeout;
    stepIntervals: NodeJS.Timeout[];

    stepBoards: GameBoard[];

    constructor() {
        this.stepBoards = new Array(6);
        this.stepBoards[0] = [
            [0, 0, 2, 0],
            [0, 0, 0, 0],
            [4, 0, 0, 0],
            [0, 0, 0, 0],
        ];
        this.stepBoards[1] = [
            [0, 0, 0, 4],
            [0, 0, 0, 0],
            [4, 0, 0, 0],
            [4, 0, 0, 0],
        ];
        this.stepBoards[2] = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [8, 0, 0, 0],
            [0, 0, 0, 0],
        ];
        this.stepBoards[3] = [
            [0, 0, 0, 8],
            [0, 4, 8, 2],
            [0, 0, 2, 16],
            [0, 32, 512, 2048],
        ];
        this.stepBoards[4] = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 8, 16, 32],
            [8, 16, 32, 64],
        ];
        this.stepBoards[5] = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 2, 32],
            [0, 8, 64, 128],
        ];
        this.stepIntervals = new Array<NodeJS.Timeout>(3);
    }

    render() {
        const howToPlayElem = createDialogContentFromTemplate("#how-to-play");
        const keyboardElem = howToPlayElem.querySelector(".keyboard-visual") as HTMLElement;
        const touchscreenElem = howToPlayElem.querySelector(".pointing-hand") as HTMLElement;
        const arrowElems = ["right-arrow"].map((id) => howToPlayElem.querySelector(`#${id}`));
        const stepSections = new Array(6)
            .fill(0)
            .map(
                (_, i) =>
                    howToPlayElem.querySelector(`.section[data-step='${i + 1}']`) as HTMLElement,
            );

        renderDialog(howToPlayElem, {
            fadeIn: true,
            style: {
                width: "75%",
                height: "75%",
                maxWidth: "600px",
            },
        });
        const dialog = document.querySelector(".dialog") as HTMLDialogElement;
        dialog.addEventListener("close", (e) => {
            console.log("Closing dialog. Removing listeners...");
            clearInterval(this.step1KeyboardInterval);
            clearInterval(this.step1VisualsInterval);
            this.stepIntervals.forEach((interval) => clearInterval(interval));
        });

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

        this.step1VisualsInterval = setInterval(() => {
            if (keyboardElem.style.opacity === "1") {
                keyboardElem.style.opacity = "0";
                touchscreenElem.style.opacity = "1";
                const animation = touchscreenElem.getAnimations()[0];
                animation.cancel();
                animation.play();
            } else {
                touchscreenElem.style.opacity = "0";
                keyboardElem.style.opacity = "1";
            }
        }, 2500);

        // If on mobile device, show the swipe graphic first for step 1, otherwise show the keyboard graphic
        if (isMobile()) {
            keyboardElem.style.opacity = "0";
            touchscreenElem.style.opacity = "1";
        } else {
            touchscreenElem.style.opacity = "0";
            keyboardElem.style.opacity = "1";
        }

        const step1 = () => {
            this.stepBoards[0] = [
                [0, 0, 2, 0],
                [0, 0, 0, 0],
                [4, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            const step1Animation = new AnimationManager();
            step1Animation.isAnimationEnabled = true;
            // @ts-ignore
            renderBoard(stepSections[0], this.stepBoards[0], step1Animation, {
                blockStyle: "compact",
            });
            const stepOverlay = stepSections[0].querySelector(".overlay-space") as HTMLElement;
            const stepBoardElement = stepSections[0].querySelector(".base-rows") as HTMLElement;
            stepOverlay.style.width = stepBoardElement.offsetWidth.toString();
            setTimeout(() => {
                this.stepBoards[0] = [
                    [0, 0, 0, 2],
                    [0, 0, 0, 0],
                    [0, 0, 0, 4],
                    [0, 0, 2, 0],
                ];
                step1Animation.addNewBlock({
                    x: 2,
                    y: 3,
                });
                step1Animation.updateBlocks(2, 0, 3, 0, 0);
                step1Animation.updateBlocks(0, 2, 3, 2, 0);
                renderBoard(stepSections[0], this.stepBoards[0], step1Animation, {
                    blockStyle: "compact",
                });
            }, 1250);
        };

        const step2 = () => {
            this.stepBoards[1] = [
                [0, 0, 0, 4],
                [0, 0, 0, 0],
                [4, 0, 0, 0],
                [4, 0, 0, 0],
            ];
            const step2Animation = new AnimationManager();
            step2Animation.isAnimationEnabled = true;
            // @ts-ignore
            renderBoard(stepSections[1], this.stepBoards[1], step2Animation, {
                blockStyle: "compact",
            });
            setTimeout(() => {
                // step2Animation.
                this.stepBoards[1] = [
                    [0, 0, 0, 0],
                    [0, 0, 2, 0],
                    [0, 0, 0, 0],
                    [8, 0, 0, 4],
                ];
                step2Animation.addNewBlock({
                    x: 2,
                    y: 1,
                });
                step2Animation.updateBlocks(0, 2, 0, 3, 0);
                step2Animation.updateBlocks(3, 0, 3, 3, 0);
                renderBoard(stepSections[1], this.stepBoards[1], step2Animation, {
                    blockStyle: "compact",
                });
            }, 1250);
        };

        const step3 = () => {
            this.stepBoards[2] = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [8, 0, 0, 0],
                [0, 0, 0, 0],
            ];
            const step3Animation = new AnimationManager();
            step3Animation.isAnimationEnabled = true;
            // @ts-ignore
            renderBoard(stepSections[2], this.stepBoards[2], step3Animation, {
                blockStyle: "compact",
            });
            setTimeout(() => {
                this.stepBoards[2] = [
                    [8, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 4, 0, 0],
                    [0, 0, 0, 0],
                ];
                step3Animation.addNewBlock({
                    x: 1,
                    y: 2,
                });
                step3Animation.updateBlocks(0, 2, 0, 0, 0);
                renderBoard(stepSections[2], this.stepBoards[2], step3Animation, {
                    blockStyle: "compact",
                });
            }, 1250);
        };

        this.stepBoards.forEach((_, i) => {
            renderBoard(stepSections[i], this.stepBoards[i], new AnimationManager(), {
                blockStyle: "compact",
            });
        });

        this.stepIntervals[0] = setInterval(step1, 2500);
        this.stepIntervals[1] = setInterval(step2, 2500);
        this.stepIntervals[2] = setInterval(step3, 2500);

        step1();
        step2();
        step3();
    }
}
