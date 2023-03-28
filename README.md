# vite-layers

layers support for vite

<br />

## Motivation

I want to inherit the configuration of the vite project

<br />

## Features

- [] inherit configuration file
    - [] npm package
    - [x] relative position

<br />

## Usage

### install

```shell
npm i vite-layers -D
```

### configuration

```ts
// vite.config.ts
import { Layers } from "vite-layers";

export default Layers({
  extends: "../vite-vue", // The target directory you want to inherit
});
```

<br />

## inspiration

Inspired by [nuxt/layers](https://nuxt.com/docs/getting-started/layers)

<br />

## License

Made with [markthree](https://github.com/markthree)

Published under [MIT License](./LICENSE).