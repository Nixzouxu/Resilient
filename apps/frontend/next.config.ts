import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Menghasilkan server mandiri berukuran kecil agar mudah dan cepat dideploy lewat Docker.
  output: "standalone",
};

export default nextConfig;
