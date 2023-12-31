import type { Plugin, UserConfigExport } from "vite";
import { findLayerConfigFile } from "./load";
import { isString } from "m-type-tools";
import { slash } from "./path";
import { resolve } from "path";
import { realpath } from "fs/promises";

/**
 * vite plugin for restarting when changing configuration files
 */
export function WatchLayer(
  layerExtends: Array<string | UserConfigExport>,
): Plugin {
  return {
    name: "vite-plugin-watch-layer",
    apply: "serve",
    enforce: "post",
    async configureServer(server) {
      const layerExtendStrs = layerExtends.filter((l) =>
        isString(l)
      ) as string[];
      const mayBeConfigFiles = await Promise.all(
        layerExtendStrs.map((l) => findLayerConfigFile(l)),
      );
      const configFiles = mayBeConfigFiles.filter(Boolean) as string[];
      const realConfigFiles = await Promise.all(configFiles.map((f) => {
        return realpath(f);
      }));
      server.watcher.add(realConfigFiles).on("all", async (_, path) => {
        if (realConfigFiles.includes(path)) {
          await server.restart();
        }
      });
    },
  };
}
