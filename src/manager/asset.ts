export class AssetManager {
    private parentElement: HTMLElement;
    private loadingLabel: HTMLElement;
    private loaderElem: HTMLElement;

    constructor(parentElement: HTMLElement) {
        this.parentElement = parentElement;
        this.loadingLabel = document.createElement("div");
        this.loadingLabel.classList.add("loading-label");
        this.loaderElem = this.parentElement.querySelector(".loader") as HTMLElement;
    }

    async loadAssets(imagesList: string[]) {
        this.loadingLabel.innerText = "Loading Assets...";
        const progressElem = document.createElement("span");
        this.loadingLabel.appendChild(progressElem);
        this.parentElement.appendChild(this.loadingLabel);
        try {
            await this.preloadImages(imagesList, (progress: number) => {
                progressElem.innerText = Math.round(progress * 100) + "%";
            });
        } catch (e) {
            const animations = this.loaderElem.getAnimations();
            animations[0].pause();
            throw e;
        }
        this.parentElement.removeChild(this.loadingLabel);
    }

    preloadImages(
        imagesList: string[],
        onProgressCallback: (progress: number) => void
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            var loadedCount = 0;

            const onAssetLoaded = (url: string) => {
                loadedCount++;
                const progress = loadedCount / imagesList.length;
                console.log(
                    "Asset loaded: " + url + ", Progress: " + Math.round(progress * 100) + "%"
                );

                onProgressCallback(progress);

                if (loadedCount === imagesList.length) {
                    resolve();
                }
            };

            const onAssetLoadError = (url: string) => {
                loadedCount++;
                const progress = loadedCount / imagesList.length;
                console.error(
                    "Asset did not load: " + url + ", Progress: " + Math.round(progress * 100) + "%"
                );

                this.loadingLabel.innerText = "Could not load asset: " + url;
                this.loadingLabel.style.color = "red";

                reject(new Error(`Could not load asset ${url}`));
            };

            imagesList.forEach((url) => {
                const fullUrl = import.meta.env.BASE_URL + url;
                this.loadingLabel.innerText = "Loading Asset: " + fullUrl;
                this.preloadImage(fullUrl).then(onAssetLoaded).catch(onAssetLoadError);
            });
        });
    }

    preloadImage(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = function () {
                resolve(url);
            };
            img.onerror = function () {
                console.error("Error loading image: " + url);
                reject(url);
            };
            img.src = url;
        });
    }
}
