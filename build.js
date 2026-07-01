// =====================================================
// LaunchFuture — Production Build Script
// -----------------------------------------------------
// Bundles js/index.js (and everything it imports,
// including the "ethers" npm package) into ONE classic
// <script> file: dist/launchfuture.bundle.js
//
// Why this exists:
// Wallet in-app browsers (MetaMask Mobile, TokenPocket,
// imToken, Bitget, OKX, etc.) run on WebViews that very
// often fail to load <script type="module"> correctly,
// and they also cannot reliably fetch nested ES module
// imports from a remote CDN (https://esm.sh/ethers@6).
// Bundling to a single IIFE script removes both problems:
//   1. No "type=module" needed -> works in every WebView.
//   2. ethers is compiled in locally -> no runtime CDN
//      dependency, no version drift, works offline too.
//
// Usage:
//   npm install
//   npm run build      -> writes dist/launchfuture.bundle.js
//   npm run watch       -> rebuilds on file changes (dev)
// =====================================================

import * as esbuild from "esbuild";
import { mkdirSync } from "node:fs";

const isWatch = process.argv.includes("--watch");

mkdirSync("dist", { recursive: true });

const buildOptions = {
  entryPoints: ["js/index.js"],
  outfile: "dist/launchfuture.bundle.js",
  bundle: true,
  format: "iife",          // classic script, no ESM required at runtime
  platform: "browser",
  target: ["es2018", "chrome80", "safari13", "ios13"], // wide WebView compatibility
  minify: !isWatch,
  sourcemap: isWatch ? "inline" : false,
  legalComments: "none",
  logLevel: "info",
};

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log("Watching for changes... (Ctrl+C to stop)");
} else {
  await esbuild.build(buildOptions);
  console.log("Build complete -> dist/launchfuture.bundle.js");
}
