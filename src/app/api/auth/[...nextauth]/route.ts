import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        nickname: { label: '닉네임', type: 'text' },
        entry_code: { label: '입장코드', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.nickname || !credentials?.entry_code) return null

        const { data: user, error } = await supabase
          .from('users')
          .select('id, nickname, role')
          .eq('nickname', credentials.nickname)
          .eq('entry_code', credentials.entry_code)
          .single()

        if (error || !user) return null

        return {
          id: user.id,
          name: user.nickname,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST }
