import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    host: '0.0.0.0', // 全てのホストからのアクセスを許可
    port: 3000, // 使用するポート番号を指定
    cors: true, // CORS設定を簡略化するために true に設定
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src/node_modules/',
      'react-router-dom': 'react-router-dom', // react-router-dom のエイリアスを設定
      'js-cookie': 'js-cookie' // 正しいエイリアスに修正
    }
  },
  build: {
    rollupOptions: {
      external: ['react', 'react-dom']
    }
  }
});