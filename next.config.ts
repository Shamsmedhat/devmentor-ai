import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["pdf-parse"],
  experimental: {
    // Lecture mp3s reach `ingestVideoAction` as FormData; default cap is 1 MB.
    serverActions: { bodySizeLimit: "50mb" },
    proxyClientMaxBodySize: "50mb",
  },
};

export default withNextIntl(nextConfig);
