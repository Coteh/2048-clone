import { defineConfig, loadEnv } from "vite";
import path from "path";
import * as fs from "fs";
import { version } from "./package.json";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import * as childProcess from "child_process";

const commitHash = childProcess.execSync("git rev-parse --short HEAD").toString();

// @ts-ignore Resolve type issue with function parameter
export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), "");
    return {
        assetsInclude: ["**/*.md"],
        define: {
            GAME_VERSION: JSON.stringify(version),
            COMMIT_HASH: JSON.stringify(commitHash),
            VITE_DEV_DEPLOYMENT: JSON.stringify(process.env.VITE_DEV_DEPLOYMENT || false),
        },
        build: {
            outDir: path.resolve(__dirname, "build"),
            terserOptions: {
                // @ts-ignore TODO: Resolve type error with this field
                ecma: 6,
                compress: { drop_console: true },
                output: { comments: false, beautify: false },
            },
            commonjsOptions: {
                transformMixedEsModules: true,
            },
            sourcemap: true, // Source map generation must be turned on for Sentry sourcemap uploading
        },
        server: {
            host: true,
            https: env.HTTPS
                ? {
                      key: fs.readFileSync("./ssl/localhost+2-key.pem"),
                      cert: fs.readFileSync("./ssl/localhost+2.pem"),
                  }
                : undefined,
        },
        plugins: [
            {
                name: "Nonprod App Labels",
                apply: "build",
                closeBundle() {
                    const inputDir = path.resolve(__dirname, "public");
                    const outputDir = path.resolve(__dirname, "build");

                    fs.readdirSync(inputDir).forEach((file) => {
                        if (file.startsWith("icon")) {
                            let srcPath = path.join(inputDir, file);
                            let destPath = path.join(outputDir, file.replace(".png", "_nonprod.png"));

                            const cmd = `magick ${srcPath} -gravity south -fill "white" -undercolor "#000000AA" -pointsize 42 -font "Lato-Black" -annotate +0+10 "${env.DEPLOY_ENV}" ${destPath}`;
                            try {
                                childProcess.execSync(cmd);
                                console.log(`Processed ${file} -> ${path.basename(destPath)}`);
                                srcPath = destPath;
                                destPath = srcPath.replace("_nonprod.png", ".png")
                                fs.renameSync(srcPath, destPath)
                                console.log(`Renamed ${srcPath} -> ${destPath}`);
                            } catch (e) {
                                console.error(`Error processing ${file}: ${e.message}`);
                            }
                        }
                    });
                },
            },
            // Must go after all other plugins
            sentryVitePlugin({
                org: "james-cote",
                project: "2048-clone",
                authToken: env.SENTRY_AUTH_TOKEN,
            }),
        ],
    };
});
