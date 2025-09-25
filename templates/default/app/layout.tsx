import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from '@/providers/providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '{{PROJECT_NAME_CAMEL}}',
  description: 'Built with InterwovenKit and Initia',
  icons: {
    icon: 'https://assets.initia.xyz/images/dapps/app/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
