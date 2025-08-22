// Quick fix script - run in browser console
// This will help debug and fix the image display issue

async function quickFix() {
  try {
    console.log('🔧 Quick fix for image display...')
    
    // Check if user is logged in
    const { auth } = await import('./src/lib/firebase.js')
    const user = auth.currentUser
    
    if (!user) {
      console.log('❌ Please login first')
      return
    }
    
    const token = await user.getIdToken()
    
    // First, let's see what's in the database
    const response = await fetch('/api/admin/products', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      console.log('❌ Failed to fetch products')
      return
    }
    
    const products = await response.json()
    console.log('📦 Current products:', products)
    
    // Check if any products have empty or invalid imageUrls
    const problematicProducts = products.filter(p => 
      !p.imageUrls || 
      !Array.isArray(p.imageUrls) || 
      p.imageUrls.length === 0 ||
      p.imageUrls.some(url => !url || (!url.startsWith('/') && !url.startsWith('http')))
    )
    
    console.log('⚠️ Products with image issues:', problematicProducts.length)
    
    if (problematicProducts.length > 0) {
      console.log('🔧 Fixing products with placeholder images...')
      
      for (const product of problematicProducts) {
        console.log(`Fixing product: ${product.name}`)
        
        const updateResponse = await fetch(`/api/admin/products/${product.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...product,
            imageUrls: ['/placeholder-image.svg']
          })
        })
        
        if (updateResponse.ok) {
          console.log(`✅ Fixed ${product.name}`)
        } else {
          console.log(`❌ Failed to fix ${product.name}`)
        }
      }
      
      console.log('🔄 Refresh the page to see changes')
    } else {
      console.log('✅ All products have valid image URLs')
    }
    
  } catch (error) {
    console.error('❌ Quick fix failed:', error)
  }
}

quickFix()
