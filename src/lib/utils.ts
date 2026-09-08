export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatPrice(price: number): string {
  return `PKR ${price.toLocaleString('en-PK')}`
}

export function generateOrderNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'AYAT-'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '…'
}

export function getImageUrl(
  path: string,
  options?: { width?: number; quality?: number }
): string {
  if (!path) return '/placeholder.jpg'
  // If it's already a full URL, return as-is with ImageKit transforms
  if (path.startsWith('http')) {
    const ikUrl = process.env.NEXT_PUBLIC_IMAGEKIT_URL
    if (ikUrl && path.includes('ik.imagekit.io')) {
      const transforms = []
      if (options?.width) transforms.push(`w-${options.width}`)
      if (options?.quality) transforms.push(`q-${options.quality}`)
      if (transforms.length > 0) {
        const separator = path.includes('?') ? '&' : '?'
        return `${path}${separator}tr=${transforms.join(',')}`
      }
    }
    return path
  }
  return path
}
