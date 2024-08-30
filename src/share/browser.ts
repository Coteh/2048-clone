import { renderDialog, renderNotification } from "../render";

const isiOS = () => {
    return navigator.userAgent.match(/ipad|iphone/i);
};

// Use legacy document.execCommand API for older browsers that do not have navigator.clipboard
// https://stackoverflow.com/a/30810322
const fallbackCopyShareText = (shareText: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = shareText;

    // Prevent this element from appearing in the accessibility tree
    textArea.ariaHidden = "true";
    textArea.tabIndex = -1;

    // Prevent browser from scrolling to the bottom of page and focusing on the element
    textArea.style.top = "-100px";
    textArea.style.left = "-100px";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    if (isiOS()) {
        // iOS-specific solution adapted from https://stackoverflow.com/a/46858939
        const range = document.createRange();
        range.selectNodeContents(textArea);
        const selection = window.getSelection()!;
        selection.removeAllRanges();
        selection.addRange(range);
        textArea.setSelectionRange(0, 9999999);
    } else {
        textArea.select();
    }

    let successful = false;
    try {
        successful = document.execCommand("copy");
        if (successful) {
            const message = document.createElement("span");
            message.innerText = "Copied to clipboard!";
            renderDialog(message, true);
        } else {
            const message = document.createElement("span");
            message.innerText = "Could not copy to clipboard";
            renderDialog(message, true);
        }
    } catch (e) {
        console.error(e);
        const message = document.createElement("span");
        message.innerText = "Could not copy to clipboard due to error";
        renderDialog(message, true);
    } finally {
        textArea.remove();
    }
    return successful;
};

export const copyShareText = async (shareText: string) => {
    if (!navigator.clipboard) {
        return fallbackCopyShareText(shareText);
    }
    try {
        await navigator.clipboard.writeText(shareText);
    } catch (e) {
        console.error(e);
        renderNotification("Could not copy to clipboard due to error");
        return false;
    }
    renderNotification("Copied to clipboard!");
    return true;
};

function dataURLtoFile(dataurl: string, filename: string) {
    var arr = dataurl.split(","),
        // @ts-ignore
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

export const triggerShare = async (shareText: string, shareImage: string) => {
    const imageFile = dataURLtoFile(shareImage, "myfile.png");
    const data: ShareData = {
        title: "My score!",
        text: shareText,
        files: [imageFile],
    };
    if (navigator.canShare && !navigator.canShare(data)) {
        console.log(
            "Share data cannot be validated for share sheet, falling back to clipboard for share..."
        );
        // Fallback to copy to clipboard
        return copyShareText(shareText);
    }
    if (!navigator.share) {
        console.log(
            "Share sheet not available for this browser, falling back to clipboard for share..."
        );
        // Fallback to copy to clipboard
        return copyShareText(shareText);
    }
    try {
        await navigator.share(data);
    } catch (err: any) {
        if (err.name === "NotAllowedError") {
            console.log("Sharing was not allowed by the user or platform");
            // Fallback to copy to clipboard
            return copyShareText(shareText);
        } else if (err.name === "AbortError") {
            console.log("User aborted share operation");
        } else if (err.name === "NotSupportedError") {
            console.error("Share sheet operation not supported");
            // Fallback to copy to clipboard
            return copyShareText(shareText);
        } else {
            console.error("Error sharing content:", err);
            renderNotification("Could not share due to error");
            return false;
        }
    }
    return true;
};
