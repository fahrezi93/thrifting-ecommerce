// Test upload functionality
// Run this in browser console after logging in as admin

async function testUpload() {
  try {
    console.log('🧪 Testing upload functionality...')
    
    // Check if user is logged in
    const { auth } = await import('./src/lib/firebase.js')
    const user = auth.currentUser
    
    if (!user) {
      console.log('❌ Please login first')
      return
    }
    
    console.log('✅ User logged in:', user.email)
    
    // Create a test file (1x1 pixel PNG)
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'red'
    ctx.fillRect(0, 0, 1, 1)
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'test.png', { type: 'image/png' })
      console.log('📁 Created test file:', file.name, file.size, 'bytes')
      
      const formData = new FormData()
      formData.append('file', file)
      
      const token = await user.getIdToken()
      
      console.log('📤 Uploading test file...')
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      console.log('📥 Upload response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Upload successful:', result)
        
        // Test if the uploaded file is accessible
        const testImg = new Image()
        testImg.onload = () => console.log('✅ Image accessible at:', result.imageUrl)
        testImg.onerror = () => console.log('❌ Image not accessible at:', result.imageUrl)
        testImg.src = result.imageUrl
        
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.log('❌ Upload failed:', errorData)
      }
    }, 'image/png')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testUpload()
