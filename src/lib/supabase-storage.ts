import { supabase, STORAGE_BUCKET } from './supabase'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Upload a single image to Supabase Storage
 */
export async function uploadImageToSupabase(file: File): Promise<UploadResult> {
  try {
    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `product-${timestamp}.${extension}`
    const filePath = `products/${filename}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath)

    return {
      success: true,
      url: urlData.publicUrl
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Upload multiple images to Supabase Storage
 */
export async function uploadMultipleImages(files: FileList): Promise<UploadResult[]> {
  const results: UploadResult[] = []
  
  for (let i = 0; i < files.length; i++) {
    const result = await uploadImageToSupabase(files[i])
    results.push(result)
  }
  
  return results
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImageFromSupabase(imageUrl: string): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/')
    const filename = urlParts[urlParts.length - 1]
    const filePath = `products/${filename}`

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}
