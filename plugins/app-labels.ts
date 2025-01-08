import path from "path";
import * as fs from "fs";
import * as childProcess from "child_process";

interface FontOptions {
    color: string;
    size: number;
    family: string;
}

interface IconConfig {
    name: string;
    font: FontOptions;
}

interface PluginOptions {
    source: string;
    output: string;
    environment: string;
    icons: IconConfig[];
    position: 'top' | 'bottom' | { x: number, y: number };
}

export default function appIconLabel(options: PluginOptions) {
    const { source, output, environment, icons, position } = options;

    const buildIcons = (env: string) => {
        try {
            childProcess.execSync('magick -version', { stdio: 'ignore' });
        } catch (e) {
            console.warn('ImageMagick is not installed. Skipping icon labeling.');
            return;
        }

        // Make output directory
        if (!fs.existsSync(output)) {
            fs.mkdirSync(output, { recursive: true });
        }

        icons.forEach(icon => {
            const { name, font } = icon;
            const srcPath = path.join(source, name);
            const destPath = path.join(output, name.replace(".png", `_${env}.png`));

            const positionOption = typeof position === 'string'
                ? (position === 'bottom' ? '+0+10' : '+0-10')
                : `+${position.x}+${position.y}`;

            const cmd = `magick ${srcPath} -strip -gravity south -fill "${font.color}" -undercolor "#000000AA" -pointsize ${font.size} -font ${font.family} -annotate ${positionOption} "${env}" ${destPath}`;
            try {
                childProcess.execSync(cmd);
                console.log(`Processed ${name} -> ${path.basename(destPath)}`);
            } catch (e) {
                console.error(`Error processing ${name}: ${e.message}`);
            }
        });
    };

    return {
        name: "vite-plugin-app-icon-label",

        closeBundle() {
            // Do not perform icon build or replacement in watch mode (ie. `vite dev`)
            if (this.meta.watchMode) return;
            buildIcons(environment);
        },

        configureServer(server) {
            buildIcons(environment);
            server.middlewares.use((req, res, next) => {
                if (req.url.startsWith("/icon")) {
                    const iconPath = path.join(output, req.url.replace(".png", `_${environment}.png`));
                    if (fs.existsSync(iconPath)) {
                        res.setHeader("Content-Type", "image/png");
                        res.end(fs.readFileSync(iconPath));
                        return;
                    }
                }
                next();
            });
        },
    };
}
