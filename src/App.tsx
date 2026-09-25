import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import StarField from './components/StarField'
import { CartProvider } from './context/CartContext'
import Home from './pages/Home'
import Store from './pages/Store'
import Register from './pages/Register'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import PurchaseFormPage from './pages/PurchaseFormPage'
import AdminPanelPage from './pages/AdminPanelPage'

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="relative min-h-screen bg-deep-black">
          <StarField />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tienda" element={<Store />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/purchase-form" element={<PurchaseFormPage />} />
            <Route path="/admin" element={<AdminPanelPage />} />
          </Routes>
        </div>
      </CartProvider>
    </Router>
  )
}

export default App
