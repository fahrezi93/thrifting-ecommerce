// Setup script untuk membuat admin user
// Jalankan di browser console setelah halaman dimuat

async function createAdminUser() {
  try {
    const response = await fetch('/api/auth/create-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: '123456',
        name: 'Administrator'
      })
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Admin user created successfully:', result)
      console.log('📧 Email: admin@admin.com')
      console.log('🔑 Password: 123456')
      console.log('🚀 You can now login and access /admin')
    } else {
      console.error('❌ Error:', result.error)
    }
  } catch (error) {
    console.error('❌ Network error:', error)
  }
}

// Jalankan fungsi
createAdminUser()
