import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'

export default function AppLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}

