import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, ArrowLeft, DollarSign, Package, Users, ShoppingCart, Loader2 } from 'lucide-react'
import { adminProductsService } from '../services/api'

type ActivityLog = {
  id: number
  action: string
  entity_type: string
  entity_id: number | null
  entity_name: string | null
  user_name: string
  details: Record<string, any>
  created_at: string
}

type ProductRow = {
  id: number
  name: string
  slug: string
  price: number
  is_active: boolean
  is_featured: boolean
  created_at: string
}

type OrderRow = {
  id: number
  buyer_name: string | null
  buyer_email: string | null
  total_amount: number
  payment_status: string
  status: string
  created_at: string
}

type ContactRow = {
  id: number
  name: string
  email: string
  status: string
  created_at: string
}

type ActivityData = {
  summary: {
    total_products: number
    total_orders: number
    total_contacts: number
    active_products: number
    total_sales: number
  }
  products: ProductRow[]
  orders: OrderRow[]
  contacts: ContactRow[]
  logs: ActivityLog[]
}

const formatCurrency = (value: number | string | null) => {
  const safe = Number(value ?? 0)
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(safe)
}

const formatDate = (value: string | null) => {
  if (!value) return '—'

  try {
    return new Date(value).toLocaleString('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return value
  }
}

const AdminDbPage = () => {
  const [data, setData] = useState<ActivityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadActivity = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await adminProductsService.getActivity()
        const payload = response?.data ?? response
        setData(payload)
      } catch (err: any) {
        console.error('Error cargando actividad admin:', err)
        setError(err.message || 'No se pudo cargar la actividad del sistema.')
      } finally {
        setLoading(false)
      }
    }

    loadActivity()
  }, [])

  const latestOrders = useMemo(() => data?.orders ?? [], [data])
  const latestProducts = useMemo(() => data?.products ?? [], [data])
  const latestContacts = useMemo(() => data?.contacts ?? [], [data])
  const latestLogs = useMemo(() => data?.logs ?? [], [data])

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-400 mb-2">Panel de control</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">DB / ACTIVIDAD</h1>
          </div>

          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-white hover:border-cyan-400/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al admin
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-cyan-300">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
              <div className="glass-effect rounded-2xl border border-cyan-500/20 p-4">
                <div className="flex items-center justify-between text-cyan-300 mb-3">
                  <Package className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-[0.2em]">Beats</span>
                </div>
                <p className="text-3xl font-bold text-white">{data?.summary.total_products ?? 0}</p>
              </div>

              <div className="glass-effect rounded-2xl border border-cyan-500/20 p-4">
                <div className="flex items-center justify-between text-cyan-300 mb-3">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-[0.2em]">Ventas</span>
                </div>
                <p className="text-3xl font-bold text-white">{data?.summary.total_orders ?? 0}</p>
              </div>

              <div className="glass-effect rounded-2xl border border-cyan-500/20 p-4">
                <div className="flex items-center justify-between text-cyan-300 mb-3">
                  <Users className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-[0.2em]">Contactos</span>
                </div>
                <p className="text-3xl font-bold text-white">{data?.summary.total_contacts ?? 0}</p>
              </div>

              <div className="glass-effect rounded-2xl border border-cyan-500/20 p-4">
                <div className="flex items-center justify-between text-cyan-300 mb-3">
                  <Activity className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-[0.2em]">Activos</span>
                </div>
                <p className="text-3xl font-bold text-white">{data?.summary.active_products ?? 0}</p>
              </div>

              <div className="glass-effect rounded-2xl border border-cyan-500/20 p-4">
                <div className="flex items-center justify-between text-cyan-300 mb-3">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-[0.2em]">Ingresos</span>
                </div>
                <p className="text-3xl font-bold text-white">{formatCurrency(data?.summary.total_sales ?? 0)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              <section className="glass-effect rounded-3xl border border-cyan-500/20 p-5">
                <h2 className="text-2xl font-bold text-white mb-4">Últimos beats</h2>
                <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
                  {latestProducts.length === 0 ? (
                    <p className="text-gray-400">No hay beats registrados.</p>
                  ) : (
                    latestProducts.map((product) => (
                      <div key={product.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">{product.name}</p>
                            <p className="text-sm text-gray-400">/{product.slug}</p>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-[10px] uppercase font-bold ${product.is_active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                            {product.is_active ? 'activo' : 'inactivo'}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm text-gray-300">
                          <span>{formatCurrency(product.price)}</span>
                          <span>{product.is_featured ? 'destacado' : 'normal'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="glass-effect rounded-3xl border border-cyan-500/20 p-5">
                <h2 className="text-2xl font-bold text-white mb-4">Últimas ventas</h2>
                <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
                  {latestOrders.length === 0 ? (
                    <p className="text-gray-400">No hay ventas registradas.</p>
                  ) : (
                    latestOrders.map((order) => (
                      <div key={order.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">{order.buyer_name || 'Comprador sin nombre'}</p>
                            <p className="text-sm text-gray-400">{order.buyer_email || 'Sin email'}</p>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-[10px] uppercase font-bold ${order.payment_status === 'paid' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-yellow-500/15 text-yellow-300'}`}>
                            {order.payment_status}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm text-gray-300">
                          <span>{formatCurrency(order.total_amount)}</span>
                          <span>{order.status}</span>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">{formatDate(order.created_at)}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <section className="glass-effect rounded-3xl border border-cyan-500/20 p-5">
                <h2 className="text-2xl font-bold text-white mb-4">Contactos</h2>
                <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
                  {latestContacts.length === 0 ? (
                    <p className="text-gray-400">No hay mensajes de contacto.</p>
                  ) : (
                    latestContacts.map((contact) => (
                      <div key={contact.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">{contact.name}</p>
                            <p className="text-sm text-gray-400">{contact.email}</p>
                          </div>
                          <span className="rounded-full bg-cyan-500/15 px-2 py-1 text-[10px] uppercase font-bold text-cyan-300">
                            {contact.status}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">{formatDate(contact.created_at)}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="glass-effect rounded-3xl border border-cyan-500/20 p-5">
                <h2 className="text-2xl font-bold text-white mb-4">Registro de actividad</h2>
                <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
                  {latestLogs.length === 0 ? (
                    <p className="text-gray-400">Todavía no hay actividad registrada.</p>
                  ) : (
                    latestLogs.map((log) => (
                      <div key={log.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-white uppercase text-xs tracking-[0.15em]">{log.action}</span>
                          <span className="text-[10px] text-gray-400">{formatDate(log.created_at)}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-300">{log.entity_type} · {log.entity_name || 'sin nombre'}</p>
                        <p className="mt-1 text-xs text-cyan-300">Usuario: {log.user_name}</p>
                        <pre className="mt-2 overflow-auto rounded-xl bg-black/30 p-2 text-[10px] text-gray-300 whitespace-pre-wrap">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminDbPage
