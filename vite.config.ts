import { defineConfig, loadEnv } from "vite";
import path from "path";
import * as fs from "fs";
import { version } from "./package.json";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import * as childProcess from "child_process";
import appIconLabel from './plugins/app-labels';
import fileTransformerPlugin from "./plugins/file-transformer";
import * as marked from "marked";

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
            appIconLabel({
                source: './public',
                output: './dist/icons',
                environment: env.DEPLOY_ENV || 'DEV',
                icons: [
                    {
                        name: 'icon128.png',
                        font: {
                            color: '#FFFFFF',
                            size: 36,         
                            family: './public/fonts/Lato/Lato-Black.ttf'   
                        }
                    },
                    {
                        name: 'icon128_classic.png',
                        font: {
                            color: '#FFFFFF',
                            size: 36,         
                            family: './public/fonts/Lato/Lato-Black.ttf'   
                        }
                    },
                    {
                        name: 'icon152.png',
                        font: {
                            color: '#FFFFFF',
                            size: 42,         
                            family: './public/fonts/Lato/Lato-Black.ttf'   
                        }
                    },
                    {
                        name: 'icon152_classic.png',
                        font: {
                            color: '#FFFFFF',
                            size: 42,         
                            family: './public/fonts/Lato/Lato-Black.ttf'   
                        }
                    },
                ],
                position: 'bottom',
            }),
            fileTransformerPlugin({
                input: 'CHANGELOG.md',
                transformer: (content) => marked.parse(content),
                output: 'CHANGELOG.html',
            }),
            // Must go after all other plugins
            sentryVitePlugin({
                org: "james-cote",
                project: "2048-clone",
                authToken: env.SENTRY_AUTH_TOKEN,
            }),
        ],
    };
});
