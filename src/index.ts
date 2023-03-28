import { defu } from "defu";
import consola from "consola";
import type { UserConfig } from "vite";
import { detectConfigFile, load } from "./core";
import { isArray, isObject } from "m-type-tools";
import { isString, MayBeArray } from "m-type-tools";

const log = consola.withScope("vite-layers");

interface Options {
  extends: MayBeArray<string | UserConfig>;
}

export function Layers(options: Options & UserConfig): UserConfig {
  let { extends: layerExtends, ...userConfig } = options;
  if (!isArray(layerExtends)) {
    layerExtends = [layerExtends];
  }

  return defu(
    userConfig,
    ...layerExtends.map((l, i) => {
      if (isObject(l)) {
        return l;
      }
      if (isString(l)) {
        const configFile = detectConfigFile(l);
        if (configFile) {
          return load(configFile);
        }
      }

      log.warn(`The extension type is not supported: ${isString(l) ? l : i}`);
      return {};
    }),
  );
}
