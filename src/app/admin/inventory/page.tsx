'use client'

import { useState, useEffect, useCallback } from 'react'
import { Package, AlertTriangle, Search, RefreshCw, Save, Filter } from 'lucide-react'
import { motion } from 'framer-motion'

interface InventoryProduct {
  _id: string
  name: string
  slug: string
  images: string[]
  stock: number
  lowStockThreshold: number
  trackInventory: boolean
  category: string
  price: number
  status: string
}

interface InventoryStats {
  totalProducts: number
  inStock: number
  lowStock: number
  outOfStock: number
}

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([])
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editedStock, setEditedStock] = useState<Record<string, number>>({})

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filter !== 'all' && { filter }),
        ...(search && { search })
      })
      const res = await fetch(`/api/admin/inventory?${params}`)
      const data = await res.json()
      if (data.success) {
        setProducts(data.data.products)
        setStats(data.data.stats)
        setTotalPages(data.data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    } finally {
      setLoading(false)
    }
  }, [page, filter, search])

  useEffect(() => { fetchInventory() }, [fetchInventory])

  const handleStockChange = (productId: string, value: string) => {
    const numValue = parseInt(value) || 0
    setEditedStock(prev => ({ ...prev, [productId]: numValue }))
  }

  const saveStock = async (productId: string) => {
    if (editedStock[productId] === undefined) return
    try {
      setSaving(productId)
      const res = await fetch(`/api/admin/inventory/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: editedStock[productId] })
      })
      const data = await res.json()
      if (data.success) {
        setProducts(prev => prev.map(p => p._id === productId ? { ...p, stock: editedStock[productId] } : p))
        setEditedStock(prev => { const next = { ...prev }; delete next[productId]; return next })
        fetchInventory()
      }
    } catch (error) {
      console.error('Failed to update stock:', error)
    } finally {
      setSaving(null)
    }
  }

  const getStockStatus = (product: InventoryProduct) => {
    if (!product.trackInventory) return { label: 'Not Tracked', color: 'bg-gray-100 text-gray-600' }
    if (product.stock <= 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700' }
    if (product.stock <= product.lowStockThreshold) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700' }
    return { label: 'In Stock', color: 'bg-green-100 text-green-700' }
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-700">Inventory Management</h1>
          <p className="text-charcoal-500 mt-1">Track and manage product stock levels</p>
        </div>
        <button onClick={fetchInventory} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Package className="w-5 h-5 text-blue-600" /></div>
              <div><p className="text-sm text-charcoal-500">Total Products</p><p className="text-xl font-bold text-charcoal-700">{stats.totalProducts}</p></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><Package className="w-5 h-5 text-green-600" /></div>
              <div><p className="text-sm text-charcoal-500">In Stock</p><p className="text-xl font-bold text-green-600">{stats.inStock}</p></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:ring-2 ring-yellow-300" onClick={() => setFilter('low')}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-yellow-600" /></div>
              <div><p className="text-sm text-charcoal-500">Low Stock</p><p className="text-xl font-bold text-yellow-600">{stats.lowStock}</p></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:ring-2 ring-red-300" onClick={() => setFilter('out')}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg"><Package className="w-5 h-5 text-red-600" /></div>
              <div><p className="text-sm text-charcoal-500">Out of Stock</p><p className="text-xl font-bold text-red-600">{stats.outOfStock}</p></div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <input type="text" placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-charcoal-400" />
            <select value={filter} onChange={(e) => { setFilter(e.target.value as typeof filter); setPage(1) }} className="px-3 py-2 border rounded-lg bg-white">
              <option value="all">All Products</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-forest-500 border-t-transparent rounded-full" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-charcoal-400">
            <Package className="w-12 h-12 mb-2" />
            <p>No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left text-sm text-charcoal-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Threshold</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => {
                  const status = getStockStatus(product)
                  const hasChanges = editedStock[product._id] !== undefined && editedStock[product._id] !== product.stock
                  return (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={product.images?.[0] || '/placeholder.jpg'} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                          <div className="min-w-0">
                            <p className="font-medium text-charcoal-700 truncate max-w-[200px]">{product.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-charcoal-500">{product.category}</td>
                      <td className="px-4 py-3 text-sm font-medium text-charcoal-700">{formatCurrency(product.price)}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={editedStock[product._id] ?? product.stock}
                          onChange={(e) => handleStockChange(product._id, e.target.value)}
                          className={`w-20 px-2 py-1 border rounded text-center ${hasChanges ? 'border-forest-500 ring-1 ring-forest-500' : ''}`}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-charcoal-500">{product.lowStockThreshold}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${status.color}`}>{status.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        {hasChanges && (
                          <button
                            onClick={() => saveStock(product._id)}
                            disabled={saving === product._id}
                            className="flex items-center gap-1 px-3 py-1 bg-forest-500 text-white rounded-lg text-sm hover:bg-forest-600 disabled:opacity-50"
                          >
                            {saving === product._id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            Save
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-charcoal-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50">Previous</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
