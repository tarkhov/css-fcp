import http from 'node:http'
import https from 'node:https'
import { generate } from 'critical'

export default function (pages, options = {
  siteUrl: null,
  baseDir: null,
  targetDir: 'critical',
  uncritical: false,
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
      if (!page.options?.base && options?.baseDir) settings.base = options.baseDir
      if (!page.options?.target) {
        settings.target = {}
        if (options?.targetDir) settings.target.css = `${options.targetDir}/${page.name}.css`
        if (options?.uncritical) settings.target.uncritical = `${page.name}.css`
      }
      if (!page.options?.width && options?.width) settings.width = options.width
      if (!page.options?.height && options?.height) settings.height = options.height
      if (!page.options?.rebase && options?.assetsUrl) settings.rebase = (asset) => `${options.assetsUrl}${asset.absolutePath}`
      Object.assign(settings, page.options)
      // const { generate } = await import('critical')
      await generate(settings)
      console.log(`Done - ${page.name}.`)
    })
  }

  pages.forEach(page => {
    if (!page?.options) throw new Error('Page options not found.')
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