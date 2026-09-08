import { ImageLoaderProps } from 'next/image'

export const imageKitLoader = ({ src, width, quality }: ImageLoaderProps) => {
  if (src.startsWith('http') && !src.includes('ik.imagekit.io')) {
    return src
  }

  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL || 'https://ik.imagekit.io/ids6t96oe/'
  
  // If the src is already a full imagekit URL, just append parameters
  let path = src
  if (src.startsWith(urlEndpoint)) {
    path = src.replace(urlEndpoint, '')
  } else if (src.startsWith('/')) {
    path = src.substring(1)
  }

  const params = [`w-${width}`]
  if (quality) {
    params.push(`q-${quality}`)
  }
  
  // Default format is auto for best optimization (webp/avif)
  params.push('f-auto')

  const parameters = params.join(',')
  
  // Ensure we don't have double slashes
  const cleanPath = path.startsWith('/') ? path.substring(1) : path
  
  return `${urlEndpoint.endsWith('/') ? urlEndpoint : urlEndpoint + '/'}${cleanPath}?tr=${parameters}`
}
