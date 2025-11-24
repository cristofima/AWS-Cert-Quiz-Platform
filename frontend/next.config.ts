import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Turbopack configuration for independent frontend workspace
  // Frontend uses pnpm independently from Lambda workspace
  turbopack: {
    root: path.resolve(process.cwd()), // Absolute path to frontend directory
  },
};

export default nextConfig;
