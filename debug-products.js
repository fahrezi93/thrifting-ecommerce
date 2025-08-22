// Debug script to check product data in database
// Run this in browser console

async function debugProducts() {
  try {
    console.log('🔍 Debugging product data...')
    
    // Get auth token
    const { auth } = await import('./src/lib/firebase.js')
    const user = auth.currentUser
    
    if (!user) {
      console.log('❌ Please login first')
      return
    }
    
    const token = await user.getIdToken()
    
    // Fetch products from admin API
    const response = await fetch('/api/admin/products', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      console.log('❌ Failed to fetch products:', response.status)
      return
    }
    
    const products = await response.json()
    console.log('📦 Products from API:', products)
    
    // Check each product's imageUrls
    products.forEach((product, index) => {
      console.log(`\n📸 Product ${index + 1}: ${product.name}`)
      console.log('ImageUrls type:', typeof product.imageUrls)
      console.log('ImageUrls value:', product.imageUrls)
      
      if (Array.isArray(product.imageUrls)) {
        console.log('✅ ImageUrls is array with', product.imageUrls.length, 'items')
        product.imageUrls.forEach((url, i) => {
          console.log(`  Image ${i + 1}:`, url)
        })
      } else {
        console.log('❌ ImageUrls is not array:', product.imageUrls)
      }
    })
    
  } catch (error) {
    console.error('❌ Debug error:', error)
  }
}

debugProducts()
