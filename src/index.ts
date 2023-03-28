import { defu } from "defu";
import type { UserConfig } from "vite";
import { detectConfigFile, load } from "./core";
import type { MayBeArray } from "m-type-tools";

interface Options {
  extends: MayBeArray<string>;
}

export function Layers(options: Options & UserConfig): UserConfig {
  let { extends: layerExtends, ...userConfig } = options;
  if (typeof layerExtends === "string") {
    layerExtends = [layerExtends];
  }

  return defu(
    userConfig,
    ...layerExtends.map((l) => {
      const configFile = detectConfigFile(l);
      if (configFile) {
        return load(configFile);
      }
      return {};
    }),
  );
}
