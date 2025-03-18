const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      path: "path-browserify",
      os: "os-browserify/browser",
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
