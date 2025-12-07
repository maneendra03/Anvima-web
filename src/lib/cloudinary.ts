import { v2 as cloudinary } from 'cloudinary'

// Validate Cloudinary configuration
const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

if (!cloudName || !apiKey || !apiSecret) {
  console.warn('⚠️ Cloudinary credentials not fully configured:', {
    cloudName: !!cloudName,
    apiKey: !!apiKey,
    apiSecret: !!apiSecret
  })
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
})

export default cloudinary

export const uploadToCloudinary = async (
  file: string, // base64 or URL
  folder: string = 'products'
): Promise<{ url: string; publicId: string }> => {
  try {
    // Check if credentials are configured
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary credentials not configured')
    }

    const result = await cloudinary.uploader.upload(file, {
      folder: `anvima/${folder}`,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit', quality: 'auto:best' }
      ]
    })
    
    return {
      url: result.secure_url,
      publicId: result.public_id
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
  }
}
