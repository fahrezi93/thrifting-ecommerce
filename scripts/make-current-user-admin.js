const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function makeCurrentUserAdmin() {
  try {
    // Get the current user email from the screenshot - admin@admin.com
    const userEmail = 'admin@admin.com'
    
    console.log(`Looking for user with email: ${userEmail}`)
    
    // Find and update the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })
    
    if (!user) {
      console.log('User not found, creating admin user...')
      const newUser = await prisma.user.create({
        data: {
          id: `admin-${Date.now()}`,
          email: userEmail,
          name: 'Administrator',
          role: 'ADMIN',
          emailVerified: true
        }
      })
      console.log('Admin user created:', newUser.email)
    } else {
      console.log('User found, updating role to ADMIN...')
      const updatedUser = await prisma.user.update({
        where: { email: userEmail },
        data: { role: 'ADMIN' }
      })
      console.log('User role updated to ADMIN:', updatedUser.email)
    }
    
    console.log('✅ Admin setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Error setting up admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

makeCurrentUserAdmin()
