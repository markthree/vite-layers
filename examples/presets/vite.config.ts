import { defineConfig } from "vite";

export default defineConfig({
  plugins: [{
    name: "presets",
    buildStart() {
      console.log("presets");
    },
  }],
});
