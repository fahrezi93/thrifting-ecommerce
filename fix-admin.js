// Quick Admin Fix Script
// Run this in browser console after logging in

async function fixAdminAccess() {
  console.log('🔧 Fixing admin access...')
  
  try {
    // Check if Firebase is loaded
    if (typeof window === 'undefined' || !window.firebase) {
      console.log('❌ Please run this on the app page with Firebase loaded')
      return
    }
    
    // Get current user
    const auth = window.firebase.auth()
    const user = auth.currentUser
    
    if (!user) {
      console.log('❌ Please login first with:')
      console.log('📧 Email: admin@admin.com')
      console.log('🔑 Password: 123456')
      return
    }
    
    console.log('✅ Logged in as:', user.email)
    
    // Get token and make admin
    const token = await user.getIdToken(true) // Force refresh
    console.log('🎫 Got fresh token')
    
    const response = await fetch('/api/auth/make-admin', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('🎉 SUCCESS! Admin access granted')
      console.log('✅ User role updated to ADMIN')
      console.log('🔄 Please refresh the page to see admin features')
      
      // Auto refresh after 2 seconds
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } else {
      console.error('❌ Failed:', result.error)
      console.log('💡 Try logging out and back in, then run this script again')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    console.log('💡 Make sure you are logged in and try again')
  }
}

// Auto-run
fixAdminAccess()
