import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import os from 'os';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    return {
        cacheDir: '.vite',
        optimizeDeps: {
            force: true,
            disabled: false,
        },
        build: {
            outDir: 'dist',
            emptyOutDir: true,
            rollupOptions: {
                cache: false,
            }
        },
        server: {
            port: 3005,
            host: '0.0.0.0',
            watch: {
                usePolling: true, // Better for external volumes
            }
        },
        plugins: [react()],
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        },
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: './test/setup.ts',
            css: true,
            coverage: {
                provider: 'v8',
                reporter: ['text', 'json', 'html'],
                exclude: [
                    'node_modules/',
                    'test/',
                    '*.config.ts',
                    '*.config.js',
                ],
            },
        },
    };
});
