import { Layers } from "vite-layers";

export default Layers({
  vite: {
    server: {
      port: 3000,
    },
  },
  normalize(userConfig) {
    console.log(userConfig);
    return userConfig;
  },
  extends: [
    "presets",
    "../vite-vue",
  ],
});
