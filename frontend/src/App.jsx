import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import PrivateRoute from './auth/PrivateRoute'

import Analise from './pages/Analises'
import NovaAnalise from './pages/NovaAnalise'
import Login from './pages/Login'
import LayoutPrivado from './auth/LayoutPrivado'
import ResultadoAnalise from './pages/ResultadoAnalise'

import Referencia from './pages/Referencias'

import NovoLivro from './pages/LivroNovo'
import LivroVisualizar from './pages/LivroVisualizar'

import Minutas from './pages/Minutas'
import MinutaForm from './pages/MinutaForm'

import Configuracoes from './pages/Configuracoes'
import UsuarioForm from './pages/UsuarioForm'
import PerfilForm from './pages/PerfilForm'
import PermissaoForm from './pages/PermissaoForm'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute><LayoutPrivado /></PrivateRoute>}>
            <Route path="/" element={<Analise />} />
            <Route path="/analises" element={<Analise />} />
            <Route path="/novaAnalise" element={<NovaAnalise />} />
            <Route path="/analises/:id/resultados" element={<ResultadoAnalise />} />

            <Route path="/referencias" element={<Referencia />} />
            <Route path="/livros/novo" element={<NovoLivro />} />
            <Route path="/livros/:id" element={<LivroVisualizar />} />

            <Route path="/minutas" element={<Minutas />} />
            <Route path="/minutas/nova" element={<MinutaForm />} />
            <Route path="/minutas/:id" element={<MinutaForm />} />

            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/usuarios/novo" element={<UsuarioForm />} />
            <Route path="/usuarios/:id" element={<UsuarioForm />} />
            <Route path="/perfis/novo" element={<PerfilForm />} />
            <Route path="/perfis/:id" element={<PerfilForm />} />
            <Route path="/permissoes/novo" element={<PermissaoForm />} />
            <Route path="/permissoes/:id" element={<PermissaoForm />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
