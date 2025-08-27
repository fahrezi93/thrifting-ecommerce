const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixAdminPanel() {
  try {
    console.log('🔧 Fixing admin panel access...')
    
    // Check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@admin.com' }
    })
    
    if (existingAdmin) {
      console.log('✅ Admin user found:', existingAdmin.email, 'Role:', existingAdmin.role)
      
      // Update role to ADMIN if not already
      if (existingAdmin.role !== 'ADMIN') {
        await prisma.user.update({
          where: { email: 'admin@admin.com' },
          data: { role: 'ADMIN' }
        })
        console.log('✅ Updated admin role to ADMIN')
      }
    } else {
      console.log('❌ Admin user not found. Creating...')
      
      // Create admin user
      const newAdmin = await prisma.user.create({
        data: {
          id: 'admin-firebase-uid',
          email: 'admin@admin.com',
          name: 'Administrator',
          role: 'ADMIN',
          emailVerified: true
        }
      })
      console.log('✅ Created admin user:', newAdmin)
    }
    
    // List all users to verify
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, role: true, name: true }
    })
    
    console.log('\n📋 All users in database:')
    allUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ID: ${user.id}`)
    })
    
    console.log('\n🎯 Admin Panel Access Instructions:')
    console.log('1. Login with: admin@admin.com / 123456')
    console.log('2. Look for "Admin Panel" button in profile dropdown')
    console.log('3. If not visible, check browser console for errors')
    console.log('4. Admin panel URL: http://localhost:3000/admin')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAdminPanel()
