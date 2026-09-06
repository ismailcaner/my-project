import { createRequire } from "module"

const require = createRequire(import.meta.url)

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
})

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/og",
        destination: "/api/og",
      },
    ]
  },
}

export default withPWA(nextConfig)
