'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ScrollReveal from '@/components/ui/scroll-reveal'
import { RotatingCategoryCard } from '@/components/ui/rotating-category-card'

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
            <RotatingCategoryCard category={category} index={index} />
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
