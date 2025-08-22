import React from 'react'
import { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Categories - Thrift Haven',
  description: 'Browse all categories of thrift clothing',
}

const categories = [
  {
    id: 1,
    name: 'T-Shirts',
    description: 'Comfortable and stylish t-shirts',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
    count: 45
  },
  {
    id: 2,
    name: 'Jeans',
    description: 'Denim jeans in various styles',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop',
    count: 32
  },
  {
    id: 3,
    name: 'Dresses',
    description: 'Beautiful dresses for every occasion',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=300&fit=crop',
    count: 28
  },
  {
    id: 4,
    name: 'Jackets',
    description: 'Warm and stylish jackets',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
    count: 21
  },
  {
    id: 5,
    name: 'Shoes',
    description: 'Footwear for every style',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop',
    count: 38
  },
  {
    id: 6,
    name: 'Accessories',
    description: 'Complete your look with accessories',
    image: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=400&h=300&fit=crop',
    count: 15
  }
]

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h1>
        <p className="text-gray-600">Discover our wide range of thrift clothing categories</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="aspect-w-16 aspect-h-12 overflow-hidden">
              <Image
                src={category.image}
                alt={category.name}
                width={400}
                height={300}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {category.count} items
                </span>
              </div>
              <p className="text-gray-600 text-sm">{category.description}</p>
              <div className="mt-4">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200">
                  Browse {category.name}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
