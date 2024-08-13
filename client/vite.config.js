export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT || 3002, // Use Render's assigned port in production, or default to 3002 for local development
    open: true,
    proxy:
      process.env.NODE_ENV === "development"
        ? {
            "/graphql": {
              target: "http://localhost:3001",
              secure: false,
              changeOrigin: true,
            },
          }
        : {},
  },
});
