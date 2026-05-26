import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Nav from '@/components/layout/nav'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-[#0c0c1e] flex">
      {/* PC: 왼쪽 사이드바 */}
      <Nav />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 md:ml-56 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  )
}
