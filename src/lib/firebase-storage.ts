import { initializeApp, getApps } from 'firebase/app'
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

// Firebase client config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Initialize Firebase client
let app
if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

const storage = getStorage(app)

export async function uploadProductImage(file: File, productId?: string): Promise<string> {
  try {
    // Generate unique filename
    const timestamp = Date.now()
    const filename = productId 
      ? `products/${productId}-${timestamp}.${file.name.split('.').pop()}`
      : `products/product-${timestamp}.${file.name.split('.').pop()}`
    
    // Create storage reference
    const storageRef = ref(storage, filename)
    
    // Upload file
    console.log('Uploading image to Firebase Storage:', filename)
    const snapshot = await uploadBytes(storageRef, file)
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    console.log('Image uploaded successfully:', downloadURL)
    
    return downloadURL
  } catch (error) {
    console.error('Error uploading image to Firebase Storage:', error)
    throw new Error('Failed to upload image')
  }
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl)
    const pathStart = url.pathname.indexOf('/o/') + 3
    const pathEnd = url.pathname.indexOf('?')
    const filePath = decodeURIComponent(url.pathname.slice(pathStart, pathEnd))
    
    // Create storage reference
    const storageRef = ref(storage, filePath)
    
    // Delete file
    await deleteObject(storageRef)
    console.log('Image deleted successfully:', filePath)
  } catch (error) {
    console.error('Error deleting image from Firebase Storage:', error)
    throw new Error('Failed to delete image')
  }
}

export async function uploadMultipleProductImages(files: File[], productId?: string): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => uploadProductImage(file, productId))
    const urls = await Promise.all(uploadPromises)
    return urls
  } catch (error) {
    console.error('Error uploading multiple images:', error)
    throw new Error('Failed to upload images')
  }
}
