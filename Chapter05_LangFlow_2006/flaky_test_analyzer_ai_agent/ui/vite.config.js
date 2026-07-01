import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const langflowUrl = env.LANGFLOW_URL || 'http://localhost:7860';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: langflowUrl,
          changeOrigin: true,
          // LangFlow OPTIONS returns 422 — skip preflight by forcing same-origin
          configure(proxy) {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('origin', langflowUrl);
            });
          },
        },
      },
    },
  };
});
