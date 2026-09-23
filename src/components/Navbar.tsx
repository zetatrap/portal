import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X, Radio, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { itemCount } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'INICIO', path: '/' },
    { name: 'TIENDA', path: '/tienda' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-effect shadow-lg shadow-crimson/20' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <Radio className="w-10 h-10 text-crimson" />
              <div className="absolute inset-0 bg-crimson blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">LA ORDEN</h1>
              <p className="text-xs text-gray-400 tracking-widest">CREW</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={`relative px-4 py-2 text-sm font-bold tracking-wider transition-all duration-300 ${
                    location.pathname === item.path
                      ? 'text-crimson'
                      : 'text-white hover:text-crimson'
                  }`}
                >
                  {item.name}
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-crimson to-neon-red"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}

            <Link to="/carrito" className="relative p-2 rounded-full border border-crimson/30 hover:border-crimson/60 transition-all">
              <ShoppingCart className="w-5 h-5 text-white" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-crimson text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <Link to="/carrito" className="relative p-2 rounded-full border border-crimson/30">
              <ShoppingCart className="w-5 h-5 text-white" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-crimson text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative w-10 h-10 text-crimson focus:outline-none"
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden glass-effect border-t border-crimson/20"
        >
          <div className="px-4 pt-4 pb-6 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 text-lg font-bold tracking-wider transition-all duration-300 rounded-lg ${
                  location.pathname === item.path
                    ? 'bg-crimson text-white'
                    : 'text-white hover:bg-crimson/20'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/carrito"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-lg font-bold tracking-wider rounded-lg bg-crimson/20 text-white"
            >
              CARRITO ({itemCount})
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}

export default Navbar
