import { cwd } from "./path";
import consola from "consola";
import { resolve } from "path";
import { gray, magenta, yellow } from "kolorist";
import { isString } from "m-type-tools";
import type { UserConfigExport } from "vite";

export const log = consola.withScope("vite-layers");

export function listLog(list: string[], color = gray) {
  return list.reduce((s, v, i) => {
    s += `${i === list.length - 1 ? "  └─ " : "  ├─ "}${color(v)}${
      i === list.length - 1 ? "" : "\n"
    }`;
    return s;
  }, "");
}

export function treeLog(layerExtends: Array<string | UserConfigExport>) {
  log.success(`layer - ${layerExtends.length}`);
  log.log(
    listLog(
      layerExtends.map((l) => {
        if (isString(l)) {
          return l.startsWith(".")
            ? `${l} - ${magenta(resolve(cwd, l))}`
            : `${l} - ${yellow("dep")}`;
        }
        return `Manual Import`;
      }),
    ),
  );
}
