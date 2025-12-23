import React, { ReactNode } from 'react'

export default function ServiceLayout({children}: Readonly<{children: ReactNode}>) {
  return (
    <div className='w-full max-w-2xl min-h-screen mx-auto'>
        {children}
    </div>
  )
}
