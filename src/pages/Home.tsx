import { motion } from 'framer-motion'
import { Music, Rocket, Globe, Users, Mail, Phone, MapPin, Sparkles, Send, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { contactService } from '../services/api'

const Home = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [contactLoading, setContactLoading] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)
  const [contactError, setContactError] = useState('')

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactError('')
    setContactLoading(true)

    try {
      const response = await contactService.send(contactForm)
      console.log('✅ Mensaje enviado:', response)
      setContactSuccess(true)
      setContactForm({ name: '', email: '', message: '' })
      
      // Reset success message after 5 seconds
      setTimeout(() => setContactSuccess(false), 5000)
    } catch (err: any) {
      console.error('❌ Error al enviar mensaje:', err)
      setContactError(err.message || 'Error al enviar mensaje')
    } finally {
      setContactLoading(false)
    }
  }

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-crimson/5 to-transparent"></div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center px-4"
        >
          <motion.div
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="mb-8"
          >
            <Sparkles className="w-16 h-16 text-crimson mx-auto animate-pulse-slow" />
          </motion.div>

          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl md:text-8xl font-bold mb-6 text-gradient"
          >
            LA ORDEN CREW
          </motion.h1>

          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-3xl text-gray-300 mb-8 tracking-wide"
          >
            SELLO MUSICAL DEL FUTURO
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            Explorando los límites del universo sonoro. Donde la música trasciende las fronteras
            del espacio y el tiempo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link to="/tienda">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(220, 20, 60, 0.6)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-crimson to-neon-red text-white font-bold text-lg rounded-full shadow-lg shadow-crimson/50 hover:shadow-crimson/70 transition-all duration-300"
              >
                EXPLORAR TIENDA
              </motion.button>
            </Link>

            <Link to="/registro">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 glass-effect neon-border text-white font-bold text-lg rounded-full hover:bg-crimson/20 transition-all duration-300"
              >
                UNIRSE A LA ORDEN
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-1/4 left-10 w-20 h-20 border-2 border-crimson/30 rounded-full"
        />
        
        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [360, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute bottom-1/4 right-10 w-32 h-32 border-2 border-neon-red/20 rounded-full"
        />
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-bold text-center mb-16 text-gradient"
          >
            EL UNIVERSO SONORO
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Music,
                title: 'BEATS PROFESIONALES',
                description: 'Instrumentales únicos creados con tecnología de vanguardia y pasión interestelar.',
              },
              {
                icon: Rocket,
                title: 'PRODUCCIÓN ESPACIAL',
                description: 'Sonidos que trascienden dimensiones. Experiencias auditivas fuera de este mundo.',
              },
              {
                icon: Globe,
                title: 'ALCANCE UNIVERSAL',
                description: 'Distribución global para artistas que buscan conquistar el cosmos musical.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                className="glass-effect p-8 rounded-2xl neon-border group hover:shadow-2xl hover:shadow-crimson/30 transition-all duration-300"
              >
                <feature.icon className="w-16 h-16 text-crimson mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 relative bg-gradient-to-b from-transparent via-crimson/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="glass-effect p-12 rounded-3xl neon-border"
          >
            <div className="flex items-center justify-center mb-8">
              <Users className="w-12 h-12 text-crimson mr-4" />
              <h2 className="text-4xl md:text-5xl font-bold text-gradient">QUIÉNES SOMOS</h2>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="space-y-6 text-gray-300 text-lg leading-relaxed"
            >
              <p>
                <span className="text-crimson font-bold">La Orden Crew</span> es más que un sello musical; 
                somos una expedición intergaláctica hacia los confines inexplorados del sonido. Nacidos 
                en la confluencia del arte y la tecnología, navegamos por el cosmos digital creando 
                experiencias auditivas que desafían las leyes del espacio-tiempo musical.
              </p>
              <p>
                Nuestra misión es proporcionar a artistas visionarios las herramientas y el soporte necesario 
                para materializar sus creaciones más audaces. Desde beats que resuenan con la energía de 
                supernovas hasta aplicaciones que revolucionan la creación musical.
              </p>
              <p>
                Creemos en el poder transformador de la música y en su capacidad para conectar almas a 
                través de las vastas distancias del universo. <span className="text-neon-red font-bold">
                Únete a nuestra orden</span> y forma parte de la próxima evolución musical.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {[
                { number: '500+', label: 'BEATS' },
                { number: '50+', label: 'ARTISTAS' },
                { number: '10M+', label: 'STREAMS' },
                { number: '30+', label: 'PAÍSES' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                    className="text-3xl md:text-4xl font-bold text-gradient mb-2"
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-sm text-gray-400 tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-bold text-center mb-16 text-gradient"
          >
            CONTACTAR
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12"
          >
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="glass-effect p-6 rounded-xl neon-border hover:shadow-lg hover:shadow-crimson/20 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <Mail className="w-8 h-8 text-crimson" />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Email</h3>
                    <p className="text-gray-400">contact@laordencrew.com</p>
                  </div>
                </div>
              </div>

              <div className="glass-effect p-6 rounded-xl neon-border hover:shadow-lg hover:shadow-crimson/20 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <Phone className="w-8 h-8 text-crimson" />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Teléfono</h3>
                    <p className="text-gray-400">+34 900 123 456</p>
                  </div>
                </div>
              </div>

              <div className="glass-effect p-6 rounded-xl neon-border hover:shadow-lg hover:shadow-crimson/20 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <MapPin className="w-8 h-8 text-crimson" />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Ubicación</h3>
                    <p className="text-gray-400">Sector Estelar 7, Vía Láctea</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-effect p-8 rounded-xl neon-border">
              <h3 className="text-2xl font-bold text-white mb-6">Envíanos un mensaje</h3>
              
              {contactSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg flex items-center space-x-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-green-200">¡Mensaje enviado con éxito! Te contactaremos pronto 🚀</p>
                </motion.div>
              )}

              {contactError && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg"
                >
                  <p className="text-red-200">{contactError}</p>
                </motion.div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  placeholder="Nombre"
                  required
                  className="w-full px-4 py-3 bg-space-black/50 border border-crimson/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-crimson transition-colors duration-300"
                />
                <input
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  placeholder="Email"
                  required
                  className="w-full px-4 py-3 bg-space-black/50 border border-crimson/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-crimson transition-colors duration-300"
                />
                <textarea
                  rows={4}
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  placeholder="Mensaje"
                  required
                  minLength={10}
                  className="w-full px-4 py-3 bg-space-black/50 border border-crimson/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-crimson transition-colors duration-300 resize-none"
                ></textarea>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={contactLoading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-crimson to-neon-red text-white font-bold rounded-lg shadow-lg shadow-crimson/50 hover:shadow-crimson/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {contactLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>ENVIANDO...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>ENVIAR TRANSMISIÓN</span>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-crimson/20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            © 2026 <span className="text-crimson font-bold">La Orden Crew</span>. 
            Todos los derechos reservados en el multiverso.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home
