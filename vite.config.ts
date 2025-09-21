import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // Disable type checking in development
      tsDecorators: true,
      plugins: mode === 'development' ? [] : undefined
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@radix-ui/react-dialog']
  },
  esbuild: {
    logOverride: { 
      'this-is-undefined-in-esm': 'silent',
    },
    ignoreAnnotations: true,
    // Skip type checking entirely in esbuild
    loader: 'tsx',
    target: 'es2020'
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode)
  }
}));