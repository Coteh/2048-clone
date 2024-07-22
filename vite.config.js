import { defineConfig } from 'vite';
import path from "path";
import { version } from './package.json';

export default defineConfig({
    define: {
        GAME_VERSION: JSON.stringify(version),
    },
    build: {
        outDir: path.resolve(__dirname, 'build'),
        terserOptions: {
            ecma: 6,
            compress: { drop_console: true },
            output: { comments: false, beautify: false },
        },
        commonjsOptions: {
            transformMixedEsModules: true,
        }
    },
    server: {
        host: true,
    },
});
