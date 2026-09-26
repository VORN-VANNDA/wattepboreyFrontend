import { matchPublicPath } from './src/lib/publicLinks.js'

const escape = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const plain = (value) => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

export function metadata(record, resource, canonical, apiBase) {
  const title = plain(record.title || record.name || 'វត្តទេពបុរី')
  const description = plain(record.excerpt || record.description || record.subtitle || record.bio || record.role || title).slice(0, 240)
  let image = record.images?.[0] || record.image_url || ''
  try { image = new URL(image || '/logo.png', image ? apiBase : canonical).href } catch { image = new URL('/logo.png', canonical).href }
  if (!/^https?:\/\//.test(image)) image = new URL('/logo.png', canonical).href
  return { title, description, image, canonical, type: ['members', 'donors'].includes(resource) ? 'profile' : 'article' }
}

export function renderMetadata(html, meta) {
  // Remove site-wide tags so crawlers see exactly one set for this article.
  html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b(?=[^>]*(?:name|property)\s*=\s*["'](?:description|og:[^"']*|twitter:[^"']*)["'])[^>]*>/gi, '')
    .replace(/<link\b(?=[^>]*rel\s*=\s*["']canonical["'])[^>]*>/gi, '')
  const tags = `<title>${escape(meta.title)} | Wat Tepborey</title>
<meta name="description" content="${escape(meta.description)}">
<link rel="canonical" href="${escape(meta.canonical)}">
<meta property="og:site_name" content="Wat Tepborey">
<meta property="og:locale" content="km_KH">
<meta property="og:type" content="${meta.type}">
<meta property="og:title" content="${escape(meta.title)}">
<meta property="og:description" content="${escape(meta.description)}">
<meta property="og:image" content="${escape(meta.image)}">
<meta property="og:image:alt" content="${escape(meta.title)}">
<meta property="og:url" content="${escape(meta.canonical)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escape(meta.title)}">
<meta name="twitter:description" content="${escape(meta.description)}">
<meta name="twitter:image" content="${escape(meta.image)}">`
  return html.replace(/<\/head>/i, `${tags}\n</head>`)
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const match = matchPublicPath(url.pathname)
    if (!match || !['GET', 'HEAD'].includes(request.method)) return env.ASSETS.fetch(request)
    if (!match.id) return new Response('Page not found', { status: 404 })
    if (url.pathname !== match.canonical) {
      url.pathname = match.canonical
      return Response.redirect(url.href, 301)
    }
    const apiBase = (env.API_ORIGIN || 'https://tebpoery-backend.onrender.com/api').replace(/\/$/, '')
    try {
      const upstream = await fetch(`${apiBase}/${match.resource}/${match.id}`, { signal: AbortSignal.timeout(20000), headers: { Accept: 'application/json' } })
      if (upstream.status === 404) return new Response('Page not found', { status: 404 })
      if (!upstream.ok) throw new Error('API unavailable')
      const result = await upstream.json()
      if (!result.success || !result.data) throw new Error('Invalid API response')
      const shellURL = new URL('/', url)
      const shell = await env.ASSETS.fetch(new Request(shellURL, { headers: { Accept: 'text/html' } }))
      if (!shell.ok) throw new Error('App shell unavailable')
      const canonical = new URL(match.canonical, url.origin).href
      const html = renderMetadata(await shell.text(), metadata(result.data, match.resource, canonical, apiBase))
      return new Response(request.method === 'HEAD' ? null : html, { headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'public, max-age=60' } })
    } catch {
      // Do not serve/cache an incorrect homepage preview during an API outage.
      return new Response('Temporarily unavailable. Please try again.', { status: 503, headers: { 'Retry-After': '30', 'Cache-Control': 'no-store' } })
    }
  },
}
