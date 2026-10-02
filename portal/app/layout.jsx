import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import '../theme/oem.css'

export const metadata = {
  title: {
    default: 'Open Event Management Documentation',
    template: '%s — Open Event Management'
  },
  description: 'Open Event Management architecture and product documentation'
}

const navbar = (
  <Navbar
    logo={
      <span className="oem-brand">
        <span className="oem-brand__mark" aria-hidden="true">O</span>
        <span><strong>Open Event Management</strong><small>Documentation</small></span>
      </span>
    }
  />
)

const footer = (
  <Footer>
    <span>Open Event Management · Documentation</span>
  </Footer>
)

export default async function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/eventmgmtplatform/event-mgmt-docs/tree/main/docs"
          footer={footer}
          sidebar={{ autoCollapse: true, defaultMenuCollapseLevel: 1 }}
          toc={{ backToTop: true }}
          editLink="Edit this page"
          feedback={{ content: null }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
