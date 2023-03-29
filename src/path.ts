import { cwd as _cwd } from "process";

export const cwd = _cwd();

export function slash(path: string) {
  return path.replace(/\\/g, "/");
}
