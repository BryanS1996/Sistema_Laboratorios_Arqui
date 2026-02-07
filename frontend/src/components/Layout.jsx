import Sidebar from './Sidebar'

export default function Layout({ title, children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-5xl px-6 py-4">
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-6 py-6">{children}</div>
      </main>
    </div>
  )
}
