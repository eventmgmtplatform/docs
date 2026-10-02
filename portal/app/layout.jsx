import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import '../theme/oem.css'

export const metadata = {
  title: {
    default: 'Event Management Docs',
    template: '%s — Docs'
  },
  description: 'Event Management architecture and product documentation',
  icons: {
    icon: '/event-mgmt-docs/brand/kyndryl/kyndryl-favicon.png',
    shortcut: '/event-mgmt-docs/brand/kyndryl/kyndryl-favicon.png',
    apple: '/event-mgmt-docs/brand/kyndryl/kyndryl-favicon.png'
  }
}

const navbar = (
  <Navbar
    logo={
      <span className="oem-brand">
        <img className="oem-brand__logo" src="/event-mgmt-docs/brand/kyndryl/kyndryl-logo.svg" alt="Kyndryl" />
        <span><strong>Event Management</strong><small>Docs</small></span>
      </span>
    }
  />
)

const footer = (
  <Footer>
    <span>Event Management · Docs · © Kyndryl. All rights reserved.</span>
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
