import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';
import glsl from 'vite-plugin-glsl';
import {createStyleImportPlugin} from 'vite-plugin-style-import';

export default defineConfig({
    // css: {
    //     preprocessorOptions: {
    //         sass: {
    //             javascriptEnabled: true
    //         }
    //     }
    // },
    plugins: [
        react(),
        glsl(),
        svgr(),
        // createStyleImportPlugin({
        //     libs: [
        //         {
        //             libraryName: 'antd',
        //             esModule: true,
        //             resolveStyle: (name) => `antd/es/${name}/style/index`
        //         }
        //     ]
        // })
    ],
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'tidy',
            fileName: (format) => {
                if (format === 'es') {
                    return 'tidy.es.mjs';
                }

                return `tidy.${format}.js`;
            }
        },
        rollupOptions: {
            external: ['react']
        }
    },
    resolve: {
        alias: {
            '@src': path.resolve(__dirname, './src'),
            '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap')
        }
    }
});
