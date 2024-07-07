const KEY_HOLD_TIMEOUT_MS = 500;

const renderBoard = (parentElem, gameState) => {
    const board = gameState.board;
    const newBlocks = gameState.newBlocks;
    const movedBlocks = gameState.movedBlocks;
    const mergedBlocks = gameState.mergedBlocks;
    console.log("rendering new blocks", newBlocks)
    console.log("rendering merged blocks", mergedBlocks)
    const rowsBackElem = parentElem.querySelector(".back-rows");
    const rowsBaseElem = parentElem.querySelector(".wordle-rows");
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
            if (isAnimationEnabled) {
                if (newBlocks && newBlocks.some(newBlock => newBlock.x === x && newBlock.y === y)) {
                    numberBox.style.transform = "scale(0.1)";
                    setTimeout(() => {
                        numberBox.style.transform = "";
                    }, 0);
                }
                if (movedBlocks[y][x]) {
                    const oldBlockPos = movedBlocks[y][x];
                    numberBox.style.top = `${(48 * -(y - oldBlockPos.y))}px`;
                    numberBox.style.left = `${(48 * -(x - oldBlockPos.x))}px`;
                    setTimeout(() => {
                        numberBox.style.top = "0px";
                        numberBox.style.left = "0px";
                    }, 0);
                }
                if (mergedBlocks && mergedBlocks.some(mergedBlock => mergedBlock.x === x && mergedBlock.y === y)) {
                    numberBox.style.transform = "scale(0.1)";
                    setTimeout(() => {
                        numberBox.style.transform = "scale(1.5)";
                        setTimeout(() => {
                            numberBox.style.transform = "";
                        }, 100);
                    }, 0);
                }
            }
        }

        rowsBaseElem.appendChild(rowContainer);
    });
    console.log("--------");
};

const renderBackRow = (parentElem, rowLength) => {
    const container = document.createElement("div");
    container.className = "back-row";

    for (let i = 0; i < rowLength; i++) {
        renderNumberBox(container, 0);
    }

    parentElem.appendChild(container);

    return container;
};

const renderNumberBox = (parentElem, number) => {
    const numberBox = document.createElement("div");
    numberBox.classList.add("box");
    const letterElem = document.createElement("span");
    letterElem.classList.add("box-letter");
    if (number > 0) {
        letterElem.innerText = number.toString();
        numberBox.classList.add(`block-${number}`);
    }
    letterElem.style.fontSize = "16px";
    numberBox.appendChild(letterElem);
    parentElem.appendChild(numberBox);
    return numberBox;
};

const renderDialog = (content, fadeIn, closable = true) => {
    // Close any currently existing dialogs
    const dialogElem = document.querySelector(".dialog");
    if (dialogElem) dialogElem.remove();

    const template = document.querySelector("#dialog");
    const clone = template.content.cloneNode(true);

    const overlayBackElem = document.querySelector(".overlay-back");

    const closeBtn = clone.querySelector("button.close");
    if (closable) {
        closeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const dialog = document.querySelector(".dialog");
            dialog.remove();
            overlayBackElem.style.display = "none";
        });
    } else {
        closeBtn.style.display = "none";
    }

    const dialogContent = clone.querySelector(".dialog-content");
    dialogContent.appendChild(content);

    if (fadeIn) {
        const dialog = clone.querySelector(".dialog");
        dialog.style.opacity = 0;
        dialog.style.top = "100%";
        setTimeout(() => {
            const dialog = document.querySelector(".dialog");
            dialog.style.opacity = "";
            dialog.style.top = "";
        }, 10);
    }

    document.body.appendChild(clone);

    overlayBackElem.style.display = "block";

    if (typeof feather !== "undefined") {
        feather.replace();
    } else {
        document.querySelector(".dialog [data-feather='x']").innerText = "X";
    }
};

const renderNotification = (msg) => {
    const template = document.querySelector("#notification");
    const clone = template.content.cloneNode(true);

    const message = clone.querySelector(".notification-message");
    message.innerText = msg;

    const notificationArea = document.querySelector(".notification-area");
    notificationArea.appendChild(clone);

    // The original reference is a DocumentFragment, need to find the notification element in the DOM tree to continue using it
    const notificationList = notificationArea.querySelectorAll(
        ".notification-area > .notification"
    );
    const notification = notificationList[notificationList.length - 1];

    setTimeout(() => {
        notification.style.opacity = 0;

        setTimeout(() => {
            notification.remove();
        }, 1000);
    }, 1000);
};

const createDialogContentFromTemplate = (tmplContentId) => {
    const contentTmpl = document.querySelector(tmplContentId);
    const contentClone = contentTmpl.content.cloneNode(true);

    return contentClone;
};
