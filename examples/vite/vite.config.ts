import { Layers } from "vite-layers";

export default Layers({
  vite: {
    server: {
      port: 3000,
    },
  },
  extends: "../vite-vue",
});
