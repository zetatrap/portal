import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Package, Image as ImageIcon, Music4, Sparkles, Loader2 } from 'lucide-react'
import { adminProductsService } from '../services/api'

type AdminProduct = {
  id: number
  name: string
  slug: string
  category_slug: string
  price: number
  description: string
  image_url: string
  audio_url: string
  rating: number
  is_featured: boolean
  is_active: boolean
}

type FormState = {
  id?: number
  name: string
  slug: string
  category_slug: string
  price: string
  description: string
  image_url: string
  audio_url: string
  rating: string
  is_featured: boolean
  is_active: boolean
}

const exampleProducts: AdminProduct[] = [
  {
    id: 1,
    name: 'Neon Sunset',
    slug: 'neon-sunset',
    category_slug: 'beats',
    price: 49.99,
    description: 'Beat melódico con atmósfera nocturna y groove suave para rap y R&B.',
    image_url: '🌆',
    audio_url: 'https://audio.example.com/neon-sunset.mp3',
    rating: 5,
    is_featured: true,
    is_active: true,
  },
  {
    id: 2,
    name: 'Midnight Drift',
    slug: 'midnight-drift',
    category_slug: 'beats',
    price: 39.99,
    description: 'Instrumental de trap con 808 profundo y sintetizadores de alto brillo.',
    image_url: '🌙',
    audio_url: 'https://audio.example.com/midnight-drift.mp3',
    rating: 4.5,
    is_featured: true,
    is_active: true,
  },
  {
    id: 3,
    name: 'Street Echo',
    slug: 'street-echo',
    category_slug: 'instrumentales',
    price: 59.99,
    description: 'Beat urbano con percusión marcada y vibra de calle para hooks intensos.',
    image_url: '🎧',
    audio_url: 'https://audio.example.com/street-echo.mp3',
    rating: 4.8,
    is_featured: false,
    is_active: true,
  },
]

const emptyForm = (): FormState => ({
  name: '',
  slug: '',
  category_slug: 'beats',
  price: '0',
  description: '',
  image_url: '🎵',
  audio_url: '',
  rating: '5',
  is_featured: false,
  is_active: true,
})

const AdminPanelPage = () => {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await adminProductsService.getAll()
      const data = Array.isArray(response?.data) ? response.data : []
      setProducts(data.length > 0 ? data : exampleProducts)

      if (data.length === 0) {
        setMessage('No hay beats en la base de datos; se mostraron ejemplos de prueba.')
      }
    } catch (err: any) {
      console.error('Error al cargar beats del admin:', err)
      setProducts(exampleProducts)
      setError(err.message || 'No se pudo conectar con el backend.')
    } finally {
      setLoading(false)
    }
  }

  const totalValue = useMemo(
    () => products.reduce((sum, product) => sum + (Number(product.price) || 0), 0),
    [products]
  )

  const resetForm = () => {
    setSelectedId(null)
    setForm(emptyForm())
  }

  const applyExampleProducts = () => {
    setProducts(exampleProducts)
    resetForm()
    setMessage('Se vincularon los beats de ejemplo a la vista del panel.')
  }

  const handleFieldChange = (field: keyof FormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleEdit = (product: AdminProduct) => {
    setSelectedId(product.id)
    setForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category_slug: product.category_slug,
      price: String(product.price),
      description: product.description,
      image_url: product.image_url,
      audio_url: product.audio_url,
      rating: String(product.rating),
      is_featured: product.is_featured,
      is_active: product.is_active,
    })
    setMessage('Editando beat existente.')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!form.name.trim() || !form.description.trim()) {
      setError('Faltan nombre y descripción para guardar el beat.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || form.name.trim().toLowerCase().replace(/\s+/g, '-'),
        description: form.description.trim(),
        price: Number(form.price) || 0,
        categorySlug: form.category_slug.trim() || 'beats',
        imageUrl: form.image_url.trim() || '🎵',
        audioUrl: form.audio_url.trim(),
        rating: Number(form.rating) || 5,
        isFeatured: form.is_featured,
        isActive: form.is_active,
      }

      if (selectedId) {
        const response = await adminProductsService.update(selectedId, payload)
        setProducts((current) => current.map((product) => product.id === selectedId ? response.data : product))
        setMessage('Beat actualizado correctamente.')
      } else {
        const response = await adminProductsService.create(payload)
        setProducts((current) => [response.data, ...current])
        setMessage('Nuevo beat creado correctamente.')
      }

      resetForm()
    } catch (err: any) {
      console.error('Error al guardar beat:', err)
      setError(err.message || 'No se pudo guardar el beat.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await adminProductsService.remove(id)
      setProducts((current) => current.filter((product) => product.id !== id))
      if (selectedId === id) resetForm()
      setMessage('Beat eliminado del panel.')
      setError('')
    } catch (err: any) {
      console.error('Error al eliminar beat:', err)
      setError(err.message || 'No se pudo eliminar el beat.')
    }
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-crimson mb-2">Panel admin</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">GESTIÓN DE BEATS</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={applyExampleProducts}
              className="px-5 py-3 rounded-full border border-crimson/40 bg-crimson/10 text-white hover:bg-crimson/20 transition-colors"
            >
              Vincular beats de ejemplo
            </button>
            <Link to="/tienda" className="inline-flex items-center px-5 py-3 rounded-full bg-gradient-to-r from-crimson to-neon-red text-white font-bold">
              Ver tienda
            </Link>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-200">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.35fr] gap-8">
          <form onSubmit={handleSubmit} className="glass-effect rounded-3xl border border-crimson/20 p-6 h-fit">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-crimson">Editor</p>
                <h2 className="text-2xl font-bold text-white">{selectedId ? 'Editar beat' : 'Nuevo beat'}</h2>
              </div>
              <div className="rounded-full bg-crimson/15 p-3">
                <Plus className="w-5 h-5 text-crimson" />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Nombre</label>
                <input
                  value={form.name}
                  onChange={(event) => handleFieldChange('name', event.target.value)}
                  className="w-full rounded-xl border border-crimson/30 bg-space-black/60 px-4 py-3 text-white outline-none focus:border-crimson"
                  placeholder="Beat nombre"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Slug</label>
                <input
                  value={form.slug}
                  onChange={(event) => handleFieldChange('slug', event.target.value)}
                  className="w-full rounded-xl border border-crimson/30 bg-space-black/60 px-4 py-3 text-white outline-none focus:border-crimson"
                  placeholder="beat-nombre"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Categoría</label>
                  <select
                    value={form.category_slug}
                    onChange={(event) => handleFieldChange('category_slug', event.target.value)}
                    className="w-full rounded-xl border border-crimson/30 bg-space-black/60 px-4 py-3 text-white outline-none focus:border-crimson"
                  >
                    <option value="beats">beats</option>
                    <option value="instrumentales">instrumentales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(event) => handleFieldChange('price', event.target.value)}
                    className="w-full rounded-xl border border-crimson/30 bg-space-black/60 px-4 py-3 text-white outline-none focus:border-crimson"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Descripción</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) => handleFieldChange('description', event.target.value)}
                  className="w-full rounded-xl border border-crimson/30 bg-space-black/60 px-4 py-3 text-white outline-none focus:border-crimson resize-none"
                  placeholder="Descripción del beat..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Ícono / foto</label>
                  <div className="flex items-center gap-2 rounded-xl border border-crimson/30 bg-space-black/60 px-4 py-3 text-white">
                    <ImageIcon className="w-4 h-4 text-crimson" />
                    <input
                      value={form.image_url}
                      onChange={(event) => handleFieldChange('image_url', event.target.value)}
                      className="w-full bg-transparent outline-none"
                      placeholder="🌆 o URL"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Audio URL</label>
                  <div className="flex items-center gap-2 rounded-xl border border-crimson/30 bg-space-black/60 px-4 py-3 text-white">
                    <Music4 className="w-4 h-4 text-crimson" />
                    <input
                      value={form.audio_url}
                      onChange={(event) => handleFieldChange('audio_url', event.target.value)}
                      className="w-full bg-transparent outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Rating</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={(event) => handleFieldChange('rating', event.target.value)}
                    className="w-full rounded-xl border border-crimson/30 bg-space-black/60 px-4 py-3 text-white outline-none focus:border-crimson"
                  />
                </div>

                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(event) => handleFieldChange('is_featured', event.target.checked)}
                      className="h-4 w-4 accent-crimson"
                    />
                    Destacado
                  </label>
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(event) => handleFieldChange('is_active', event.target.checked)}
                      className="h-4 w-4 accent-crimson"
                    />
                    Activo
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-full bg-gradient-to-r from-crimson to-neon-red px-6 py-3 font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </span>
                ) : selectedId ? 'Guardar cambios' : 'Crear beat'}
              </button>
              {selectedId && (
                <button type="button" onClick={resetForm} className="rounded-full border border-white/20 px-5 py-3 text-white">
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <section className="space-y-6">
            <div className="glass-effect rounded-3xl border border-crimson/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-crimson">Resumen</p>
                  <h3 className="text-2xl font-bold text-white">Inventario actual</h3>
                </div>
                <div className="rounded-full bg-crimson/15 p-3">
                  <Package className="w-5 h-5 text-crimson" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-crimson/20 bg-black/20 p-4">
                  <p className="text-gray-400 text-sm">Beats</p>
                  <p className="text-3xl font-bold text-white mt-2">{products.length}</p>
                </div>
                <div className="rounded-2xl border border-crimson/20 bg-black/20 p-4">
                  <p className="text-gray-400 text-sm">Destacados</p>
                  <p className="text-3xl font-bold text-white mt-2">{products.filter((item) => item.is_featured).length}</p>
                </div>
                <div className="rounded-2xl border border-crimson/20 bg-black/20 p-4">
                  <p className="text-gray-400 text-sm">Valor total</p>
                  <p className="text-3xl font-bold text-white mt-2">€{totalValue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-3xl border border-crimson/20 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-crimson">Tienda</p>
                  <h3 className="text-2xl font-bold text-white">Beats existentes</h3>
                </div>
                <Sparkles className="w-5 h-5 text-crimson" />
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-10 text-crimson">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : products.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-crimson/30 bg-black/10 p-6 text-center text-gray-400">
                    No hay beats cargados todavía.
                  </div>
                ) : (
                  products.map((product) => (
                    <div key={product.id} className="rounded-2xl border border-crimson/20 bg-black/20 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-crimson/30 to-space-black text-3xl">
                          {product.image_url}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xl font-bold text-white">{product.name}</p>
                            {product.is_featured && (
                              <span className="rounded-full bg-crimson/20 px-2 py-1 text-[10px] font-bold uppercase text-crimson">
                                Destacado
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400">/{product.slug}</p>
                          <p className="text-sm text-gray-300">€{product.price} · {product.category_slug}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(product)}
                          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:border-crimson/50"
                        >
                          <Pencil className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default AdminPanelPage
