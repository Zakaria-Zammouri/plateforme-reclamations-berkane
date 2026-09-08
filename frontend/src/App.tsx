import { Route, Routes } from 'react-router-dom'

import Accueil from './pages/Accueil'
import APropos from './pages/APropos'
import Contact from './pages/Contact'
import Connexion from './pages/Connexion'
import Dashboard from './pages/Dashboard'
import DashboardAgent from './pages/DashboardAgent'
import DashboardAdmin from './pages/DashboardAdmin'
import DetailReclamation from './pages/DetailReclamation'
import GestionUtilisateurs from './pages/GestionUtilisateurs'
import Inscription from './pages/Inscription'
import NouvelleReclamation from './pages/NouvelleReclamation'

function App() {
  return (
    <Routes>
      {/* Pages publiques */}
      <Route path="/" element={<Accueil />} />
      <Route path="/a-propos" element={<APropos />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/connexion" element={<Connexion />} />
      <Route path="/inscription" element={<Inscription />} />

      {/* Espace citoyen */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route
        path="/reclamations/nouvelle"
        element={<NouvelleReclamation />}
      />
      <Route
        path="/reclamations/:id"
        element={<DetailReclamation />}
      />

      {/* Espace agent */}
      <Route
        path="/agent/dashboard"
        element={<DashboardAgent />}
      />

      {/* Espace administrateur */}
      <Route
        path="/admin/dashboard"
        element={<DashboardAdmin />}
      />
      <Route
        path="/admin/utilisateurs"
        element={<GestionUtilisateurs />}
      />
    </Routes>
  )
}

export default App