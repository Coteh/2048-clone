/**
 * Theme manager for handling theme colors and status bar color updates
 */

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
    if (color.startsWith('rgb')) {
        return color;
    }

    // Use canvas to convert color to RGB
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
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
 * ThemeManager class handles theme color management and status bar updates
 */
export class ThemeManager {
    private currentThemeColor: string = '#000';
    private isDimmed: boolean = false;
    private overlayColor: string = 'rgba(0, 0, 0, 0.5)';
    private overlayAlpha: number = 0.5;

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
        const metaElement = document.querySelector("meta[name='theme-color']") as HTMLMetaElement;
        if (metaElement) {
            metaElement.content = color;
        }
        // Set body background color for iOS 26+ compatibility (iOS no longer reads theme-color meta tag)
        document.body.style.backgroundColor = color;
    }

    /**
     * Check if theme color is currently dimmed
     */
    isDimmedState(): boolean {
        return this.isDimmed;
    }
}
