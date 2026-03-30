import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        proxy: {
            '^/(?!@vite|@react-refresh|@id|@fs|resources|build|node_modules|favicon\\.ico)': {
                target: process.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
