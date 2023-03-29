import { slash } from "./path";
import { dirname, join } from "path";
import { lstat } from "fs/promises";

export const DEFAULT_CONFIG_FILES = [
  "vite.config.js",
  "vite.config.mjs",
  "vite.config.ts",
  "vite.config.cjs",
  "vite.config.mts",
  "vite.config.cts",
];

export async function detectConfigFile(base: string) {
  for (const filename of DEFAULT_CONFIG_FILES) {
    const filePath = join(base, filename);
    if (await exist(filePath)) {
      return filePath;
    }
  }
}

export async function exist(path: string) {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    return false;
  }
}

export function createFindUp(target: string) {
  return async function (base: string) {
    base = slash(base);
    const paths = [join(base, target)];
    let total = base.split("/").length - 1;
    while (total) {
      base = dirname(base);
      paths.push(join(base, target));
      total--;
    }

    for (const path of paths) {
      if (await exist(path)) {
        return path;
      }
    }
    return null;
  };
}
