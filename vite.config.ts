import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
    plugins: [
        react(),
        glsl(),
        svgr()
    ],
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'DiagramLib',
            fileName: (format) => `diagram-lib.${format}.js`,
        },
        rollupOptions: {
            external: [
                'react',
                'react-dom'
            ],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM'
                }
            }
        }
    },
    resolve: {
        alias: {
            '@src': path.resolve(__dirname, './src'),
            '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap')
        }
    }
});
