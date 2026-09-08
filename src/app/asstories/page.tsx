import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()

  // Fetch real counts from Supabase
  const [productsRes, ordersRes, customersRes, revenueRes] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('orders').select('total').eq('payment_status', 'verified'),
  ])

  const productCount = productsRes.count ?? 0
  const orderCount = ordersRes.count ?? 0
  const customerCount = customersRes.count ?? 0
  const revenue = (revenueRes.data ?? []).reduce((sum, o) => sum + Number(o.total || 0), 0)

  // Fetch recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, total, order_status, payment_status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: 'Total Orders', value: String(orderCount), icon: ShoppingCart, change: orderCount > 0 ? 'View all orders' : 'No orders yet' },
    { label: 'Products', value: String(productCount), icon: Package, change: productCount > 0 ? `${productCount} in catalog` : 'Add your first product' },
    { label: 'Customers', value: String(customerCount), icon: Users, change: 'Registered users' },
    { label: 'Revenue', value: `PKR ${revenue.toLocaleString()}`, icon: TrendingUp, change: 'Verified payments' },
  ]

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    payment_pending: 'bg-orange-100 text-orange-800',
    payment_verified: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-emerald-100 text-emerald-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-[1.8rem] text-charcoal">Dashboard</h1>
        <p className="text-sm text-ink-muted mt-1">Welcome to the AYAT admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-ink-muted font-medium uppercase tracking-wider">{stat.label}</span>
              <stat.icon size={18} className="text-ink-faint" strokeWidth={1.5} />
            </div>
            <p className="text-2xl font-serif text-charcoal">{stat.value}</p>
            <p className="text-xs text-ink-faint mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-border">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="font-serif text-lg text-charcoal">Recent Orders</h2>
          <Link href="/asstories/orders" className="text-xs text-emerald-deep hover:underline">
            View All →
          </Link>
        </div>
        {(!recentOrders || recentOrders.length === 0) ? (
          <div className="text-center py-12 px-6">
            <ShoppingCart size={36} className="text-ink-faint mx-auto mb-3" strokeWidth={1} />
            <p className="text-sm text-ink-muted">No orders yet</p>
            <p className="text-xs text-ink-faint mt-1">Orders will appear here once customers start purchasing</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border bg-parchment/50">
                  <th className="text-left py-3 px-6 font-semibold text-xs uppercase tracking-wider">Order #</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Payment</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-parchment/30 transition-colors">
                    <td className="py-3 px-6 font-mono text-xs">{order.order_number}</td>
                    <td className="py-3 px-4">{order.customer_name}</td>
                    <td className="py-3 px-4 font-medium">PKR {Number(order.total).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[0.65rem] px-2 py-1 rounded-full font-medium ${
                        order.payment_status === 'verified' ? 'bg-green-100 text-green-800' :
                        order.payment_status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[0.65rem] px-2 py-1 rounded-full font-medium ${statusColors[order.order_status] || 'bg-gray-100 text-gray-800'}`}>
                        {order.order_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-ink-muted text-xs">
                      {new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
