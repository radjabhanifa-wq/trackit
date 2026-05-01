import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-600">TrackIt</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Bonjour, {user?.nom} 👋</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-red-600 transition"
          >
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Solde du mois</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">0 FCFA</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Total dépenses</p>
            <p className="text-2xl font-bold text-red-500 mt-1">0 FCFA</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Total revenus</p>
            <p className="text-2xl font-bold text-green-500 mt-1">0 FCFA</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Dernières transactions
          </h2>
          <p className="text-gray-400 text-sm text-center py-8">
            Aucune transaction pour le moment
          </p>
        </div>
      </div>
    </div>
  )
}