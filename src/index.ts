import { defu } from "defu";
import { env } from "process";
import { treeLog } from "./log";
import { isFunction } from "m-type-tools";
import { loadLayer, normalizeLayerExtends } from "./load";
import type { ConfigEnv, UserConfigExport } from "vite";
import type { Config, ConfigExport, ConfigFn } from "./type";

export async function Layers(config: ConfigExport): Promise<UserConfigExport> {
  if (isFunction(config)) {
    const configFn: ConfigFn = async function (env: ConfigEnv) {
      const userConfig = await config(env) as Config;
      const layerExtends = normalizeLayerExtends(userConfig.extends);
      const extendedConfigs = await loadLayer(layerExtends, env);
      treeLog(layerExtends);
      return defu(userConfig, ...extendedConfigs);
    };

    return configFn;
  }

  const userConfig = await config;

  const layerExtends = normalizeLayerExtends(userConfig.extends);

  const extendedConfigs = await loadLayer(
    layerExtends,
    {
      mode: env.NODE_ENV || "development",
      command: process.argv.includes("build") ? "build" : "serve",
    },
  );

  treeLog(layerExtends);

  return defu(userConfig, ...extendedConfigs);
}
