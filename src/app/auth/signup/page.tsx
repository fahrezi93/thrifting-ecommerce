import { Metadata } from 'next'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a new account',
}

export default function SignUpPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <RegisterForm />
    </div>
  )
}
