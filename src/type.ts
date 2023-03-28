import type { MayBeArray, MayBePromise } from "m-type-tools";
import type { ConfigEnv, UserConfig, UserConfigExport } from "vite";

export type Extends = MayBeArray<string | UserConfigExport>;

export interface Config extends UserConfig {
  extends?: Extends;
}

export type ConfigFn = (env: ConfigEnv) => MayBePromise<UserConfig>;

export type Options = {
  extends?: Extends;
  vite?: MayBePromise<Config> | ConfigFn;
};
