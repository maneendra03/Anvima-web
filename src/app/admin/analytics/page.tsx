'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown, RefreshCw, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface OverviewStats {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  newCustomers: number
  totalProducts: number
  totalCustomers: number
  changes: { revenue: string; orders: string; customers: string }
}

interface ChartData {
  revenueByDay: { _id: string; revenue: number; orders: number }[]
  ordersByStatus: { _id: string; count: number }[]
  revenueByCategory: { _id: string; revenue: number }[]
}

interface TopProduct {
  _id: string
  name: string
  slug: string
  image: string
  totalQuantity: number
  totalRevenue: number
}

interface RecentOrder {
  _id: string
  orderNumber: string
  totalAmount: number
  status: string
  createdAt: string
  user?: { name: string; email: string }
}

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState('30')
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<OverviewStats | null>(null)
  const [charts, setCharts] = useState<ChartData | null>(null)
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/analytics?period=${period}`)
      const data = await res.json()
      if (data.success) {
        setOverview(data.data.overview)
        setCharts(data.data.charts)
        setTopProducts(data.data.topProducts)
        setRecentOrders(data.data.recentOrders)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics])

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      processing: 'bg-purple-100 text-purple-700',
      shipped: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const StatCard = ({ title, value, change, icon: Icon, color }: { title: string; value: string; change?: string; icon: React.ComponentType<{ className?: string }>; color: string }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-charcoal-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-charcoal-700">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${parseFloat(change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {parseFloat(change) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(parseFloat(change))}% vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}><Icon className="w-6 h-6" /></div>
      </div>
    </motion.div>
  )

  const SimpleBarChart = ({ data }: { data: { label: string; value: number }[] }) => {
    const max = Math.max(...data.map(d => d.value), 1)
    return (
      <div className="flex items-end gap-1 h-40">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-forest-500 rounded-t hover:bg-forest-600 transition-all" style={{ height: `${(item.value / max) * 150}px`, minHeight: item.value > 0 ? '4px' : '0' }} title={`${item.label}: ${formatCurrency(item.value)}`} />
            <span className="text-[10px] text-charcoal-400 mt-1 truncate w-full text-center">{item.label.split('-')[2] || item.label}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-700">Analytics Dashboard</h1>
          <p className="text-charcoal-500 mt-1">Track your store&apos;s performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-4 py-2 border rounded-lg bg-white">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button onClick={fetchAnalytics} className="p-2 bg-white border rounded-lg hover:bg-gray-50">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-forest-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Revenue" value={formatCurrency(overview?.totalRevenue || 0)} change={overview?.changes.revenue} icon={DollarSign} color="bg-green-100 text-green-600" />
            <StatCard title="Total Orders" value={(overview?.totalOrders || 0).toString()} change={overview?.changes.orders} icon={ShoppingCart} color="bg-blue-100 text-blue-600" />
            <StatCard title="New Customers" value={(overview?.newCustomers || 0).toString()} change={overview?.changes.customers} icon={Users} color="bg-purple-100 text-purple-600" />
            <StatCard title="Avg Order Value" value={formatCurrency(overview?.avgOrderValue || 0)} icon={Package} color="bg-peach-100 text-peach-600" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-charcoal-700 mb-4">Revenue Over Time</h3>
              {charts?.revenueByDay && charts.revenueByDay.length > 0 ? (
                <SimpleBarChart data={charts.revenueByDay.map(d => ({ label: d._id, value: d.revenue }))} />
              ) : (
                <div className="h-40 flex items-center justify-center text-charcoal-400">No data available</div>
              )}
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-charcoal-700 mb-4">Orders by Status</h3>
              <div className="space-y-3">
                {charts?.ordersByStatus?.map((item) => (
                  <div key={item._id} className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(item._id)}`}>{item._id}</span>
                    <span className="font-semibold text-charcoal-700">{item.count}</span>
                  </div>
                ))}
                {(!charts?.ordersByStatus || charts.ordersByStatus.length === 0) && <p className="text-charcoal-400 text-center py-4">No orders</p>}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-charcoal-700">Top Selling Products</h3>
                <Link href="/admin/products" className="text-forest-500 text-sm hover:underline">View All</Link>
              </div>
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={product._id} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-forest-100 text-forest-600 flex items-center justify-center text-sm font-medium">{index + 1}</span>
                    <img src={product.image || '/placeholder.jpg'} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-charcoal-700 truncate">{product.name}</p>
                      <p className="text-xs text-charcoal-400">{product.totalQuantity} sold</p>
                    </div>
                    <p className="font-semibold text-charcoal-700">{formatCurrency(product.totalRevenue)}</p>
                  </div>
                ))}
                {topProducts.length === 0 && <p className="text-charcoal-400 text-center py-4">No sales data</p>}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-charcoal-700">Recent Orders</h3>
                <Link href="/admin/orders" className="text-forest-500 text-sm hover:underline flex items-center gap-1">View All <ArrowRight className="w-4 h-4" /></Link>
              </div>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link key={order._id} href={`/admin/orders/${order._id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 -mx-3">
                    <div>
                      <p className="font-medium text-charcoal-700">#{order.orderNumber}</p>
                      <p className="text-xs text-charcoal-400">{order.user?.name || 'Guest'} • {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-charcoal-700">{formatCurrency(order.totalAmount)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(order.status)}`}>{order.status}</span>
                    </div>
                  </Link>
                ))}
                {recentOrders.length === 0 && <p className="text-charcoal-400 text-center py-4">No recent orders</p>}
              </div>
            </div>
          </div>

          {charts?.revenueByCategory && charts.revenueByCategory.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
              <h3 className="font-semibold text-charcoal-700 mb-4">Revenue by Category</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {charts.revenueByCategory.map((cat) => (
                  <div key={cat._id} className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="font-semibold text-charcoal-700">{formatCurrency(cat.revenue)}</p>
                    <p className="text-xs text-charcoal-400 mt-1">{cat._id || 'Uncategorized'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
