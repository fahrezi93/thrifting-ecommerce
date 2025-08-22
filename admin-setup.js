// Admin Setup Script - Run this in browser console
// Navigate to your app first, then run this script

async function setupAdmin() {
  console.log('🔧 Setting up admin access...')
  
  try {
    // Step 1: Check if user is logged in
    const { auth } = await import('./src/lib/firebase.js')
    const user = auth.currentUser
    
    if (!user) {
      console.log('❌ No user logged in. Please:')
      console.log('1. Sign up/login with email: admin@admin.com')
      console.log('2. Password: 123456')
      console.log('3. Then run this script again')
      return
    }
    
    console.log('✅ User logged in:', user.email)
    
    // Step 2: Get ID token
    const token = await user.getIdToken()
    
    // Step 3: Make user admin
    const response = await fetch('/api/auth/make-admin', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('🎉 Admin setup successful!')
      console.log('✅ User role updated to ADMIN')
      console.log('🚀 You can now access /admin and add products')
      console.log('📝 Refresh the page to see admin features')
    } else {
      console.error('❌ Failed to setup admin:', result.error)
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    console.log('💡 Make sure you are on the app page and logged in')
  }
}

// Auto-run
setupAdmin()
