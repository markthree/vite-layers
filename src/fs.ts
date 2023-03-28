import { join } from "path";
import { existsSync } from "fs";

export const DEFAULT_CONFIG_FILES = [
  "vite.config.js",
  "vite.config.mjs",
  "vite.config.ts",
  "vite.config.cjs",
  "vite.config.mts",
  "vite.config.cts",
];

export function detectConfigFile(base: string) {
  for (const filename of DEFAULT_CONFIG_FILES) {
    const filePath = join(base, filename);
    if (existsSync(filePath)) {
      return filePath;
    }
  }
}