import Header from './Header'
import Footer from './Footer'

export default function PublicLayout({ children }) {
    return (
        <div className="dark flex h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 overflow-hidden">
            <Header className="bg-blue-900/90" />
            <main className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col">
                {children}
            </main>
            <Footer className="mt-auto" />
        </div>
    )
}
