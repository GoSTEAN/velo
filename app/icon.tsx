import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <img
        src="/velo-og.png"
        alt="Velo Logo"
        width={32}
        height={32}
        style={{ borderRadius: 8 }}
      />
    ),
    {
      ...size,
    }
  )
}
