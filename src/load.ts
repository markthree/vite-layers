import jiti, { type JITIOptions } from "jiti";
import { log } from "./log";
import { join } from "path";
import { cwd } from "./path";
import { argv, env } from "process";
import type { Extends } from "./type";
import { createFindUp, detectConfigFile } from "./fs";
import { builtinModules as _builtinModules } from "module";
import type { ConfigEnv, UserConfigExport } from "vite";
import { isArray, isFunction, isString } from "m-type-tools";

const builtinModules = [
  _builtinModules,
  _builtinModules.filter((m) => !m.startsWith("_")).map((m) => `node:${m}`),
].flat(1);

function isBuiltin(name: string) {
  return builtinModules.includes(name);
}

export const defaultLoadOptions: JITIOptions = {
  requireCache: false,
};

export function load(
  path: string,
  options: JITIOptions = defaultLoadOptions,
) {
  // @ts-ignore
  return jiti(null, {
    interopDefault: true,
    esmResolve: true,
    ...options,
  })(
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

interface Options {
  logger?: boolean;
}

export function loadLayer(
  layerExtends: Array<string | UserConfigExport>,
  env: ConfigEnv,
  options: Options = { logger: true },
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
          if (options.logger) {
            log.error(`layer hiatus(${isDep ? "Dep" : "Relative"}): ${l}`);
          }
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
