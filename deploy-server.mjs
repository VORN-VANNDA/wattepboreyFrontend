import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { matchPublicPath } from './src/lib/publicLinks.js'
import { metadata, renderMetadata } from './worker.js'

const root = resolve(process.env.STATIC_ROOT || '/usr/share/nginx/html')
const api = process.env.API_INTERNAL_URL || 'http://api:5000/api'
const publicOrigin = process.env.PUBLIC_SITE_ORIGIN || 'https://wattepborey.com'
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.pdf': 'application/pdf' }

createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return }
    const url = new URL(req.url, publicOrigin)
    const match = matchPublicPath(url.pathname)
    if (match) {
      if (!match.id) { res.writeHead(404).end('Page not found'); return }
      if (url.pathname !== match.canonical) { res.writeHead(301, { Location: match.canonical }).end(); return }
      const upstream = await fetch(`${api}/${match.resource}/${match.id}`, { signal: AbortSignal.timeout(20000) })
      if (upstream.status === 404) { res.writeHead(404).end('Page not found'); return }
      if (!upstream.ok) throw new Error(`API ${upstream.status}`)
      const result = await upstream.json()
      if (!result.success || !result.data) throw new Error('Invalid API response')
      const canonical = new URL(match.canonical, publicOrigin).href
      const shell = await readFile(resolve(root, 'index.html'), 'utf8')
      const html = renderMetadata(shell, metadata(result.data, match.resource, canonical, `${publicOrigin}/api`))
      res.writeHead(200, { 'Content-Type': mime['.html'], 'Cache-Control': 'public, max-age=60' }).end(req.method === 'HEAD' ? undefined : html)
      return
    }
    const target = resolve(root, `.${decodeURIComponent(url.pathname)}`)
    if (target !== root && !target.startsWith(root + sep)) { res.writeHead(403).end(); return }
    let file = target
    try { if (!(await stat(file)).isFile()) file = resolve(root, 'index.html') } catch { file = resolve(root, 'index.html') }
    const body = await readFile(file)
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': file.endsWith('index.html') ? 'no-cache' : 'public, max-age=86400' }).end(req.method === 'HEAD' ? undefined : body)
  } catch (error) {
    console.error('Web request failed:', error)
    res.writeHead(503, { 'Retry-After': '30', 'Cache-Control': 'no-store' }).end('Temporarily unavailable')
  }
}).listen(Number(process.env.PORT) || 3000, '0.0.0.0')
