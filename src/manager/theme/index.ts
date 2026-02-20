import {
    STANDARD_THEME,
    LIGHT_THEME,
    DARK_THEME,
    SNOW_THEME,
    CLASSIC_THEME,
    STANDARD_STANDARD_TILESET,
    CLASSIC_CLASSIC_TILESET,
    CLASSIC_COLORFUL_TILESET,
    CLASSIC_INITIAL_COMMIT_TILESET,
    CLASSIC_MODERN_TILESET,
    COMPACT_BLOCK_STYLE,
    DARK_DARK_TILESET,
    LIGHT_LIGHT_TILESET,
    SNOW_CHRISTMAS_TILESET,
    SNOW_SNOW_TILESET,
    STANDARD_BLOCK_STYLE,
} from "../../consts";
import { AppIconManager } from "../app-icon";
import { SnowTheme } from "./snow";

const selectableThemes = [STANDARD_THEME, LIGHT_THEME, DARK_THEME, SNOW_THEME, CLASSIC_THEME];
const selectableTilesets: { [key: string]: string[] } = {
    [STANDARD_THEME]: [STANDARD_STANDARD_TILESET],
    [LIGHT_THEME]: [LIGHT_LIGHT_TILESET],
    [DARK_THEME]: [DARK_DARK_TILESET],
    [SNOW_THEME]: [SNOW_SNOW_TILESET, SNOW_CHRISTMAS_TILESET],
    [CLASSIC_THEME]: [
        CLASSIC_MODERN_TILESET,
        CLASSIC_CLASSIC_TILESET,
        CLASSIC_COLORFUL_TILESET,
        CLASSIC_INITIAL_COMMIT_TILESET,
    ],
};
const selectableBlockStyles = [STANDARD_BLOCK_STYLE, COMPACT_BLOCK_STYLE];

export interface Theme {
    apply(): void;
    teardown(): void;
}

/**
 * Blends two RGB colors together based on an alpha value
 * @param topColor - Top color in RGB format (e.g., "rgba(255, 0, 0, 0.5)" or "rgb(255, 0, 0)")
 * @param bottomColor - Bottom color in RGB format
 * @param alphaTop - Alpha value of the top color (0-1)
 * @returns Blended color in RGB format
 */
export function blendColors(topColor: string, bottomColor: string, alphaTop: number): string {
    // Extract RGB components from the top and bottom colors
    const top = topColor.match(/\d+/g)?.map(Number) || [0, 0, 0];
    const bottom = bottomColor.match(/\d+/g)?.map(Number) || [0, 0, 0];

    // Calculate the resulting RGB values
    const r = Math.round(alphaTop * top[0] + (1 - alphaTop) * bottom[0]);
    const g = Math.round(alphaTop * top[1] + (1 - alphaTop) * bottom[1]);
    const b = Math.round(alphaTop * top[2] + (1 - alphaTop) * bottom[2]);

    // Return the combined color in the RGB format
    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Converts a color string to RGB format
 * @param color - Color string (hex, named color, or rgb)
 * @returns Color in RGB format
 */
function colorToRgb(color: string): string {
    // If already in RGB format, return as is
    if (color.startsWith("rgb")) {
        return color;
    }

    // Use canvas to convert color to RGB
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        // Fallback: return the color as-is if canvas context is not available
        return color;
    }
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const imageData = ctx.getImageData(0, 0, 1, 1).data;
    return `rgb(${imageData[0]}, ${imageData[1]}, ${imageData[2]})`;
}

/**
 * ThemeManager facilitates the switching of the game's theme,
 * theme color calculations, and status bar updates
 */
export class ThemeManager {
    private currentTheme: string = STANDARD_THEME;
    private currentTileset: string = STANDARD_STANDARD_TILESET;
    private currentBlockStyle: string = STANDARD_BLOCK_STYLE;
    private currentThemeColor: string = "#000";
    private isDimmed: boolean = false;
    private overlayColor: string = "rgba(0, 0, 0, 0.5)";
    private overlayAlpha: number = 0.5;
    private appIconManager: AppIconManager;
    private selectableThemesMap: { [theme: string]: Theme };

    constructor(appIconManager: AppIconManager) {
        this.appIconManager = appIconManager;
        // Themes need to be initialized in the constructor, as some theme elements need to be loaded in the DOM first
        // and theme manager gets initialized after the DOM is loaded
        this.selectableThemesMap = {
            [SNOW_THEME]: new SnowTheme(),
        };
    }

    getCurrentTheme(): string {
        return this.currentTheme;
    }

    getCurrentTileset(): string {
        return this.currentTileset;
    }

    getCurrentBlockStyle(): string {
        return this.currentBlockStyle;
    }

    /**
     * Set the current theme color
     * @param color - Theme color to set
     */
    setThemeColor(color: string): void {
        this.currentThemeColor = color;
        if (!this.isDimmed) {
            this.applyThemeColor(color);
        } else {
            // If dimmed, recalculate and apply dimmed color
            this.applyDimmedThemeColor();
        }
    }

    /**
     * Get the current theme color (undimmed)
     */
    getCurrentThemeColor(): string {
        return this.currentThemeColor;
    }

    /**
     * Apply dimmed theme color (when dialog is open)
     */
    applyDimmedThemeColor(): void {
        this.isDimmed = true;
        const rgbThemeColor = colorToRgb(this.currentThemeColor);
        const dimmedColor = blendColors(this.overlayColor, rgbThemeColor, this.overlayAlpha);
        this.applyThemeColor(dimmedColor);
    }

    /**
     * Restore normal theme color (when dialog is closed)
     */
    restoreNormalThemeColor(): void {
        this.isDimmed = false;
        this.applyThemeColor(this.currentThemeColor);
    }

    /**
     * Apply a theme color to the meta tag and body background
     * @param color - Color to apply
     */
    private applyThemeColor(color: string): void {
        // Convert color to RGB format for consistency
        const rgbColor = colorToRgb(color);

        const metaElement = document.querySelector("meta[name='theme-color']") as HTMLMetaElement;
        if (metaElement) {
            metaElement.content = rgbColor;
        }
        // Set body background color for iOS 26+ compatibility (iOS no longer reads theme-color meta tag)
        document.body.style.backgroundColor = rgbColor;
    }

    /**
     * Check if theme color is currently dimmed
     */
    isDimmedState(): boolean {
        return this.isDimmed;
    }

    /**
     * Switches theme
     * @param theme - Theme to switch to
     */
    switchTheme(theme: string) {
        if (!theme || !selectableThemes.includes(theme)) {
            theme = STANDARD_THEME;
        }
        document.body.classList.remove(this.currentTheme);
        document.body.classList.remove(`tileset-${this.currentTileset}`);
        if (theme !== STANDARD_THEME) {
            document.body.classList.add(theme);
        }
        let themeColor = "#000";
        if (this.selectableThemesMap[this.currentTheme]) {
            this.selectableThemesMap[this.currentTheme].teardown();
        }
        if (this.selectableThemesMap[theme]) {
            this.selectableThemesMap[theme].apply();
        }
        switch (theme) {
            case STANDARD_THEME:
                themeColor = "bisque";
                break;
            case LIGHT_THEME:
                themeColor = "#FFF";
                break;
            case DARK_THEME:
                themeColor = "#1c1c1c";
                break;
            case SNOW_THEME:
                themeColor = "#020024";
                break;
            case CLASSIC_THEME:
                themeColor = "rgb(128, 128, 128)";
                break;
        }
        this.setThemeColor(themeColor);
        if (theme === CLASSIC_THEME) {
            this.appIconManager.setAppIcon("classic");
        } else {
            this.appIconManager.setAppIcon("standard");
        }
        this.currentTheme = theme;
        this.currentTileset = selectableTilesets[theme][0];
        document.body.classList.add(`tileset-${this.currentTileset}`);
    }

    /**
     * Switches tileset
     * @param theme - Theme that contains the desired tileset
     * @param tileset - Tileset to switch to
     */
    switchTileset(theme: string, tileset: string) {
        const selectableTilesetsForTheme = selectableTilesets[theme];
        if (!tileset || !selectableTilesetsForTheme.includes(tileset)) {
            tileset = selectableTilesetsForTheme[0];
        }
        document.body.classList.remove(`tileset-${this.currentTileset}`);
        // The "Initial Commit" tileset in 2048Clone theme has a special background and meta theme color
        if (theme === CLASSIC_THEME) {
            let themeColor = "rgb(128, 128, 128)";
            if (tileset === CLASSIC_INITIAL_COMMIT_TILESET) {
                themeColor = "#6495ed";
            }
            this.setThemeColor(themeColor);
        }
        this.currentTileset = tileset;
        document.body.classList.add(`tileset-${this.currentTileset}`);
    }

    /**
     * Switches block style
     * @param blockStyle - Block style to switch to
     */
    switchBlockStyle(blockStyle: string) {
        if (!blockStyle || !selectableBlockStyles.includes(blockStyle)) {
            blockStyle = selectableBlockStyles[0];
        }
        document.body.classList.remove(`block-style-${this.currentBlockStyle}`);
        this.currentBlockStyle = blockStyle;
        document.body.classList.add(`block-style-${this.currentBlockStyle}`);
    }
}
