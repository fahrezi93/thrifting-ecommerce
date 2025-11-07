'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface RotatingCategoryCardProps {
  category: {
    id: string
    name: string
    slug: string
    description?: string
    imageUrl?: string
    _count: {
      products: number
    }
  }
  index: number
}

export function RotatingCategoryCard({ category, index }: RotatingCategoryCardProps) {
  const [images, setImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategoryImages = async () => {
      try {
        const response = await fetch(`/api/products?category=${category.slug}`)
        if (response.ok) {
          const products = await response.json()
          const productImages: string[] = []
          
          products.forEach((product: any) => {
            if (product.imageUrls && Array.isArray(product.imageUrls)) {
              productImages.push(...product.imageUrls)
            }
          })

          if (productImages.length > 0) {
            setImages(productImages.slice(0, 5)) // Max 5 images
          } else {
            setImages([category.imageUrl || '/placeholder-image.jpg'])
          }
        }
      } catch (error) {
        console.error('Error fetching category images:', error)
        setImages([category.imageUrl || '/placeholder-image.jpg'])
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryImages()
  }, [category.slug, category.imageUrl])

  // Rotate images every 2 seconds with random selection
  useEffect(() => {
    if (images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * images.length);
        } while (newIndex === prev && images.length > 1);
        return newIndex;
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [images.length])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1 
      }}
      whileHover={{ y: -5 }}
    >
      <Link
        href={`/categories/${category.slug}`}
        className="group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 block"
      >
        <div className="aspect-w-16 aspect-h-12 overflow-hidden bg-gray-100 relative h-48">
          {!loading && images.length > 0 && (
            <>
              {images.map((image, idx) => (
                <Image
                  key={idx}
                  src={image}
                  alt={`${category.name} ${idx + 1}`}
                  fill
                  className={`object-cover transition-opacity duration-700 ${
                    idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/30 transition-colors" />
            </>
          )}
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
              {category.name}
            </h3>
            <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
              {category._count.products} items
            </span>
          </div>
          <p className="text-gray-600 text-sm">{category.description || 'Explore our collection'}</p>
          <div className="mt-4">
            <motion.div 
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 text-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Browse {category.name}
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
