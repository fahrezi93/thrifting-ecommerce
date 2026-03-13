import { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Sign In - Thrift Haven',
  description: 'Sign in to your account',
}

export default function SignInPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Kiri : Ilustrasi atau Panel Vibe Premium */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Thrift Haven
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Sustainable fashion for the conscious shopper. Discover unique, quality pre-loved clothing and make a positive impact on the environment."
            </p>
            <footer className="text-sm">Sofia Davis, Founder</footer>
          </blockquote>
        </div>
      </div>

      {/* Kanan : Form Utama */}
      <div className="lg:p-8 flex items-center justify-center p-4">
        <Suspense fallback={<div>Loading form...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
