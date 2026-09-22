import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, Smartphone, Video, Globe, ShoppingCart, Star, Loader2 } from 'lucide-react'
import { productsService } from '../services/api'

type Category = 'all' | 'beats' | 'apps' | 'videos' | 'webs'

interface Product {
  id: number
  name: string
  slug: string
  category_slug: string
  price: number
  description: string
  rating: number
  image_url: string
}

const Store = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Cargar productos al montar y cuando cambie la categoría
  useEffect(() => {
    loadProducts()
  }, [selectedCategory])

  const loadProducts = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await productsService.getAll({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
      })

      setProducts(response.data || [])
      console.log('✅ Productos cargados:', response.count)
    } catch (err: any) {
      console.error('❌ Error al cargar productos:', err)
      setError('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', name: 'TODO', icon: Star },
    { id: 'beats', name: 'BEATS', icon: Music },
    { id: 'apps', name: 'APLICACIONES', icon: Smartphone },
    { id: 'videos', name: 'VIDEOS', icon: Video },
    { id: 'webs', name: 'WEBS', icon: Globe },
  ]

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            TIENDA ESPACIAL
          </h1>
          <p className="text-xl text-gray-400">
            Descubre herramientas y recursos del futuro musical
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id as Category)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-crimson to-neon-red text-white shadow-lg shadow-crimson/50'
                    : 'glass-effect text-gray-300 hover:text-white border border-crimson/30'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{category.name}</span>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-16 h-16 text-crimson animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-2xl text-red-400">{error}</p>
            <button
              onClick={loadProducts}
              className="mt-4 px-6 py-3 bg-crimson text-white rounded-lg"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="glass-effect rounded-2xl overflow-hidden neon-border group hover:shadow-2xl hover:shadow-crimson/30 transition-all duration-300"
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-gradient-to-br from-space-black to-crimson/20 flex items-center justify-center text-7xl">
                    {product.image_url}
                    <div className="absolute inset-0 bg-crimson/0 group-hover:bg-crimson/10 transition-all duration-300"></div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-white">{product.name}</h3>
                      <div className="flex items-center space-x-1">
                        {[...Array(Math.round(product.rating))].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-crimson text-crimson" />
                        ))}
                      </div>
                    </div>

                    <p className="text-gray-400 mb-4 text-sm">{product.description}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gradient">
                        €{product.price}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 bg-gradient-to-r from-crimson to-neon-red rounded-full shadow-lg shadow-crimson/50 hover:shadow-crimson/70 transition-all duration-300"
                      >
                        <ShoppingCart className="w-5 h-5 text-white" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <p className="text-2xl text-gray-400">
              No hay productos en esta categoría... por ahora 🚀
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Store
