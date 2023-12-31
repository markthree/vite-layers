import { defu } from "defu";
import { isFunction } from "m-type-tools";
import type { ConfigEnv, UserConfig, UserConfigFn } from "vite";
import {
  detectCommand,
  detectMode,
  loadLayer,
  normalizeLayerExtends,
} from "./load";
import { treeLog } from "./log";
import { WatchLayer } from "./plugin";
import type { ConfigFn, Options } from "./type";

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
  const {
    vite = {},
    extends: layerExtends = [],
    normalize,
    logger = true,
    watch = true,
  } = options;

  const normalizedLayerExtends = normalizeLayerExtends(layerExtends);

  if (isFunction(vite)) {
    const configFn: ConfigFn = async function (env: ConfigEnv) {
      const config: UserConfig = await vite(env);
      return createUserConfig({ config, env });
    };
    return configFn;
  }

  const config = await vite;

  return createUserConfig({
    config,
    env: detectEnv(config),
  });

  async function createUserConfig(
    options: {
      env: ConfigEnv;
      config: UserConfig;
    },
  ) {
    const { env, config } = options;
    const extendedConfigs = await loadLayer(normalizedLayerExtends, env, {
      logger,
    });

    if (logger) {
      treeLog(normalizedLayerExtends);
    }

    const userConfig = defu(config, ...extendedConfigs);
    if (watch) {
      userConfig.plugins ??= [];
      userConfig.plugins.push(WatchLayer(normalizedLayerExtends));
    }
    if (isFunction(normalize)) {
      return normalize(userConfig);
    }
    return userConfig;
  }
}

export type { ConfigEnv, UserConfig, UserConfigFn } from "vite";
export * from "./fs";
export * from "./load";
export * from "./log";
export * from "./path";
export * from "./plugin";
export * from "./type";
