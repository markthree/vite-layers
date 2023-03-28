import { defu } from "defu";
import { treeLog } from "./log";
import { isFunction } from "m-type-tools";
import type { ConfigEnv, UserConfigExport } from "vite";
import type { Config, ConfigFn, Options } from "./type";
import {
  detectCommand,
  detectMode,
  loadLayer,
  normalizeLayerExtends,
} from "./load";

export async function Layers(options: Options = {}): Promise<UserConfigExport> {
  const { vite = {}, extends: layerExtends = [] } = options;

  const normalizedLayerExtends = normalizeLayerExtends(layerExtends);

  if (isFunction(vite)) {
    const configFn: ConfigFn = async function (env: ConfigEnv) {
      const config = await vite(env) as Config;
      const extendedConfigs = await loadLayer(normalizedLayerExtends, env);
      treeLog(normalizedLayerExtends);
      return defu(config, ...extendedConfigs);
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

  console.log(detectMode());

  treeLog(normalizedLayerExtends);

  return defu(config, ...extendedConfigs);
}
