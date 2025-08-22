import { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your account',
}

export default function SignInPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <LoginForm />
    </div>
  )
}
