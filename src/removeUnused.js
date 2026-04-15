import http from 'node:http'
import https from 'node:https'
import path from 'node:path'
import { PurgeCSS } from 'purgecss'

export default function (pages, options = { siteUrl: null, cssDir: null, outputDir: null }) {
  if (!pages?.length) throw new Error('Pages not found.')
  if (!options?.siteUrl) throw new Error('Site url not found.')

  function parseUrl(url, page) {
    let html = ''
    url.on('data', chunk => {
      html += chunk.toString().trim()
    }).on('end', async () => {
      const settings = { content: [{ raw: html, extension: 'html' }] }
      if (!page.options?.css && options?.cssDir) settings.css = [path.join(options.cssDir, `${page.name}.css`)]
      if (!page.options?.output && options?.outputDir) settings.output = options.outputDir
      if (page?.options) Object.assign(settings, page.options)
      try {
        await new PurgeCSS().purge(settings)
        console.log(`Done - ${page.name}.`)
      } catch (e) {
        console.error('Failed to purge page css.', e.message)
      }
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