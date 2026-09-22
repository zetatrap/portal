import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Music, Users, Check, Rocket, AlertCircle } from 'lucide-react'
import { authService } from '../services/api'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    artistName: '',
    role: 'artist',
    acceptTerms: false,
  })

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validación de contraseñas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        artistName: formData.artistName,
        role: formData.role,
      })

      console.log('✅ Registro exitoso:', response)
      setSubmitted(true)
    } catch (err: any) {
      console.error('❌ Error en registro:', err)
      setError(err.message || 'Error al registrar. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="text-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-32 h-32 mx-auto mb-8 flex items-center justify-center"
          >
            <Rocket className="w-full h-full text-crimson" />
          </motion.div>
          
          <h2 className="text-5xl font-bold mb-6 text-gradient">
            ¡BIENVENIDO A LA ORDEN!
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Tu viaje por el universo musical acaba de comenzar
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="glass-effect p-8 rounded-2xl neon-border max-w-md mx-auto"
          >
            <p className="text-gray-400 mb-4">
              Hemos enviado un enlace de activación a <span className="text-crimson font-bold">{formData.email}</span>
            </p>
            <p className="text-sm text-gray-500">
              Revisa tu bandeja de entrada y prepárate para despegar 🚀
            </p>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 relative">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            UNIRSE A LA ORDEN
          </h1>
          <p className="text-xl text-gray-400">
            Inicia tu travesía hacia el éxito musical galáctico
          </p>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="glass-effect rounded-3xl p-8 md:p-12 neon-border"
        >
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center space-x-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-200">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-300 font-semibold">
                  <User className="w-5 h-5 mr-2 text-crimson" />
                  Nombre Completo
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-space-black/50 border border-crimson/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-crimson focus:shadow-lg focus:shadow-crimson/20 transition-all duration-300"
                  placeholder="Tu nombre"
                />
              </div>

              {/* Artist Name */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-300 font-semibold">
                  <Music className="w-5 h-5 mr-2 text-crimson" />
                  Nombre Artístico
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  name="artistName"
                  value={formData.artistName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-space-black/50 border border-crimson/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-crimson focus:shadow-lg focus:shadow-crimson/20 transition-all duration-300"
                  placeholder="Tu alias estelar"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center text-gray-300 font-semibold">
                <Mail className="w-5 h-5 mr-2 text-crimson" />
                Correo Electrónico
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-space-black/50 border border-crimson/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-crimson focus:shadow-lg focus:shadow-crimson/20 transition-all duration-300"
                placeholder="tu@email.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-300 font-semibold">
                  <Lock className="w-5 h-5 mr-2 text-crimson" />
                  Contraseña
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-space-black/50 border border-crimson/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-crimson focus:shadow-lg focus:shadow-crimson/20 transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-300 font-semibold">
                  <Lock className="w-5 h-5 mr-2 text-crimson" />
                  Confirmar Contraseña
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-space-black/50 border border-crimson/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-crimson focus:shadow-lg focus:shadow-crimson/20 transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="flex items-center text-gray-300 font-semibold">
                <Users className="w-5 h-5 mr-2 text-crimson" />
                Tu Rol en el Universo
              </label>
              <motion.select
                whileFocus={{ scale: 1.01 }}
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-space-black/50 border border-crimson/30 rounded-lg text-white focus:outline-none focus:border-crimson focus:shadow-lg focus:shadow-crimson/20 transition-all duration-300"
              >
                <option value="artist">Artista / Músico</option>
                <option value="producer">Productor</option>
                <option value="dj">DJ</option>
                <option value="label">Sello Discográfico</option>
                <option value="other">Otro</option>
              </motion.select>
            </div>

            {/* Terms */}
            <motion.div 
              whileHover={{ x: 5 }}
              className="flex items-start space-x-3 p-4 glass-effect rounded-lg border border-crimson/20"
            >
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                required
                className="mt-1 w-5 h-5 accent-crimson cursor-pointer"
              />
              <label className="text-sm text-gray-400 cursor-pointer">
                Acepto los términos y condiciones de La Orden Crew, incluyendo la exploración 
                de nuevos horizontes musicales y el compromiso con la excelencia artística 
                interestelar.
              </label>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(220, 20, 60, 0.6)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!formData.acceptTerms || loading}
              className="w-full px-8 py-4 bg-gradient-to-r from-crimson to-neon-red text-white font-bold text-lg rounded-full shadow-lg shadow-crimson/50 hover:shadow-crimson/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>PROCESANDO...</span>
                </>
              ) : (
                <>
                  <Check className="w-6 h-6" />
                  <span>INICIAR TRANSMISIÓN</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-400">
              ¿Ya eres miembro de la orden?{' '}
              <a href="#" className="text-crimson hover:text-neon-red font-bold transition-colors duration-300">
                Inicia Sesión
              </a>
            </p>
          </motion.div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              title: 'Acceso Exclusivo',
              description: 'Contenido premium y herramientas profesionales',
            },
            {
              title: 'Comunidad Global',
              description: 'Conecta con artistas de todo el universo',
            },
            {
              title: 'Soporte 24/7',
              description: 'Asistencia continua en tu viaje musical',
            },
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="glass-effect p-6 rounded-xl border border-crimson/20 text-center"
            >
              <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
              <p className="text-gray-400 text-sm">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default Register
