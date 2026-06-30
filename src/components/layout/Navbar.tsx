import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Moon, Sun, LogOut, User, LayoutDashboard, Menu, X } from 'lucide-react'
import { useDarkMode } from '../../hooks/useDarkMode'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

export function Navbar() {
  const { isDark, toggleDarkMode } = useDarkMode()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out successfully')
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">IH</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">InterviewHub</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDark ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-gray-600" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard" className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <Link to="/profile" className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                  <User size={16} />
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium text-red-600 transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDark ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-gray-600" />}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {menuOpen ? <X size={22} className="text-gray-700 dark:text-gray-300" /> : <Menu size={22} className="text-gray-700 dark:text-gray-300" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 py-3 space-y-1">
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <User size={18} /> Profile
                </Link>
                <button onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium text-red-600">
                  <LogOut size={18} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Login
                </Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium text-center">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}