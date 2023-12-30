import type { MayBeArray, MayBePromise } from "m-type-tools";
import type { ConfigEnv, UserConfig, UserConfigExport } from "vite";

export type Extends = MayBeArray<string | UserConfigExport>;

export type ConfigFn = (env: ConfigEnv) => MayBePromise<UserConfig>;

export type Options = {
  extends?: Extends;
  normalize?: (
    userConfig: UserConfig,
  ) => MayBePromise<UserConfig>;
  logger?: boolean;
  vite?: MayBePromise<UserConfig> | ConfigFn;
};
