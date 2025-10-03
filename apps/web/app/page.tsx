'use client';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserButton } from '@clerk/nextjs';

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm z-10">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-end items-center">
              <UserButton />
            </div>
          </div>
        </div>
        
        <div className="pt-80 pb-8 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/20">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Todo App
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                タスクを効率的に管理しましょう
              </p>
              <p className="text-gray-500 mb-8">
                まずサインインしてからTodoリストをご利用ください
              </p>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm z-10">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Todo App
              </h1>
              <p className="text-gray-600 mt-1">タスクを効率的に管理しましょう</p>
            </div>
            <UserButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-80 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/20 text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">ようこそ！</h2>
            <p className="text-gray-600 mb-8 text-lg">
              タスク管理を始めましょう。Todoリストでは以下の機能をご利用いただけます：
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">📝 Todo管理</h3>
                <p className="text-gray-600">タスクの作成、編集、削除、完了マーク</p>
              </div>
              <div className="bg-white/50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">🔍 ソート機能</h3>
                <p className="text-gray-600">作成日、タイトル、完了状態で並び替え</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Link href="/todos">
                <Button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg">
                  Todoリストを見る
                </Button>
              </Link>
              <Link href="/todos/create">
                <Button variant="outline" className="px-8 py-3 text-lg">
                  新しいタスクを作成
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}