import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: "吐司君的日语学院",
  description: '一个由吐司君驱动的可爱日语学习应用。学习词汇、保存单词并进行有趣的测验！',
  generator: 'v0.app',
}

export const viewport = {
  themeColor: '#f5d97a',
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`${nunito.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
