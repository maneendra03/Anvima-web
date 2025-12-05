'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  X,
  Plus,
  Trash2,
  Save,
  Eye,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import ImageUpload from '@/components/admin/ImageUpload'

interface Category {
  _id: string
  name: string
  slug: string
}

interface Variant {
  name: string
  options: { value: string; priceModifier: number }[]
}

interface ProductImage {
  url: string
  publicId?: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: '',
    comparePrice: '',
    sku: '',
    stock: '0',
    category: '',
    tags: '',
    isActive: true,
    isFeatured: false,
    isBestseller: false,
    isNewArrival: false,
    isCustomizable: false,
    allowText: false,
    maxTextLength: '50',
    allowImage: false,
    maxImages: '1'
  })
  
  const [images, setImages] = useState<ProductImage[]>([])
  const [variants, setVariants] = useState<Variant[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Auto-generate slug from name
    if (name === 'name') {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }))
    }
  }

  const addVariant = () => {
    setVariants([...variants, { name: '', options: [{ value: '', priceModifier: 0 }] }])
  }

  const updateVariant = (index: number, field: string, value: string) => {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }
    setVariants(updated)
  }

  const addVariantOption = (variantIndex: number) => {
    const updated = [...variants]
    updated[variantIndex].options.push({ value: '', priceModifier: 0 })
    setVariants(updated)
  }

  const updateVariantOption = (variantIndex: number, optionIndex: number, field: string, value: string | number) => {
    const updated = [...variants]
    updated[variantIndex].options[optionIndex] = {
      ...updated[variantIndex].options[optionIndex],
      [field]: value
    }
    setVariants(updated)
  }

  const removeVariantOption = (variantIndex: number, optionIndex: number) => {
    const updated = [...variants]
    updated[variantIndex].options = updated[variantIndex].options.filter((_, i) => i !== optionIndex)
    setVariants(updated)
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    if (images.length === 0) {
      toast.error('Please add at least one product image')
      return
    }

    setLoading(true)

    try {
      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        shortDescription: formData.shortDescription,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        sku: formData.sku,
        stock: parseInt(formData.stock),
        images: images.map(img => img.url), // Extract URLs for the product
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isBestseller: formData.isBestseller,
        isNewArrival: formData.isNewArrival,
        isCustomizable: formData.isCustomizable,
        customizationOptions: formData.isCustomizable ? {
          allowText: formData.allowText,
          maxTextLength: parseInt(formData.maxTextLength),
          allowImage: formData.allowImage,
          maxImages: parseInt(formData.maxImages)
        } : undefined,
        variants: variants.filter(v => v.name && v.options.some(o => o.value))
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Product created successfully!')
        router.push('/admin/products')
      } else {
        toast.error(data.message || 'Failed to create product')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-600">Create a new product for your store</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-forest text-white rounded-lg hover:bg-forest/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/20 focus:border-forest"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="product-url-slug"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/20 focus:border-forest bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  placeholder="Brief product description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/20 focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Detailed product description..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/20 focus:border-forest"
                />
              </div>
            </div>
          </motion.div>

          {/* Images */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Product Images</h2>
            <ImageUpload
              images={images}
              onChange={setImages}
              maxImages={10}
            />
          </motion.div>

          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Pricing & Inventory</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/20 focus:border-forest"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compare Price (₹)
                </label>
                <input
                  type="number"
                  name="comparePrice"
                  value={formData.comparePrice}
                  onChange={handleChange}
                  placeholder="Original price"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/20 focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="Product SKU"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/20 focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/20 focus:border-forest"
                />
              </div>
            </div>
          </motion.div>

          {/* Variants */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Product Variants</h2>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Variant
              </button>
            </div>

            {variants.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No variants added. Click &quot;Add Variant&quot; to create size, color, or other options.
              </p>
            ) : (
              <div className="space-y-4">
                {variants.map((variant, vIndex) => (
                  <div key={vIndex} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => updateVariant(vIndex, 'name', e.target.value)}
                        placeholder="Variant name (e.g., Size, Color)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/20 focus:border-forest"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariant(vIndex)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {variant.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={option.value}
                            onChange={(e) => updateVariantOption(vIndex, oIndex, 'value', e.target.value)}
                            placeholder="Option value"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/20 focus:border-forest"
                          />
                          <input
                            type="number"
                            value={option.priceModifier}
                            onChange={(e) => updateVariantOption(vIndex, oIndex, 'priceModifier', parseFloat(e.target.value) || 0)}
                            placeholder="+ ₹0"
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/20 focus:border-forest"
                          />
                          <button
                            type="button"
                            onClick={() => removeVariantOption(vIndex, oIndex)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addVariantOption(vIndex)}
                        className="text-sm text-forest hover:underline"
                      >
                        + Add Option
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Customization Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Customization Options</h2>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isCustomizable"
                  checked={formData.isCustomizable}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-forest focus:ring-forest"
                />
                <span className="font-medium">Enable customization for this product</span>
              </label>

              {formData.isCustomizable && (
                <div className="ml-8 space-y-4 pt-4 border-t">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="allowText"
                      checked={formData.allowText}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-forest focus:ring-forest"
                    />
                    <span>Allow custom text</span>
                  </label>
                  
                  {formData.allowText && (
                    <div className="ml-8">
                      <label className="block text-sm text-gray-600 mb-1">Max text length</label>
                      <input
                        type="number"
                        name="maxTextLength"
                        value={formData.maxTextLength}
                        onChange={handleChange}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/20 focus:border-forest"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="allowImage"
                      checked={formData.allowImage}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-forest focus:ring-forest"
                    />
                    <span>Allow image upload</span>
                  </label>
                  
                  {formData.allowImage && (
                    <div className="ml-8">
                      <label className="block text-sm text-gray-600 mb-1">Max images allowed</label>
                      <input
                        type="number"
                        name="maxImages"
                        value={formData.maxImages}
                        onChange={handleChange}
                        min="1"
                        max="10"
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/20 focus:border-forest"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Status</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-forest focus:ring-forest"
                />
                <span>Active (visible in store)</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-forest focus:ring-forest"
                />
                <span>Featured product</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isBestseller"
                  checked={formData.isBestseller}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-forest focus:ring-forest"
                />
                <span>Bestseller</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isNewArrival"
                  checked={formData.isNewArrival}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-forest focus:ring-forest"
                />
                <span>New Arrival</span>
              </label>
            </div>
          </motion.div>

          {/* Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Category</h2>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/20 focus:border-forest"
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Tags</h2>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="gift, personalized, photo"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/20 focus:border-forest"
            />
            <p className="text-xs text-gray-500 mt-2">Separate tags with commas</p>
          </motion.div>
        </div>
      </form>
    </div>
  )
}
