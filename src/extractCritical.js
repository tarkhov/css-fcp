import http from 'node:http'
import https from 'node:https'
import path from 'node:path'
import { generate } from 'critical'

export default function (pages, options = {
  siteUrl: null,
  basePath: null,
  targetPath: 'critical',
  uncritPath: null,
  cssPath: null,
  assetsUrl: null,
  width: 2000,
  height: 1080
}) {
  if (!pages?.length) throw new Error('Pages not found.')
  if (!options?.siteUrl) throw new Error('Site url not found.')

  function parseUrl(url, page) {
    let html = ''
    url.on('data', chunk => {
      html += chunk.toString().trim()
    }).on('end', async () => {
      const settings = { html }
      if (options?.basePath) settings.base = options.basePath
      settings.target = {}
      settings.target.css = (options?.targetPath) ? path.join(options.targetPath, `${page.name}.css`) : `${page.name}.css`
      settings.target.uncritical = (options?.uncritPath) ? path.join(options.uncritPath, `${page.name}.css`) : `${page.name}.css`
      if (options?.cssPath) settings.css = [path.join(options.cssPath, `${page.name}.css`)]
      if (options?.width) settings.width = options.width
      if (options?.height) settings.height = options.height
      if (options?.assetsUrl) settings.rebase = (asset) => `${options.assetsUrl}${asset.absolutePath}`
      if (page?.options) Object.assign(settings, page.options)
      // const { generate } = await import('critical')
      await generate(settings)
      console.log(`Done - ${page.name}.`)
    })
  }

  pages.forEach(page => {
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
        console.error('URL protocol not supported.')
      }
    } catch (e) {
      console.error('Failed to parse url.', e.message)
    }
  })
}