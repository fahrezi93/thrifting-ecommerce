// This file is not used since we're using Firebase Auth
// Keeping it for compatibility but it won't be functional
import NextAuth from 'next-auth'

const authOptions = {
  providers: [],
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
