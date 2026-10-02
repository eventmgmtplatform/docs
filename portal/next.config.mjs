import nextra from 'nextra'

const repositoryPath = process.env.OEM_DOCS_BASE_PATH ?? '/event-mgmt-docs'
const basePath = repositoryPath === '/' ? '' : repositoryPath.replace(/\/$/, '')

const withNextra = nextra({
  search: { codeblocks: false }
})

export default withNextra({
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true }
})
