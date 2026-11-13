import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base 使用相对路径：构建产物可直接放在 GitHub Pages 的
// https://<user>.github.io/<repo>/ 子路径下，也兼容用户主页与自定义域名。
// 本应用是单页应用、没有前端路由，因此相对路径不会引起刷新 404。
export default defineConfig({
  plugins: [react()],
  base: './',
});
