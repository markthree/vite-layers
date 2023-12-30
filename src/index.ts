import { defu } from "defu";
import { treeLog } from "./log";
import { isFunction } from "m-type-tools";
import type { ConfigFn, Options } from "./type";
import type { ConfigEnv, UserConfig, UserConfigFn } from "vite";
import {
  detectCommand,
  detectMode,
  loadLayer,
  normalizeLayerExtends,
} from "./load";

export function detectEnv(config: UserConfig) {
  return {
    mode: detectMode(),
    command: detectCommand(),
    ssrBuild: !!config.build?.ssr,
  } as const;
}

export async function Layers(
  options: Options = {},
): Promise<UserConfig | UserConfigFn> {
  const { vite = {}, extends: layerExtends = [], normalize, logger = true } =
    options;

  const normalizedLayerExtends = normalizeLayerExtends(layerExtends);

  if (isFunction(vite)) {
    const configFn: ConfigFn = async function (env: ConfigEnv) {
      const config = await vite(env) as UserConfig;
      const extendedConfigs = await loadLayer(normalizedLayerExtends, env, {
        logger,
      });
      if (logger) {
        treeLog(normalizedLayerExtends);
      }
      const userConfig = defu(config, ...extendedConfigs);
      if (isFunction(normalize)) {
        return normalize(userConfig);
      }
      return userConfig;
    };

    return configFn;
  }

  const config = await vite;

  const extendedConfigs = await loadLayer(
    normalizedLayerExtends,
    detectEnv(config),
    { logger },
  );

  if (logger) {
    treeLog(normalizedLayerExtends);
  }

  const userConfig = defu(config, ...extendedConfigs);
  if (isFunction(normalize)) {
    return normalize(userConfig);
  }
  return userConfig;
}

export * from "./fs";
export * from "./load";
export * from "./log";
export * from "./path";
export * from "./type";
export type { ConfigEnv, UserConfig, UserConfigFn } from "vite";
