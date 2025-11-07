'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

interface Product {
  id: string
  name: string
  price: number
  imageUrls: string
  size: string
  category?: {
    name: string
    slug: string
  }
}

interface AnimatedProductCardProps {
  product: Product
  index: number
}

const AnimatedProductCard = ({ product, index }: AnimatedProductCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price)
  }

  // Handle imageUrls - can be JSON array string or single URL string
  let firstImage = '/placeholder-image.jpg'
  try {
    if (product.imageUrls) {
      // Try to parse as JSON array first
      const parsed = JSON.parse(product.imageUrls)
      firstImage = Array.isArray(parsed) ? (parsed[0] || '/placeholder-image.jpg') : product.imageUrls
    }
  } catch {
    // If parsing fails, treat as single URL string
    firstImage = product.imageUrls || '/placeholder-image.jpg'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <Card className="group cursor-pointer hover:shadow-lg transition-shadow overflow-hidden">
        <Link href={`/products/${product.id}`}>
          <motion.div 
            className="aspect-square overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={firstImage}
              alt={product.name}
              width={400}
              height={400}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
          </motion.div>
          <CardContent className="p-4">
            <motion.h3 
              className="font-semibold mb-2 group-hover:text-primary transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              {product.name}
            </motion.h3>
            <motion.div 
              className="flex justify-between items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm text-muted-foreground">
                Size {product.size}
              </span>
            </motion.div>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  )
}

export default AnimatedProductCard
