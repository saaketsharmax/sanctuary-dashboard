import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sanctuary - AI-Powered Startup Accelerator',
  description: 'The accelerator platform that connects founders with resources, mentors, and partners.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
