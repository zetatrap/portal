import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCart } from '../context/CartContext'

const CartPage = () => {
  const { items, total, removeFromCart, clearCart } = useCart()

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 relative">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-crimson uppercase tracking-[0.25em] text-sm mb-2">Carrito</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">SELECCIÓN ACTUAL</h1>
          </div>

          <Link to="/tienda" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver a la tienda
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="glass-effect rounded-3xl border border-crimson/20 p-10 text-center">
            <ShoppingBag className="w-16 h-16 text-crimson mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">No hay beats seleccionados</h2>
            <p className="text-gray-400 mb-8">Agrega un beat desde la tienda para continuar con la compra.</p>
            <Link
              to="/tienda"
              className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-crimson to-neon-red text-white font-bold"
            >
              Explorar tienda
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-8">
            <div className="space-y-5">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className="glass-effect rounded-2xl border border-crimson/20 p-5 flex flex-col md:flex-row items-center md:items-start justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-crimson/30 to-space-black flex items-center justify-center text-3xl">
                      {item.image_url}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white">{item.name}</h3>
                      <p className="text-sm text-gray-400">{item.category_slug}</p>
                      <p className="text-sm text-gray-300 mt-2">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gradient">€{item.price}</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-3 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 transition-colors"
                      aria-label={`Quitar ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <aside className="glass-effect rounded-3xl border border-crimson/20 p-6 h-fit sticky top-28">
              <p className="text-sm uppercase tracking-[0.25em] text-crimson mb-4">Resumen</p>
              <div className="space-y-4 text-lg">
                <div className="flex justify-between text-gray-300">
                  <span>Beat</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex justify-between text-white text-2xl font-bold">
                  <span>Total</span>
                  <span>€{total}</span>
                </div>
              </div>

              <Link
                to={items.length > 0 ? '/checkout' : '/tienda'}
                className={`mt-6 block text-center px-6 py-3 rounded-full font-bold transition-all ${
                  items.length > 0
                    ? 'bg-gradient-to-r from-crimson to-neon-red text-white shadow-lg shadow-crimson/40 hover:shadow-crimson/60'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {items.length > 0 ? 'Comprar' : 'Selecciona un beat'}
              </Link>

              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="mt-4 w-full px-4 py-3 rounded-full border border-white/15 text-gray-300 hover:text-white hover:border-crimson/40 transition-all"
                >
                  Vaciar carrito
                </button>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartPage
