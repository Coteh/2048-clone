import { Plugin } from 'vite';

interface PluginOptions {
    environment: string;
}

// Plugin to remove canonical link in dev mode
export function removeCanonicalInDev(options: PluginOptions): Plugin {
    const { environment } = options;
    return {
        name: 'remove-canonical-in-dev',
        transformIndexHtml: {
            order: 'pre',
            handler(html, ctx) {
                // Only remove canonical link in dev mode (either Vite dev server is running, or deploy environment is DEV)
                if (ctx.server || environment === 'DEV') {
                    return html.replace(/<link[^>]+rel=["']canonical["'][^>]*>/gi, '');
                }
                return html;
            },
        },
    };
}
