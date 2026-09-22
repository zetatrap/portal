import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import StarField from './components/StarField'
import Home from './pages/Home'
import Store from './pages/Store'
import Register from './pages/Register'

function App() {
  return (
    <Router>
      <div className="relative min-h-screen bg-deep-black">
        <StarField />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tienda" element={<Store />} />
          <Route path="/registro" element={<Register />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
