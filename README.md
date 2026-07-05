# CSS FCP

A lightweight utility to optimize First Contentful Paint (FCP) by managing and prioritizing critical CSS delivery for better Web Vitals.

### Contents

1. [Compatibility](#compatibility)
2. [Installation](#installation)
   1. [NPM](#npm)
3. [Usage](#usage)
   1. [Remove unused CSS](#remove-unused-css)
   2. [Extract critical CSS](#extract-critical-css)
4. [Author](#author)
5. [License](#license)

## Compatibility

Engine | Version
------- | -------
Node | >= 20

## Installation

### NPM

```bash
npm install css-fcp
```

## Usage

```js
// pages.config.js
export default [
  {
    name: 'home',
    url: '/'
  },
  {
    name: 'page',
    url: '/page-name/'
  },
  {
    name: 'blog',
    url: '/blog/'
  },
  {
    name: 'post',
    url: '/blog/post-name/'
  }
]
```

### Remove unused CSS

```js
import { removeUnused } from 'css-fcp'
import pages from './pages.config.js'

const siteUrl = 'https://example.com'
const cssPath = './assets/css/'
for (const page of pages) {
  removeUnused(siteUrl, page, {
    css: [
      `${cssPath}${page.name}.css`
    ],
    output: `${cssPath}${page.name}.css`
  })
  console.log('Done:', page.name)
}
```

### Extract critical CSS

```js
import { extractCritical } from 'css-fcp'
import pages from './pages.config.js'

const siteUrl = 'https://example.com'
const cssPath = './assets/css/'
for (const page of pages) {
  extractCritical(siteUrl, page, {
    css: `${cssPath}${page.name}.css`,
    target: {
      css: `${cssPath}critical/${page.name}.css`,
      uncritical: `${cssPath}uncritical/${page.name}.css`
    },
    width: 2000,
    height: 1080,
    rebase: asset => `${siteUrl}/assets${asset.absolutePath}`
  })
  console.log('Done:', page.name)
}
```

## Author

* [Twitter](https://x.com/tarkhovich)
* [Medium](https://medium.com/@tarkhov)

## License

This project is licensed under the **MIT License** - see the `LICENSE` file for details.