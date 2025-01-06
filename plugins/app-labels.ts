import path from "path";
import * as fs from "fs";
import * as childProcess from "child_process";

export default function appLabels(env: Record<string, string>) {
    const publicDir = path.resolve(process.cwd(), "public");
    const buildDir = path.resolve(process.cwd(), "build");

    const buildIcons = () => {
        fs.readdirSync(publicDir).forEach((file) => {
            if (file.startsWith("icon")) {
                const srcPath = path.join(publicDir, file);
                const destPath = path.join(buildDir, file.replace(".png", "_nonprod.png"));

                const cmd = `magick ${srcPath} -gravity south -fill "white" -undercolor "#000000AA" -pointsize 42 -font ./public/fonts/Lato/Lato-Black.ttf -annotate +0+10 "${env.DEPLOY_ENV}" ${destPath}`;
                try {
                    childProcess.execSync(cmd);
                    console.log(`Processed ${file} -> ${path.basename(destPath)}`);
                } catch (e) {
                    console.error(`Error processing ${file}: ${e.message}`);
                }
            }
        });
    };

    return {
        name: "app-labels",

        closeBundle() {
            // Do not perform icon build or replacement in watch mode (ie. `vite dev`)
            if (this.meta.watchMode) return;
            buildIcons();
            fs.readdirSync(publicDir).forEach((file) => {
                if (file.startsWith("icon")) {
                    const srcPath = path.join(buildDir, file.replace(".png", "_nonprod.png"));
                    const destPath = srcPath.replace("_nonprod.png", ".png");
                    fs.renameSync(srcPath, destPath);
                    console.log(`Renamed ${srcPath} -> ${destPath}`);
                }
            });
        },

        configureServer(server) {
            buildIcons();
            server.middlewares.use((req, res, next) => {
                // console.log("req", req);
                if (req.url.startsWith("/icon")) {
                    console.log("req.url", req.url);
                    // Send response for nonprod icon instead
                    const iconPath = path.join(
                        process.cwd(),
                        "build",
                        req.url.replace(".png", "_nonprod.png")
                    );
                    console.log("iconPath", iconPath);
                    if (fs.existsSync(iconPath)) {
                        console.log("Sending nonprod icon");
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
