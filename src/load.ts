import jiti, { type JITIOptions } from "jiti";
import { isArray, isFunction, isString } from "m-type-tools";
import { builtinModules as _builtinModules } from "module";
import { join } from "path";
import { argv, env } from "process";
import type { ConfigEnv, UserConfigExport } from "vite";
import { createFindUp, detectConfigFile } from "./fs";
import { log } from "./log";
import { cwd } from "./path";
import type { Extends } from "./type";

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
        const configFile = await findLayerConfigFile(l);
        if (configFile) {
          const result = await load(configFile);
          if (isFunction(result)) {
            return result(env);
          }
          return result;
        }
        if (options.logger) {
          log.error(`layer hiatus → ${l}`);
        }
        return {};
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

export async function findLayerConfigFile(layerExtendStr: string) {
  if (isBuiltin(layerExtendStr)) {
    return;
  }
  const isDep = !layerExtendStr.startsWith(".");
  if (isDep) {
    const hasNodeModulesPrefix = layerExtendStr.startsWith("node_modules");
    const nr = hasNodeModulesPrefix
      ? layerExtendStr
      : join("node_modules", layerExtendStr);
    const findDep = createFindUp(nr);
    const nl = await findDep(cwd);
    if (nl) {
      layerExtendStr = nl;
    }
  }
  const configFile = await detectConfigFile(layerExtendStr);
  return configFile;
}
