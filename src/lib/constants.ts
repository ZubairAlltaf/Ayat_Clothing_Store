export const SITE = {
  name: 'AYAT',
  tagline: 'Clothing Store',
  description: 'Premium Pakistani clothing — timeless designs, finest fabrics, crafted for the modern wardrobe.',
  url: 'https://ayatclothing.com',
  phone: '03049676311',
  whatsapp: '923049676311',
  email: 'info@ayatclothing.com',
} as const

export const PAYMENT = {
  jazzcash: {
    name: 'JazzCash',
    accountName: 'Asad Shafique',
    number: '03049676311',
  },
  easypaisa: {
    name: 'Easypaisa',
    accountName: 'Asad Shafique',
    number: '03049676311',
  },
} as const

export const DELIVERY = {
  estimatedDays: '2 to 5 working days',
  freeThreshold: 5000,
  standardRate: 250,
} as const

export const ORDER_STATUSES = [
  'pending',
  'payment_pending',
  'payment_verified',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'return_requested',
  'returned',
] as const

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Order Received',
  payment_pending: 'Payment Pending',
  payment_verified: 'Payment Confirmed',
  confirmed: 'Order Confirmed',
  processing: 'Preparing Your Order',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  return_requested: 'Return Requested',
  returned: 'Returned',
}

export const CATEGORIES = [
  { name: 'Women', slug: 'women', gender: 'women' },
  { name: 'Men', slug: 'men', gender: 'men' },
  { name: 'Children', slug: 'children', gender: 'children' },
  { name: 'New Arrivals', slug: 'new-arrivals' },
  { name: 'Sale', slug: 'sale' },
] as const

export const NAV_LINKS = {
  main: [
    { label: 'New Arrivals', href: '/new-arrivals' },
    { label: 'Women', href: '/women' },
    { label: 'Men', href: '/men' },
    { label: 'Children', href: '/children' },
  ],
  secondary: [
    { label: 'Collections', href: '/collections' },
    { label: 'Sale', href: '/sale' },
  ],
} as const

export const FABRICS = [
  { name: 'Boski', description: 'Luxurious silk-like texture with a smooth finish. Ideal for formal occasions.', season: 'All Season' },
  { name: 'Karandi', description: 'Warm, soft and textured weave perfect for cooler months.', season: 'Winter' },
  { name: 'Lawn', description: 'Lightweight, breathable cotton. Pakistan\'s most popular summer fabric.', season: 'Summer' },
  { name: 'Cotton', description: 'Crisp, durable and comfortable for everyday wear.', season: 'All Season' },
  { name: 'Chiffon', description: 'Sheer elegance with a graceful drape for formal occasions.', season: 'All Season' },
  { name: 'Linen', description: 'Natural, breathable texture with a relaxed sophistication.', season: 'Summer' },
] as const
