import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';
import glsl from 'vite-plugin-glsl';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        react(),
        glsl(),
        svgr(),
        dts({
            tsconfigPath: './tsconfig.build.json'
        })
    ],
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'diagram-lib',
            fileName: (format) => `${format}/index.js`,
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
