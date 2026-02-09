import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, Menu } from 'lucide-react'
import { UCELogoImage } from "./UCELogoImage";
import { cn } from "./ui/shim";

export default function Header({ className, onMenuClick }) {
    const { user, logout } = useAuth()

    return (
        <header className={cn("w-full p-4 flex items-center justify-between bg-blue-900 border-b border-blue-800 z-30 text-white shadow-md", className)}>

            <div className="flex items-center gap-3 select-none">
                {/* Mobile Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="mr-1 md:hidden p-2 -ml-2 text-white hover:bg-blue-800 rounded-lg"
                >
                    <Menu size={24} />
                </button>

                {/* Left Side: Always Logo and Title */}
                <div className="flex items-center gap-3">
                    <div className="bg-white/90 p-1 rounded-full">
                        <UCELogoImage className="w-10 h-auto sm:w-14 object-contain" />
                    </div>

                    {/* Vertical separator */}
                    <div className="h-10 w-px bg-white/20 hidden sm:block"></div>

                    {/* Texts */}
                    <div className="flex flex-col justify-center text-white">
                        <h2 className="text-sm sm:text-base font-bold uppercase tracking-widest leading-none text-shadow-sm">
                            SISTEMA DE LABORATORIOS
                        </h2>
                        <span className="text-xs sm:text-sm font-medium tracking-wide text-blue-100">
                            Universidad Central del Ecuador
                        </span>
                        <p className="hidden md:block text-[10px] italic font-serif mt-0.5 tracking-wider opacity-80 text-blue-200">
                            "Omnium Potentior Est Sapientia"
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: User Controls - ONLY WHEN LOGGED IN */}
            {user && (
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-3 bg-blue-800/50 px-3 py-1.5 rounded-full border border-blue-700/50">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 shrink-0">
                            <User size={16} />
                        </div>
                        <div className="text-sm text-right hidden sm:block">
                            <p className="font-medium text-white leading-none">{user.nombre}</p>
                            <p className="text-xs text-blue-200 font-medium capitalize mt-0.5">{user.role}</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center gap-2 rounded-lg bg-red-600/90 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 transition-colors shadow-sm"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">Salir</span>
                    </button>
                </div>
            )}
        </header>
    )
}
