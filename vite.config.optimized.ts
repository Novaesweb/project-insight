import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// Optimized Vite configuration for better bundle size and performance
export default defineConfig({
  plugins: [
    react({
      // Enable fast refresh in development
      fastRefresh: true,
      // Optimize imports
      jsxImportSource: '@emotion/react',
      // Enable SWC minification
      plugins: [
        // Tree shaking for unused exports
        '@swc/plugin-transform-react-jsx',
      ],
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'NovaesWeb - Painel Administrativo',
        short_name: 'NovaesWeb',
        description: 'Sistema completo de gestão empresarial com arquitetura digital avançada',
        theme_color: '#7b1fa2',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  
  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Build optimizations
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    
    // Chunk optimization
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          query: ['@tanstack/react-query'],
          supabase: ['@supabase/supabase-js'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
          forms: ['react-hook-form', '@hookform/resolvers'],
          charts: ['recharts'],
          icons: ['lucide-react'],
        },
        
        // Asset optimization
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const extType = info[info.length - 1];
          
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/.test(assetInfo.name || '')) {
            return `media/[name]-[hash][extname]`;
          }
          
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name || '')) {
            return `images/[name]-[hash][extname]`;
          }
          
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name || '')) {
            return `fonts/[name]-[hash][extname]`;
          }
          
          return `assets/[name]-[hash][extname]`;
        },
        
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      },
      
      // External dependencies that shouldn't be bundled
      external: [],
    },
    
    // Compression
    cssCodeSplit: true,
    
    // Report compressed size
    reportCompressedSize: true,
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },

  // Development server optimization
  server: {
    host: '127.0.0.1',
    port: 8080,
    strictPort: true,
    
    // Enable HMR with optimized reloading
    hmr: {
      overlay: true,
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        '@supabase/supabase-js',
        'date-fns',
        'clsx',
        'tailwind-merge',
      ],
      
      // Exclude from optimization
      exclude: ['@vite/client', '@vite/env'],
    },
  },

  // Preview server optimization
  preview: {
    port: 4173,
    strictPort: true,
  },

  // Environment variables
  define: {
    // Remove console.log in production
    ...(process.env.NODE_ENV === 'production' && {
      'console.log': 'void 0',
      'console.warn': 'void 0',
      'console.error': 'void 0',
    }),
  },

  // CSS optimization
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },

  // Experimental features
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `/${filename}` };
      } else {
        return { relative: true };
      }
    },
  },
});
