import { readFile, readdir } from 'node:fs/promises'
import { extname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const portalRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const args = process.argv.slice(2)
const publicIndex = args.indexOf('--url')
const publicUrl = publicIndex === -1 ? null : args[publicIndex + 1]
const siteArgument = args.find((argument, index) => index !== publicIndex && index !== publicIndex + 1 && !argument.startsWith('--'))
const siteRoot = resolve(portalRoot, siteArgument || 'out')
const basePath = (process.env.OEM_DOCS_BASE_PATH || '/event-mgmt-docs').replace(/\/$/, '')
const origin = 'https://audit.invalid'

const files = []
const walk = async directory => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) await walk(path)
    else files.push(path)
  }
}
await walk(siteRoot)

const relativePath = path => relative(siteRoot, path).split(sep).join('/')
const htmlFiles = files.filter(path => extname(path) === '.html' && !['404.html', '404/index.html'].includes(relativePath(path)))
const siteFiles = new Set(files.map(relativePath))
const routeFor = path => {
  const name = relativePath(path)
  if (name === 'index.html') return `${basePath || ''}/`
  return `${basePath || ''}/${name.replace(/index\.html$/, '')}`
}
const routes = new Set(htmlFiles.map(routeFor))
const anchors = new Map()
const documents = new Map()

for (const path of htmlFiles) {
  const html = await readFile(path, 'utf8')
  const route = routeFor(path)
  documents.set(route, html)
  anchors.set(route, new Set([...html.matchAll(/\s(?:id|name)="([^"]+)"/g)].map(match => match[1])))
}

const normalizeRoute = pathname => {
  const decoded = decodeURI(pathname).replace(/\/+/g, '/')
  if (decoded === basePath) return `${basePath}/`
  return decoded.endsWith('/') ? decoded : `${decoded}/`
}
const problems = []
let linkCount = 0
let navigationCount = 0

for (const [sourceRoute, html] of documents) {
  const pageUrl = new URL(sourceRoute, origin)
  for (const match of html.matchAll(/\s(href|src)="([^"]+)"/g)) {
    const [, attribute, raw] = match
    if (!raw || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(raw)) continue
    linkCount += 1
    const before = html.slice(0, match.index)
    const inside = tag => before.lastIndexOf(`<${tag}`) > before.lastIndexOf(`</${tag}>`)
    const navigation = attribute !== 'src' && (inside('nav') || inside('aside'))
    if (navigation) navigationCount += 1

    const target = new URL(raw, pageUrl)
    const pathname = decodeURI(target.pathname)
    let kind = 'route'
    let valid = true
    let targetRoute

    if (raw.startsWith('#')) {
      targetRoute = sourceRoute
    } else if (pathname === basePath || pathname.startsWith(`${basePath}/`)) {
      const relativeTarget = pathname.slice(basePath.length).replace(/^\//, '')
      const extension = extname(relativeTarget)
      if (extension || relativeTarget.startsWith('_next/') || relativeTarget.startsWith('_pagefind/')) {
        kind = 'asset'
        valid = siteFiles.has(relativeTarget)
      } else {
        targetRoute = normalizeRoute(pathname)
        valid = routes.has(targetRoute)
      }
    } else {
      valid = false
    }

    if (valid && target.hash && kind === 'route') {
      const id = decodeURIComponent(target.hash.slice(1))
      if (id && !anchors.get(targetRoute)?.has(id)) {
        valid = false
        kind = 'anchor'
      }
    }
    if (!valid) problems.push({ source: sourceRoute, target: raw, kind, navigation })
  }
}

const counts = kind => problems.filter(problem => problem.kind === kind).length
const result = {
  routes: htmlFiles.length,
  links: linkCount,
  navigationLinks: navigationCount,
  brokenRoutes: counts('route'),
  brokenAssets: counts('asset'),
  brokenAnchors: counts('anchor'),
  brokenNavigation: problems.filter(problem => problem.navigation).length
}
console.log(JSON.stringify(result, null, 2))
for (const problem of problems.slice(0, 200)) {
  console.log(`${problem.kind}${problem.navigation ? ' navigation' : ''}: ${problem.source} -> ${problem.target}`)
}
if (problems.length > 200) console.log(`... ${problems.length - 200} more`)
if (problems.length) process.exitCode = 1

if (publicUrl) {
  const deployment = new URL(publicUrl)
  const routeUrls = [...routes].sort().map(path => new URL(path.slice(basePath.length).replace(/^\//, ''), deployment))
  const responses = new Map()
  const failures = []
  let cursor = 0
  const fetchWorker = async targets => {
    while (cursor < targets.length) {
      const url = targets[cursor++]
      try {
        const response = await fetch(url, { redirect: 'follow' })
        const body = response.ok && response.headers.get('content-type')?.includes('text/html')
          ? await response.text()
          : ''
        responses.set(url.href, { body, status: response.status })
      } catch (error) {
        responses.set(url.href, { body: '', status: error.message })
      }
    }
  }
  await Promise.all(Array.from({ length: 10 }, () => fetchWorker(routeUrls)))
  for (const url of routeUrls) {
    const response = responses.get(url.href)
    if (!response || response.status < 200 || response.status >= 300) {
      failures.push({ url: url.href, status: response?.status || 'unavailable', kind: 'route' })
    }
  }

  const targets = new Map()
  const anchorChecks = []
  let publicLinks = 0
  let publicNavigation = 0
  for (const [source, { body, status }] of responses) {
    if (status < 200 || status >= 300 || !body) continue
    for (const match of body.matchAll(/\s(href|src)="([^"]+)"/g)) {
      const [, attribute, raw] = match
      if (!raw || /^(?:mailto:|tel:|data:|javascript:)/i.test(raw)) continue
      const target = new URL(raw, source)
      if (target.origin !== deployment.origin) continue
      publicLinks += 1
      const before = body.slice(0, match.index)
      const inside = tag => before.lastIndexOf(`<${tag}`) > before.lastIndexOf(`</${tag}>`)
      const navigation = attribute === 'href' && (inside('nav') || inside('aside'))
      if (navigation) publicNavigation += 1
      if (!(target.pathname === basePath || target.pathname.startsWith(`${basePath}/`))) {
        failures.push({ url: target.href, status: 'outside basePath', kind: 'route', navigation })
        continue
      }
      const cleanUrl = new URL(target.href)
      cleanUrl.hash = ''
      const extension = extname(decodeURI(cleanUrl.pathname))
      const kind = extension || cleanUrl.pathname.includes('/_next/') || cleanUrl.pathname.includes('/_pagefind/')
        ? 'asset'
        : 'route'
      targets.set(cleanUrl.href, { kind, navigation: targets.get(cleanUrl.href)?.navigation || navigation })
      if (target.hash && kind === 'route') anchorChecks.push({ source, target: cleanUrl.href, hash: decodeURIComponent(target.hash.slice(1)), navigation })
    }
  }

  cursor = 0
  const unfetched = [...targets.keys()].filter(url => !responses.has(url)).map(url => new URL(url))
  await Promise.all(Array.from({ length: 10 }, () => fetchWorker(unfetched)))
  for (const [url, { kind, navigation }] of targets) {
    const response = responses.get(url)
    if (!response || response.status < 200 || response.status >= 300) {
      if (!failures.some(failure => failure.url === url)) failures.push({ url, status: response?.status || 'unavailable', kind, navigation })
    }
  }
  for (const check of anchorChecks) {
    const body = responses.get(check.target)?.body || ''
    const ids = new Set([...body.matchAll(/\s(?:id|name)="([^"]+)"/g)].map(match => match[1]))
    if (check.hash && !ids.has(check.hash)) failures.push({ url: `${check.target}#${check.hash}`, status: 'missing anchor', kind: 'anchor', navigation: check.navigation })
  }

  const publicResult = {
    publicUrl: deployment.href,
    routes: routeUrls.length,
    links: publicLinks,
    navigationLinks: publicNavigation,
    brokenRoutes: failures.filter(failure => failure.kind === 'route').length,
    brokenAssets: failures.filter(failure => failure.kind === 'asset').length,
    brokenAnchors: failures.filter(failure => failure.kind === 'anchor').length,
    brokenNavigation: failures.filter(failure => failure.navigation).length
  }
  console.log(JSON.stringify(publicResult, null, 2))
  for (const failure of failures) console.log(`public ${failure.kind}: ${failure.url} -> ${failure.status}`)
  if (failures.length) process.exitCode = 1
  process.exit(process.exitCode || 0)
}
