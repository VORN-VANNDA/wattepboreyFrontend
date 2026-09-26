// Stable presentation codes, not an authorization or encryption mechanism.
// Keep this mapping unchanged so previously shared links remain valid.
const MASK = 0x6a09e667n
export const publicResources = ['slides', 'events', 'members', 'donors', 'pchum-ben']

export function recordId(value) {
  const text = String(value ?? '')
  if (/^[1-9]\d*$/.test(text) && Number(text) <= 4294967295) return text
  if (!/^wt-[0-9a-z]{7}$/.test(text)) return null
  const encoded = parseInt(text.slice(3), 36)
  if (encoded > 4294967295) return null
  const id = Number(BigInt(encoded) ^ MASK)
  return id > 0 && publicCode(id) === text ? String(id) : null
}
export function publicCode(id) {
  const text = String(id)
  if (!/^[1-9]\d*$/.test(text) || Number(text) > 4294967295) throw new Error('Invalid record ID')
  return `wt-${(BigInt(text) ^ MASK).toString(36).padStart(7, '0')}`
}
export function publicPath(resource, id) {
  if (!publicResources.includes(resource)) throw new Error('Invalid public resource')
  return `/${resource}/${publicCode(id)}`
}
export function matchPublicPath(path) {
  const match = /^\/([^/]+)\/([^/]+)\/?$/.exec(path)
  if (!match || !publicResources.includes(match[1])) return null
  const id = recordId(match[2])
  return { resource: match[1], id, canonical: id ? publicPath(match[1], id) : null }
}
