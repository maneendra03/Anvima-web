'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProductImage {
  url: string
  publicId?: string
}

interface ImageUploadProps {
  images: ProductImage[]
  onChange: (images: ProductImage[]) => void
  maxImages?: number
}

export default function ImageUpload({ images, onChange, maxImages = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [imageUrl, setImageUrl] = useState('')

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)
    const newImages: ProductImage[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`)
        continue
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`)
        continue
      }

      try {
        // Convert to base64
        const base64 = await fileToBase64(file)
        
        // Upload to Cloudinary
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, folder: 'products' })
        })

        const data = await response.json()

        if (data.success) {
          newImages.push({
            url: data.data.url,
            publicId: data.data.publicId
          })
        } else {
          toast.error(`Failed to upload ${file.name}`)
        }
      } catch (error) {
        console.error('Upload error:', error)
        toast.error(`Failed to upload ${file.name}`)
      }
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages])
      toast.success(`${newImages.length} image(s) uploaded`)
    }

    setUploading(false)
  }, [images, maxImages, onChange])

  const handleUrlAdd = () => {
    if (!imageUrl) return
    
    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    // Basic URL validation
    try {
      new URL(imageUrl)
    } catch {
      toast.error('Invalid URL')
      return
    }

    if (images.some(img => img.url === imageUrl)) {
      toast.error('Image already added')
      return
    }

    onChange([...images, { url: imageUrl }])
    setImageUrl('')
    toast.success('Image added')
  }

  const handleRemove = async (index: number) => {
    const image = images[index]
    
    // Delete from Cloudinary if it has a publicId
    if (image.publicId) {
      try {
        await fetch(`/api/admin/upload?publicId=${encodeURIComponent(image.publicId)}`, {
          method: 'DELETE'
        })
      } catch (error) {
        console.error('Failed to delete from Cloudinary:', error)
      }
    }

    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedImage)
    
    onChange(newImages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          uploading ? 'border-forest bg-forest/5' : 'border-gray-300 hover:border-forest/50'
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 text-forest animate-spin" />
            <p className="text-forest font-medium">Uploading images...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-forest/10 rounded-full flex items-center justify-center">
              <Upload className="h-6 w-6 text-forest" />
            </div>
            <div>
              <p className="font-medium text-gray-700">
                Drop images here or click to upload
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PNG, JPG, WEBP up to 5MB each (max {maxImages} images)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* URL Input */}
      <div className="flex gap-2">
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Or paste an image URL..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest/20 focus:border-forest"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlAdd())}
        />
        <button
          type="button"
          onClick={handleUrlAdd}
          disabled={!imageUrl}
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add URL
        </button>
      </div>

      {/* Image Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-move ${
                draggedIndex === index 
                  ? 'border-forest scale-105 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image.url}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.png'
                }}
              />
              
              {/* Drag Handle */}
              <div className="absolute top-2 left-2 p-1.5 bg-white/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                <GripVertical className="h-4 w-4 text-gray-500" />
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Primary Badge */}
              {index === 0 && (
                <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-forest text-white text-xs font-medium rounded-lg shadow-sm">
                  Main Image
                </div>
              )}
              
              {/* Index Badge */}
              {index > 0 && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded-lg">
                  {index + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 border border-gray-200 rounded-xl bg-gray-50/50">
          <ImageIcon className="h-12 w-12 text-gray-300 mb-2" />
          <p className="text-gray-500">No images added yet</p>
          <p className="text-sm text-gray-400">Upload or add image URLs above</p>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        💡 Tip: Drag images to reorder. The first image will be the main product image.
      </p>
    </div>
  )
}

// Helper function to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}
