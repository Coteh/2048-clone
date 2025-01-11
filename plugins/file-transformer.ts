import * as fs from "fs";
import * as path from "path";

export default function fileTransformerPlugin({ input, transformer, output }) {
    if (!input || !transformer || !output) {
        throw new Error('fileTransformerPlugin requires "input", "transformer", and "output" options.');
    }

    return {
        name: 'file-transformer',
        async buildStart() {
            // Do not perform emit file operation in watch mode (ie. `vite dev`)
            if (this.meta.watchMode) return;

            // Read and process the file during the build start phase
            const filePath = path.resolve(input);
            let fileContent;

            try {
                fileContent = fs.readFileSync(filePath, 'utf-8');
            } catch (err) {
                throw new Error(`Failed to read file: ${input} - ${err.message}`);
            }

            // Transform the content using the provided transformer function
            const transformedContent = await transformer(fileContent);

            // Emit the processed file as an asset
            this.emitFile({
                type: 'asset',
                fileName: output,
                source: transformedContent,
            });
        },
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                if (req.url === `/${output}`) {
                    try {
                        const content = fs.readFileSync(input, 'utf-8');
                        const transformed = await transformer(content);
                        res.setHeader('Content-Type', 'text/html');
                        res.end(transformed);
                    } catch (err) {
                        next(err);
                    }
                } else {
                    next();
                }
            });
        },
    };
}
