import feather from "feather-icons";
import { AnimationManager } from "./manager/animation";
import { GameBoard, GameState } from "./game";

interface RenderBoardOptions {
    theme?: string;
}

export const renderBoard = (
    parentElem: HTMLElement,
    gameState: GameState,
    animationManager: AnimationManager,
    options: RenderBoardOptions
) => {
    const board = gameState.board;
    const newBlocks = animationManager.newBlocks;
    const movedBlocks = animationManager.movedBlocks;
    const mergedBlocks = animationManager.mergedBlocks;
    console.log("rendering new blocks", newBlocks);
    console.log("rendering merged blocks", mergedBlocks);
    const rowsBackElem = parentElem.querySelector(".back-rows") as HTMLElement;
    const rowsBaseElem = parentElem.querySelector(".base-rows") as HTMLElement;
    rowsBackElem.innerHTML = "";
    rowsBaseElem.innerHTML = "";
    console.log("--------");
    board.forEach((row, y) => {
        console.log(row);
        renderBackRow(rowsBackElem, row.length);

        const rowContainer = document.createElement("div");
        rowContainer.className = "input-row";

        for (let x = 0; x < row.length; x++) {
            const numberBox = renderNumberBox(rowContainer, row[x]);
            if (row[x] > 0) {
                if (animationManager.isAnimationEnabled) {
                    if (
                        newBlocks &&
                        newBlocks.some((newBlock) => newBlock.x === x && newBlock.y === y)
                    ) {
                        numberBox.style.transform = "scale(0.1)";
                        setTimeout(() => {
                            numberBox.style.transform = "";
                        }, 0);
                    }
                    const oldBlockPos = movedBlocks[y][x];
                    if (oldBlockPos) {
                        numberBox.style.top = `${48 * -(y - oldBlockPos.y)}px`;
                        numberBox.style.left = `${48 * -(x - oldBlockPos.x)}px`;
                        setTimeout(() => {
                            numberBox.style.top = "0px";
                            numberBox.style.left = "0px";
                            if (options.theme === "classic") {
                                applyClassicThemeBlockStyles(numberBox, x, y, row, board);
                            }
                        }, 0);
                    } else {
                        if (options.theme === "classic") {
                            applyClassicThemeBlockStyles(numberBox, x, y, row, board);
                        }
                    }
                    if (
                        mergedBlocks &&
                        mergedBlocks.some(
                            (mergedBlock) => mergedBlock.x === x && mergedBlock.y === y
                        )
                    ) {
                        numberBox.style.transform = "scale(0.1)";
                        setTimeout(() => {
                            numberBox.style.transform = "scale(1.5)";
                            setTimeout(() => {
                                numberBox.style.transform = "";
                            }, 100);
                        }, 0);
                    }
                } else {
                    if (options.theme === "classic") {
                        applyClassicThemeBlockStyles(numberBox, x, y, row, board);
                    }
                }
            }
        }

        rowsBaseElem.appendChild(rowContainer);
    });
    console.log("--------");
};

export const renderBackRow = (parentElem: HTMLElement, rowLength: number) => {
    const container = document.createElement("div");
    container.className = "back-row";

    for (let i = 0; i < rowLength; i++) {
        renderNumberBox(container, 0);
    }

    parentElem.appendChild(container);

    return container;
};

export const renderNumberBox = (parentElem: HTMLElement, number: number) => {
    const numberBox = document.createElement("div");
    numberBox.classList.add("box");
    const letterElem = document.createElement("span");
    letterElem.classList.add("box-letter");
    if (number > 0) {
        letterElem.innerText = number.toString();
        numberBox.classList.add(`number-block`);
        numberBox.classList.add(`block-${number}`);
    }
    letterElem.style.fontSize = "16px";
    numberBox.appendChild(letterElem);
    parentElem.appendChild(numberBox);
    return numberBox;
};

export const renderDialog = (content: HTMLElement, fadeIn: boolean, closable: boolean = true) => {
    // Close any currently existing dialogs
    const dialogElem = document.querySelector(".dialog");
    if (dialogElem) dialogElem.remove();

    const template = document.querySelector("#dialog") as HTMLTemplateElement;
    const clone = template.content.cloneNode(true) as HTMLElement;

    const overlayBackElem = document.querySelector(".overlay-back") as HTMLElement;

    const closeBtn = clone.querySelector("button.close") as HTMLElement;
    if (closable) {
        closeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const dialog = document.querySelector(".dialog") as HTMLElement;
            dialog.remove();
            overlayBackElem.style.display = "none";
        });
    } else {
        closeBtn.style.display = "none";
    }

    const dialogContent = clone.querySelector(".dialog-content") as HTMLElement;
    dialogContent.appendChild(content);

    if (fadeIn) {
        const dialog = clone.querySelector(".dialog") as HTMLElement;
        dialog.style.opacity = "0";
        // TODO: Instead of copying over "translate(-50%, -50%)" from the css style,
        // have it base itself off of a computed transform property
        dialog.style.transform = "translate(-50%, -50%) scale(0.5)";
        setTimeout(() => {
            const dialog = document.querySelector(".dialog") as HTMLElement;
            dialog.style.opacity = "";
            dialog.style.transform = "translate(-50%, -50%)";
        }, 10);
    }

    document.body.appendChild(clone);

    overlayBackElem.style.display = "block";

    (document.querySelector(".dialog [data-feather='x']") as HTMLElement).innerText = "X";
    feather.replace();
};

export const renderNotification = (msg: string) => {
    const template = document.querySelector("#notification") as HTMLTemplateElement;
    const clone = template.content.cloneNode(true) as HTMLElement;

    const message = clone.querySelector(".notification-message") as HTMLElement;
    message.innerText = msg;

    const notificationArea = document.querySelector(".notification-area") as HTMLElement;
    notificationArea.appendChild(clone);

    // The original reference is a DocumentFragment, need to find the notification element in the DOM tree to continue using it
    const notificationList = notificationArea.querySelectorAll(
        ".notification-area > .notification"
    ) as NodeListOf<HTMLElement>;
    const notification = notificationList[notificationList.length - 1];

    setTimeout(() => {
        notification.style.opacity = "0";

        setTimeout(() => {
            notification.remove();
        }, 1000);
    }, 1000);
};

export const createDialogContentFromTemplate = (tmplContentId: string) => {
    const contentTmpl = document.querySelector(tmplContentId) as HTMLTemplateElement;
    const contentClone = contentTmpl.content.cloneNode(true) as HTMLElement;

    return contentClone;
};

const applyClassicThemeBlockStyles = (
    numberBox: HTMLElement,
    x: number,
    y: number,
    row: number[],
    board: GameBoard
) => {
    const invisibleBorder = "1px solid rgba(0,0,0,0)";
    if (x === row.length - 1) {
        numberBox.style.borderRight = invisibleBorder;
    }
    if (x === 0 || (x > 0 && row[x - 1] !== 0)) {
        numberBox.style.borderLeft = invisibleBorder;
    }
    if (y === 0 || (y > 0 && board[y - 1][x] !== 0)) {
        numberBox.style.borderTop = invisibleBorder;
    }
    if (y === board.length - 1) {
        numberBox.style.borderBottom = invisibleBorder;
    }
};
