import http from 'node:http'
import https from 'node:https'

export default function (pages, options = { siteUrl: null, cssPath: null, targetDir: 'critical', assetsUrl: null, maxWidth: 2000, maxHeight: 1080 }) {
  if (!options?.siteUrl) throw new Error('Site url option not founded.')

  function parseUrl(url, page) {
    let html = ''
    url.on('data', chunk => {
      html += chunk.toString().trim()
    }).on('end', async () => {
      const settings = { html }
      if (options?.cssPath) settings.base = options.cssPath.slice(1)
      if (options?.targetDir) settings.target = { css: `${options.targetDir}/${page.name}.css` }
      if (options?.maxWidth) settings.width = options.maxWidth
      if (options?.maxHeight) settings.height = options.maxHeight
      if (options?.assetsUrl) settings.rebase = (asset) => `${options.assetsUrl}${asset.absolutePath}`
      Object.assign(settings, page.options)
      const { generate } = await import('critical')
      await generate(settings)
      console.log(`Done - ${page.name}.`)
    })
  }

  pages.forEach(page => {
    if (!page?.options) throw new Error('Page options not founded.')
    try {
      const url = new URL(`${options.siteUrl}${page.url}`)
      if (url.protocol === 'https:') {
        https.get(url, url => {
          parseUrl(url, page)
        }).on('error', console.error)
      } else if (url.protocol === 'http:') {
        http.get(url, url => {
          parseUrl(url, page)
        }).on('error', console.error)
      } else {
        console.error('Url protocol not supported.')
      }
    } catch (e) {
      console.error('Failed to parse url.', e.message)
    }
  })
}