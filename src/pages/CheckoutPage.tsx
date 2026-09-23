import { Link } from 'react-router-dom'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import { useCart } from '../context/CartContext'

const CheckoutPage = () => {
  const { items, total, clearCart } = useCart()
  const selectedBeat = items[0] ?? null

  if (!selectedBeat) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
        <div className="glass-effect rounded-3xl border border-crimson/20 p-10 text-center max-w-xl">
          <h2 className="text-3xl font-bold text-white mb-4">No hay beat seleccionado</h2>
          <p className="text-gray-400 mb-6">Primero agrega un beat al carrito para continuar con la compra.</p>
          <Link to="/tienda" className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-crimson to-neon-red text-white font-bold">
            Ir a la tienda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 relative">
      <div className="max-w-5xl mx-auto">
        <Link to="/carrito" className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al carrito
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <div className="glass-effect rounded-3xl border border-crimson/20 p-8">
            <p className="text-sm uppercase tracking-[0.25em] text-crimson mb-4">Previsualización</p>
            <div className="flex items-center gap-5 mb-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-crimson/30 to-space-black flex items-center justify-center text-4xl">
                {selectedBeat.image_url}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{selectedBeat.name}</h1>
                <p className="text-gray-400">{selectedBeat.category_slug}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-crimson/20 bg-black/20 p-6 mb-6">
              <p className="text-gray-300 leading-relaxed">{selectedBeat.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="glass-effect rounded-xl p-4">
                <p className="text-gray-400">Formato</p>
                <p className="font-bold text-white mt-2">WAV / MP3</p>
              </div>
              <div className="glass-effect rounded-xl p-4">
                <p className="text-gray-400">Licencia</p>
                <p className="font-bold text-white mt-2">Uso comercial</p>
              </div>
            </div>
          </div>

          <aside className="glass-effect rounded-3xl border border-crimson/20 p-6 h-fit sticky top-28">
            <p className="text-sm uppercase tracking-[0.25em] text-crimson mb-4">Resumen</p>
            <div className="space-y-4 text-lg">
              <div className="flex justify-between text-gray-300">
                <span>Beat</span>
                <span>{selectedBeat.name}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Precio</span>
                <span>€{selectedBeat.price}</span>
              </div>
              <div className="flex justify-between text-white text-2xl font-bold">
                <span>Total</span>
                <span>€{total}</span>
              </div>
            </div>

            <Link
              to="/purchase-form"
              onClick={() => {
                if (items.length === 0) {
                  clearCart()
                }
              }}
              className="mt-6 block text-center px-6 py-3 rounded-full bg-gradient-to-r from-crimson to-neon-red text-white font-bold shadow-lg shadow-crimson/40"
            >
              Finalizar compra
            </Link>

            <div className="mt-5 flex items-center gap-3 text-green-400 text-sm">
              <CheckCircle className="w-5 h-5" />
              Compra segura y rápida
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
