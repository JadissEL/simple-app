import React from 'react'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata = {  title: 'Food Inventory App',
  description: 'Manage your food inventory, recipes and expenses',
  viewport: 'width=device-width, initial-scale=1',
  charset: 'utf-8',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}
