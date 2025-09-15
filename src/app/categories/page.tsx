'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import ScrollReveal from '@/components/ui/scroll-reveal'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  _count: {
    products: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h1>
        <p className="text-gray-600">Discover our wide range of thrift clothing categories</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <ScrollReveal key={category.id} direction="up" delay={index * 0.1}>
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href={`/products?category=${category.slug}`}
                className="group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 block"
              >
                <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                  <Image
                    src={category.imageUrl || '/placeholder-image.jpg'}
                    alt={category.name}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
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
          </ScrollReveal>
        ))}
      </div>

      {categories.length === 0 && (
        <ScrollReveal direction="up" delay={0.1}>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No categories available
            </h3>
            <p className="text-gray-600">
              Categories will appear here once they are added by the admin.
            </p>
          </div>
        </ScrollReveal>
      )}
    </div>
  )
}
