import jiti from "jiti";
import { Extends } from "./type";
import { detectConfigFile } from "./fs";
import type { ConfigEnv, UserConfigExport } from "vite";
import { isArray, isFunction, isString } from "m-type-tools";

export function load(path: string) {
  // @ts-ignore
  return jiti(null, { interopDefault: true, esmResolve: true })(
    path,
  );
}

export function normalizeLayerExtends(layerExtends?: Extends) {
  if (layerExtends) {
    if (!isArray(layerExtends)) {
      return [layerExtends];
    }
    return layerExtends;
  }
  return [];
}

export function loadLayer(
  layerExtends: Array<string | UserConfigExport>,
  env: ConfigEnv,
): Promise<UserConfigExport[]> {
  return Promise.all(
    layerExtends.map(async (l) => {
      if (isString(l)) {
        const configFile = detectConfigFile(l);
        if (configFile) {
          const result = await load(configFile);
          if (isFunction(result)) {
            return result(env);
          }
          return result;
        }
      }

      if (isFunction(l)) {
        return l(env);
      }

      return l;
    }),
  );
}
