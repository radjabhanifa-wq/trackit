import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import API from '../api'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const CATEGORIES_COULEURS = {
  alimentation: '#8B5CF6',
  transport: '#3B82F6',
  loisirs: '#EC4899',
  sante: '#10B981',
  logement: '#F59E0B',
  autre: '#6B7280'
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    type: 'depense', montant: '', categorie: 'alimentation', description: ''
  })

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const res = await API.get('/transactions/')
      setTransactions(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await API.post('/transactions/', {
        ...form,
        montant: parseFloat(form.montant)
      })
      setForm({ type: 'depense', montant: '', categorie: 'alimentation', description: '' })
      setShowForm(false)
      fetchTransactions()
    } catch (err) {
      console.error(err)
    }
  }

  const totalDepenses = transactions
    .filter(t => t.type === 'depense')
    .reduce((sum, t) => sum + t.montant, 0)

  const totalRevenus = transactions
    .filter(t => t.type === 'revenu')
    .reduce((sum, t) => sum + t.montant, 0)

  const solde = totalRevenus - totalDepenses

  const dataGraphique = Object.entries(
    transactions
      .filter(t => t.type === 'depense')
      .reduce((acc, t) => {
        acc[t.categorie] = (acc[t.categorie] || 0) + t.montant
        return acc
      }, {})
  ).map(([name, value]) => ({ name, value }))

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-600">TrackIt</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Bonjour, {user?.nom} 👋</span>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-purple-700 transition">
            + Ajouter
          </button>
          <button onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-red-600 transition">
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        {showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-4">Nouvelle transaction</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="border rounded-lg px-3 py-2">
                <option value="depense">Dépense</option>
                <option value="revenu">Revenu</option>
              </select>
              <input type="number" placeholder="Montant (FCFA)" value={form.montant}
                onChange={e => setForm({...form, montant: e.target.value})}
                className="border rounded-lg px-3 py-2" required />
              <select value={form.categorie} onChange={e => setForm({...form, categorie: e.target.value})}
                className="border rounded-lg px-3 py-2">
                <option value="alimentation">Alimentation</option>
                <option value="transport">Transport</option>
                <option value="loisirs">Loisirs</option>
                <option value="sante">Santé</option>
                <option value="logement">Logement</option>
                <option value="autre">Autre</option>
              </select>
              <input type="text" placeholder="Description" value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                className="border rounded-lg px-3 py-2" />
              <button type="submit"
                className="col-span-2 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
                Enregistrer
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Solde du mois</p>
            <p className={`text-2xl font-bold mt-1 ${solde >= 0 ? 'text-gray-800' : 'text-red-500'}`}>
              {solde.toLocaleString()} FCFA
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Total dépenses</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{totalDepenses.toLocaleString()} FCFA</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm">Total revenus</p>
            <p className="text-2xl font-bold text-green-500 mt-1">{totalRevenus.toLocaleString()} FCFA</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Dépenses par catégorie</h2>
            {dataGraphique.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={dataGraphique} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {dataGraphique.map((entry, index) => (
                      <Cell key={index} fill={CATEGORIES_COULEURS[entry.name] || '#6B7280'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toLocaleString()} FCFA`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">Aucune dépense pour le moment</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Dernières transactions</h2>
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 5).map(t => (
                  <div key={t.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="text-sm font-medium capitalize">{t.categorie}</p>
                      <p className="text-xs text-gray-400">{t.description}</p>
                    </div>
                    <span className={`font-semibold text-sm ${t.type === 'depense' ? 'text-red-500' : 'text-green-500'}`}>
                      {t.type === 'depense' ? '-' : '+'}{t.montant.toLocaleString()} FCFA
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">Aucune transaction pour le moment</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}