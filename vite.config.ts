import { defineConfig } from "vite";
import path from "path";
import { version } from "./package.json";

export default defineConfig({
    define: {
        GAME_VERSION: JSON.stringify(version),
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
    },
    server: {
        host: true,
    },
});