const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function initStoreSettings() {
  try {
    console.log('Initializing store settings...')
    
    // Check if store settings already exist
    const existingSettings = await prisma.storeSettings.findUnique({
      where: { id: 'store' }
    })
    
    if (existingSettings) {
      console.log('Store settings already exist:', existingSettings)
      return
    }
    
    // Create default store settings
    const settings = await prisma.storeSettings.create({
      data: {
        id: 'store',
        storeName: 'Thrift Haven',
        storeDescription: 'Sustainable fashion for the conscious shopper. Discover unique, quality pre-loved clothing.',
        storeEmail: 'hello@thrifthaven.com',
        storePhone: '+62 123 456 7890',
        storeAddress: 'Jakarta, Indonesia',
        isStoreActive: true,
        allowRegistration: true,
        maintenanceMode: false,
      }
    })
    
    console.log('Store settings initialized successfully:', settings)
  } catch (error) {
    console.error('Error initializing store settings:', error)
  } finally {
    await prisma.$disconnect()
  }
}

initStoreSettings()
