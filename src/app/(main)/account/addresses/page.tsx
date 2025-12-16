'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Plus, Edit2, Trash2, Check, X, Home, Building, Navigation, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Address {
  _id: string
  name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
  location?: {
    lat: number
    lng: number
  }
}

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh',
]

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
    location: null as { lat: number; lng: number } | null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/user/addresses')
      const data = await response.json()
      if (data.success) {
        setAddresses(data.data.addresses || [])
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address)
      setFormData({
        name: address.name,
        phone: address.phone,
        address: address.address,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        isDefault: address.isDefault,
        location: address.location || null,
      })
    } else {
      setEditingAddress(null)
      setFormData({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: addresses.length === 0,
        location: null,
      })
    }
    setErrors({})
    setIsModalOpen(true)
  }

  // Get live location and auto-fill address using reverse geocoding
  const handleGetLiveLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setIsGettingLocation(true)
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          // Use free reverse geocoding API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en',
              },
            }
          )
          
          if (!response.ok) throw new Error('Failed to get address')
          
          const data = await response.json()
          const addr = data.address || {}
          
          // Map the response to form fields
          const streetParts = [
            addr.house_number,
            addr.road || addr.street,
            addr.neighbourhood || addr.suburb,
          ].filter(Boolean)
          
          const street = streetParts.join(', ') || data.display_name?.split(',').slice(0, 2).join(',') || ''
          
          // Map state names to match our dropdown
          const stateMapping: Record<string, string> = {
            'Telangana': 'Telangana',
            'Andhra Pradesh': 'Andhra Pradesh',
            'Karnataka': 'Karnataka',
            'Tamil Nadu': 'Tamil Nadu',
            'Maharashtra': 'Maharashtra',
            'Delhi': 'Delhi',
            'National Capital Territory of Delhi': 'Delhi',
            // Add more mappings as needed
          }
          
          const detectedState = addr.state || addr.state_district || ''
          const mappedState = stateMapping[detectedState] || 
            indianStates.find(s => detectedState.toLowerCase().includes(s.toLowerCase())) || 
            ''
          
          setFormData(prev => ({
            ...prev,
            address: street,
            city: addr.city || addr.town || addr.village || addr.county || '',
            state: mappedState,
            pincode: addr.postcode || '',
            location: { lat: latitude, lng: longitude },
          }))
          
          toast.success('Location detected! Please verify the address details.')
        } catch (error) {
          console.error('Reverse geocoding error:', error)
          // Still save coordinates even if reverse geocoding fails
          setFormData(prev => ({
            ...prev,
            location: { lat: latitude, lng: longitude },
          }))
          toast.error('Could not auto-fill address. Please enter manually.')
        } finally {
          setIsGettingLocation(false)
        }
      },
      (error) => {
        setIsGettingLocation(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Please allow location access to use this feature')
            break
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information unavailable')
            break
          case error.TIMEOUT:
            toast.error('Location request timed out')
            break
          default:
            toast.error('Failed to get location')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingAddress(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    else if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state) newErrors.state = 'State is required'
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid pincode'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSaving(true)
    try {
      const url = editingAddress
        ? `/api/user/addresses/${editingAddress._id}`
        : '/api/user/addresses'
      const method = editingAddress ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(editingAddress ? 'Address updated!' : 'Address added!')
        fetchAddresses()
        closeModal()
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Address deleted!')
        fetchAddresses()
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Failed to delete address')
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/user/addresses/${id}/default`, {
        method: 'PUT',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Default address updated!')
        fetchAddresses()
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Failed to update default address')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-forest-500/30 border-t-forest-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-charcoal-800">Saved Addresses</h2>
          <p className="text-charcoal-500 mt-1">Manage your delivery addresses</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-forest-600 text-white rounded-lg font-medium hover:bg-forest-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Address
        </button>
      </div>

      {/* Addresses Grid */}
      {addresses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <MapPin className="w-16 h-16 text-charcoal-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-charcoal-800 mb-2">No saved addresses</h3>
          <p className="text-charcoal-500 mb-6">Add an address to make checkout faster</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-forest-600 text-white rounded-lg font-medium hover:bg-forest-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Your First Address
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address, index) => (
            <motion.div
              key={address._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative border rounded-xl p-4 ${
                address.isDefault
                  ? 'border-forest-500 bg-forest-50/50'
                  : 'border-cream-200 bg-white'
              }`}
            >
              {address.isDefault && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 bg-forest-100 text-forest-700 text-xs font-medium rounded-full">
                  <Check className="w-3 h-3" />
                  Default
                </span>
              )}

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-cream-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Home className="w-5 h-5 text-charcoal-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-charcoal-800">{address.name}</h4>
                  <p className="text-sm text-charcoal-500 mt-1">{address.phone}</p>
                  <p className="text-sm text-charcoal-600 mt-2">
                    {address.address}, {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-cream-200">
                <button
                  onClick={() => openModal(address)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-charcoal-600 hover:bg-cream-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(address._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address._id)}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm text-forest-600 hover:bg-forest-50 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Set as Default
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-cream-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-charcoal-800">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-charcoal-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Prominent Use My Location Button */}
                <button
                  type="button"
                  onClick={handleGetLiveLocation}
                  disabled={isGettingLocation}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-forest-500 to-forest-600 text-white rounded-xl font-medium hover:from-forest-600 hover:to-forest-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-forest-500/20"
                >
                  {isGettingLocation ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Detecting your location...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-5 h-5" />
                      📍 Use My Current Location
                    </>
                  )}
                </button>

                {formData.location && (
                  <p className="text-sm text-green-600 flex items-center justify-center gap-1.5 -mt-2">
                    <Check className="w-4 h-4" />
                    Location detected! Please verify the details below.
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 ${
                        errors.name ? 'border-red-500' : 'border-charcoal-200'
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={10}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 ${
                        errors.phone ? 'border-red-500' : 'border-charcoal-200'
                      }`}
                      placeholder="9876543210"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={2}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 ${
                      errors.address ? 'border-red-500' : 'border-charcoal-200'
                    }`}
                    placeholder="House/Flat No., Street, Landmark"
                  />
                  {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 ${
                        errors.city ? 'border-red-500' : 'border-charcoal-200'
                      }`}
                      placeholder="Mumbai"
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">
                      State *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 bg-white ${
                        errors.state ? 'border-red-500' : 'border-charcoal-200'
                      }`}
                    >
                      <option value="">Select State</option>
                      {indianStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    maxLength={6}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 ${
                      errors.pincode ? 'border-red-500' : 'border-charcoal-200'
                    }`}
                    placeholder="400001"
                  />
                  {errors.pincode && <p className="mt-1 text-sm text-red-500">{errors.pincode}</p>}
                </div>

                <label className="flex items-center gap-3 p-3 bg-cream-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    className="w-4 h-4 text-forest-600 border-charcoal-300 rounded focus:ring-forest-500"
                  />
                  <span className="text-sm text-charcoal-700">
                    Set as default delivery address
                  </span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-3 bg-forest-600 text-white rounded-lg font-medium hover:bg-forest-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingAddress ? 'Update Address' : 'Add Address'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 border border-charcoal-200 text-charcoal-600 rounded-lg font-medium hover:bg-charcoal-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
