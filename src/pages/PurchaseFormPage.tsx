import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Mail, User, Phone, MessageSquare } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { ordersService } from '../services/api'

const PurchaseFormPage = () => {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCart()
  const selectedBeat = items[0] ?? null

  const [formData, setFormData] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    buyerMessage: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [orderCreated, setOrderCreated] = useState<{ orderId: number; totalAmount: number } | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'cash'>('card')

  const paymentOptions = [
    { id: 'card', label: 'Tarjeta', subtitle: 'Visa •••• 4242', accent: 'from-crimson to-neon-red' },
    { id: 'transfer', label: 'Transferencia', subtitle: 'Banco / CBU', accent: 'from-blue-500 to-cyan-500' },
    { id: 'cash', label: 'Efectivo', subtitle: 'Pago presencial', accent: 'from-amber-500 to-yellow-500' },
  ] as const

  if (!selectedBeat) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
        <div className="glass-effect rounded-3xl border border-crimson/20 p-10 text-center max-w-xl">
          <h2 className="text-3xl font-bold text-white mb-4">No hay beat seleccionado</h2>
          <p className="text-gray-400 mb-6">Primero elige un beat para continuar con la compra.</p>
          <Link to="/tienda" className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-crimson to-neon-red text-white font-bold">
            Ir a la tienda
          </Link>
        </div>
      </div>
    )
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!formData.buyerName || !formData.buyerEmail) {
      setError('Nombre y email son obligatorios.')
      return
    }

    setLoading(true)

    try {
      const response = await ordersService.checkout({
        userId: null,
        buyerName: formData.buyerName,
        buyerEmail: formData.buyerEmail,
        buyerPhone: formData.buyerPhone,
        buyerMessage: formData.buyerMessage,
        paymentMethod: 'pending',
        items: [
          {
            productId: selectedBeat.id,
            quantity: 1,
            price: selectedBeat.price,
          },
        ],
      })

      setOrderCreated({
        orderId: response.data.orderId,
        totalAmount: response.data.totalAmount,
      })
    } catch (err: any) {
      setError(err.message || 'No se pudo guardar la compra.')
    } finally {
      setLoading(false)
    }
  }

  const handleSimulatedPayment = async () => {
    if (!orderCreated) {
      setError('Primero crea la orden para continuar con el pago.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await ordersService.completeCheckout(orderCreated.orderId)
      clearCart()
      setSuccess(true)

      setTimeout(() => {
        navigate('/tienda')
      }, 2200)
    } catch (err: any) {
      setError(err.message || 'No se pudo confirmar el pago simulado.')
    } finally {
      setLoading(false)
    }
  }

  const selectedPayment = paymentOptions.find((option) => option.id === paymentMethod) ?? paymentOptions[0]

  if (success) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
        <div className="glass-effect rounded-3xl border border-crimson/20 p-10 text-center max-w-xl">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Pago confirmado</h2>
          <p className="text-gray-300 mb-2">Gracias, {formData.buyerName}.</p>
          <p className="text-gray-400">Tu compra quedó registrada correctamente y la sesión fue cerrada al finalizar el pago.</p>
        </div>
      </div>
    )
  }

  if (orderCreated) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 relative">
        <div className="max-w-2xl mx-auto">
          <div className="glass-effect rounded-3xl border border-crimson/20 p-8">
            <p className="text-sm uppercase tracking-[0.25em] text-crimson mb-4">Pasarela de pago</p>
            <h2 className="text-3xl font-bold text-white mb-4">Simulación de pago</h2>
            <p className="text-gray-300 mb-6">
              La compra quedó creada con éxito. Elegí el método de pago y simulá la aprobación del cobro.
            </p>

            <div className="space-y-3 mb-6">
              {paymentOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPaymentMethod(option.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    paymentMethod === option.id
                      ? 'border-crimson bg-crimson/10 shadow-lg shadow-crimson/20'
                      : 'border-white/10 bg-black/10 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-white font-semibold">{option.label}</p>
                      <p className="text-gray-400 text-sm">{option.subtitle}</p>
                    </div>
                    <div className={`h-10 w-10 rounded-full bg-gradient-to-r ${option.accent}`} />
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-crimson/20 bg-black/20 p-5 mb-6">
              <div className="flex justify-between text-gray-300 mb-2">
                <span>Orden</span>
                <span>#{orderCreated.orderId}</span>
              </div>
              <div className="flex justify-between text-gray-300 mb-2">
                <span>Método</span>
                <span>{selectedPayment.label}</span>
              </div>
              <div className="flex justify-between text-white text-xl font-bold pt-3 border-t border-white/10">
                <span>Total</span>
                <span>€{orderCreated.totalAmount}</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSimulatedPayment}
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-crimson to-neon-red px-6 py-3 font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Procesando pago...' : `Pagar con ${selectedPayment.label.toLowerCase()}`}
            </button>

            <button
              type="button"
              onClick={() => setOrderCreated(null)}
              className="mt-4 w-full rounded-full border border-gray-600 px-6 py-3 font-bold text-gray-200"
            >
              Volver al formulario
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 relative">
      <div className="max-w-5xl mx-auto">
        <Link to="/checkout" className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver a la previa
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8">
          <div className="glass-effect rounded-3xl border border-crimson/20 p-6 h-fit">
            <p className="text-sm uppercase tracking-[0.25em] text-crimson mb-4">Resumen del beat</p>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-crimson/30 to-space-black flex items-center justify-center text-3xl">
                {selectedBeat.image_url}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedBeat.name}</h3>
                <p className="text-gray-400">{selectedBeat.category_slug}</p>
              </div>
            </div>
            <div className="space-y-3 text-lg">
              <div className="flex justify-between text-gray-300">
                <span>Precio</span>
                <span>€{selectedBeat.price}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Licencia</span>
                <span>Uso comercial</span>
              </div>
              <div className="flex justify-between text-white text-2xl font-bold pt-3 border-t border-white/10">
                <span>Total</span>
                <span>€{total}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="glass-effect rounded-3xl border border-crimson/20 p-8 space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-crimson mb-2">Datos del cliente</p>
              <h2 className="text-3xl font-bold text-white">Completar compra</h2>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-300 font-medium">
                <User className="w-4 h-4 text-crimson" />
                Nombre completo
              </label>
              <input
                type="text"
                name="buyerName"
                value={formData.buyerName}
                onChange={handleChange}
                placeholder="Tu nombre"
                className="w-full rounded-xl border border-crimson/30 bg-space-black/60 px-4 py-3 text-white placeholder:text-gray-500 focus:border-crimson focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-300 font-medium">
                  <Mail className="w-4 h-4 text-crimson" />
                  Email
                </label>
                <input
                  type="email"
                  name="buyerEmail"
                  value={formData.buyerEmail}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className="w-full rounded-xl border border-crimson/30 bg-space-black/60 px-4 py-3 text-white placeholder:text-gray-500 focus:border-crimson focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-300 font-medium">
                  <Phone className="w-4 h-4 text-crimson" />
                  Celular
                </label>
                <input
                  type="tel"
                  name="buyerPhone"
                  value={formData.buyerPhone}
                  onChange={handleChange}
                  placeholder="(Opcional)"
                  className="w-full rounded-xl border border-crimson/30 bg-space-black/60 px-4 py-3 text-white placeholder:text-gray-500 focus:border-crimson focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-300 font-medium">
                <MessageSquare className="w-4 h-4 text-crimson" />
                Mensaje o detalle
              </label>
              <textarea
                name="buyerMessage"
                value={formData.buyerMessage}
                onChange={handleChange}
                rows={5}
                placeholder="Cuéntanos para qué lo vas a usar o si querés algún detalle extra."
                className="w-full rounded-xl border border-crimson/30 bg-space-black/60 px-4 py-3 text-white placeholder:text-gray-500 focus:border-crimson focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-crimson to-neon-red px-6 py-3 font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando compra...' : 'Confirmar compra'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PurchaseFormPage
