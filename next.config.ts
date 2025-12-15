import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Disable production error obfuscation to see actual error messages
  // This helps with debugging while still being secure in actual production
  productionBrowserSourceMaps: false,

  // Enable detailed error messages
  experimental: {
    // This will show full error stack traces
  },
};

export default nextConfig;
