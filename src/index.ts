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

export async function Layers(
  options: Options = {},
): Promise<UserConfig | UserConfigFn> {
  const { vite = {}, extends: layerExtends = [], normalize } = options;

  const normalizedLayerExtends = normalizeLayerExtends(layerExtends);

  if (isFunction(vite)) {
    const configFn: ConfigFn = async function (env: ConfigEnv) {
      const config = await vite(env) as UserConfig;
      const extendedConfigs = await loadLayer(normalizedLayerExtends, env);
      treeLog(normalizedLayerExtends);
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
    {
      mode: detectMode(),
      command: detectCommand(),
      ssrBuild: !!config.build?.ssr,
    },
  );

  treeLog(normalizedLayerExtends);

  const userConfig = defu(config, ...extendedConfigs);
  if (isFunction(normalize)) {
    return normalize(userConfig);
  }
  return userConfig;
}
