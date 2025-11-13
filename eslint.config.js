const nextConfig = require("eslint-config-next/core-web-vitals");

module.exports = [
  // Global ignores - applies to all configs
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/dist/**",
      "**/.vercel/**",
      "**/coverage/**",
      "**/*.config.js",
      "**/next-env.d.ts",
    ],
  },
  // Spread Next.js core-web-vitals config (includes React, TypeScript, accessibility rules)
  ...nextConfig,
];
