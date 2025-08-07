import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { User } from '@/lib/models'
import dbConnect from '@/lib/mongodb'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          await dbConnect()
          
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase() 
          }).select('+password')
          
          if (!user) {
            return null
          }

          // Check if email is verified
          if (!user.emailVerified) {
            throw new Error('Please verify your email before signing in')
          }

          // For drivers, check if they are approved
          if (user.type === 'driver') {
            const { Driver } = await import('@/lib/models')
            const driver = await Driver.findOne({ userId: user._id })
            if (!driver?.approved) {
              throw new Error('Your driver account is pending approval')
            }
          }

          const isPasswordValid = await user.comparePassword(credentials.password)
          
          if (!isPasswordValid) {
            return null
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            type: user.type,
            profilePhoto: user.profilePhoto
          }
        } catch (error) {
          console.error('Auth error:', error)
          if (error instanceof Error) {
            throw error
          }
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.type = user.type
        token.profilePhoto = user.profilePhoto
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.type = token.type as string
        session.user.profilePhoto = token.profilePhoto as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // If the url is just the base URL (e.g., after signin), redirect to our custom redirect handler
      if (url === baseUrl) {
        return `${baseUrl}/api/auth/redirect`
      }
      
      // If url is relative, make it absolute
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // If url is on the same origin, allow it
      if (new URL(url).origin === baseUrl) {
        return url
      }
      
      // Otherwise, redirect to base URL
      return baseUrl
    }
  },
  pages: {
    signIn: '/signin',
    error: '/signin'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
}
