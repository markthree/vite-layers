import jiti from "jiti";
import { log } from "./log";
import { join } from "path";
import { cwd } from "./path";
import { isBuiltin } from "module";
import { argv, env } from "process";
import type { Extends } from "./type";
import { createFindUp, detectConfigFile } from "./fs";
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
        if (isBuiltin(l)) {
          return {};
        }

        const isDep = !l.startsWith(".");
        if (isDep) {
          const hasNodeModulesPrefix = l.startsWith("node_modules");
          const nr = hasNodeModulesPrefix ? l : join("node_modules", l);
          const findDep = createFindUp(nr);
          const nl = await findDep(cwd);
          if (nl) {
            l = nl;
          }
        }

        const configFile = await detectConfigFile(l);
        if (configFile) {
          const result = await load(configFile);
          if (isFunction(result)) {
            return result(env);
          }
          return result;
        } else {
          log.error(`layer hiatus(${isDep ? "Dep" : "Relative"}): ${l}`);
        }
      }

      if (isFunction(l)) {
        return l(env);
      }

      return l;
    }),
  );
}

export function detectMode() {
  const hasModeIndex = argv.findIndex((a) => a === "--mode" || a === "-m");
  if (hasModeIndex !== -1) {
    return argv[hasModeIndex + 1];
  }
  return env.NODE_ENV || "development";
}

export function detectCommand() {
  return argv.includes("build") ? "build" : "serve";
}
